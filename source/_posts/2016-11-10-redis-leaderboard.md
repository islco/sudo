---
title: Redis Leaderboard
permalink: redis-leaderboard
author: Cornelius Hairston
description: "Creating a high performance leaderboard using Django and
backed by Redis"
---

We were recently contracted to build a web based [game](https://isl.co/work/rival-road/) for one of our clients.  We expected both high volumes of traffic, with a number of simultaneous users. Thus, we knew from the beginning that performance would be critical.  

Like many games, one of the core components of our game was keeping score for each player. In addition to keeping individual scores we needed to create a leaderboard to show how players rank against one another and encourage users to compete.

To accomplish we used Django, backed by Redis. However, before we jump into using Redis we wanted to have a baseline benchmark. Thus, let's test how this would perform with PostgreSQL and later compare the performance of the two. 


*Note there is additional caching we can perform that will not be covered in the post.


At first this can be very straightforward. We create a Player model and on the player model we save the score.


Here is a basic example of the model:
```
class Player(models.Model):
    name = models.CharField(
        max_length=10,
        error_messages={'unique': 'Name not available.'})
    top_score = models.FloatField(db_index=True, default=0.0, blank=True)
```


Now, to create our leaderboard, all we need is to just sort by score.  In our case, we want to display the top 25 players. To do so we first query our model:

```
Player.objects.order_by('-top_score')[:25]
```

Next, we simply display these players in a ListView and loop through the results in the template.


```
<ul>
{% for obj in object_list %}
    <li>{{ obj.name }} - {{ obj.top_score }}</li>
{% endfor %}
</ul>
```

This will give us exactly what we need. 
However when you have a DB with a lot players this can be a very slow operation.


We profiled our app with 100,000 players and here are the results. 
Below we have 3 results:
Total Time is a break of time it took the applicaiton to perform an action. Elapsted time is the time from start to finish since the request was made.
SQL is the number of queries and the time it took to execute the queries.
View is the time it took run all the functions associated with the view.


### Total Time
|                 |              |
|-----------------|--------------|
| User CPU time   | 105.966 msec |
| System CPU time | 45.221 msec  |
| Total CPU time  | 151.187 msec |
| Elapsed time    | 172.241 msec | 


### SQL
6.21 ms (1 query )


### View
/django/views/generic/base.py in view(61)

time: 0.000469 s

|          |       |
|----------|-------|
| CumTime  | 0.000 |
| Per      | 0.000 |
| TotTime  | 0.000 |
| Per      | 0.000 | 
| Count    | 1     | 




This isn't bad for a single request and a template doing only one thing, but we knew we could do better.


Postgres is fully featured, fast, and reliable.  However, given our specific use case we felt that maybe we should use a more appropriate data store.
The answer we were looking for was Redis, particularly the sorted sets datatype, which worked perfectly for this situation.


`Redis Sorted Sets are, similarly to Redis Sets, non repeating collections of Strings. The difference is that every member of a Sorted Set is associated with score, that is used in order to take the sorted set ordered, from the smallest to the greatest score. While members are unique, scores may be repeated.`
~ [Data Types](http://redis.io/topics/data-types)


To setup Redis with Django you need two packages redis-py and django-redis.
Next, add the following to your `settings.py` file.


```
    "leaderboard_default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CONNECTION_POOL_KWARGS": {"decode_responses": True}
        }
    },
```
'leaderboard' is the name of our cache configuration


Finally, in your `models.py` add the following import and set the `rediscon` variable for use later. While, `django-redis` is great for doing basic caching - getting and setting keys - However there are more advanced features of redis which require us to use the redis client directly.  `django_redis` provides interface `get_redis_connection` to expose the client.


```
from django_redis import get_redis_connection
rediscon = get_redis_connection('leaderboard_default')
```

For convenience, overrode the save method for convenience. Thus, when we save or update a user we store them in redis in our sorted set.


```
    def save(self, *args, **kwargs):
        super(Player, self).save(*args, **kwargs)
        rediscon.zadd('leaderboard', self.top_score, self.name)
```

[zadd](http://redis.io/commands/zadd) adds the player to the sorted set.  top_score is the score and name is the value in the set.  Redis will also update the current score of a player if they already exist.  
[Redis Python Client zadd API](https://redis-py.readthedocs.io/en/latest/#redis.StrictRedis.zadd) 



Now that we have this setup and are saving players' names and scores to redis, how can we use this data?
To get our top 25 players again we can query redis with the following:


```
leaderboard = rediscon.zrevrange('leaderboard', 0, 24, withscores=True)
data = [{'name': players[0], 'top_score': players[1]} for players in leaderboard]
```


We can use a built-in redis function [zrevrange](http://redis.io/commands/zrevrange) which will give us all the members in the given range sorted by score.
Next, using list comprehension we populate our list of dictionaries that contains the data for the leaderboard.. 




We return `data` instead of our normal queryset and use the same template as before




Let's profile our app now.
## The Results:


### Total Time:


|                 |             |
|-----------------|-------------|
| User CPU time   | 17.577 msec |
| System CPU time | 2.775 msec  |
| Total CPU time  | 20.352 msec |
| Elapsed time    | 23.072 msec | 




### SQL
0 SQL queries 


### View
`/django/views/generic/base.py in view(61)`

time: 0.005919 s

|          |       |
|----------|-------|
| CumTime  | 0.006 |
| Per      | 0.006 |
| TotTime  | 0.000 |
| Per      | 0.000 | 
| Count    | 1     | 



There are few things to notice here.
- This is 7 times faster than comparable functionality with Postgres.
- We have zero SQL queries. 
- There was a small increase in time on the view function.


From this we can determine the majority of work being done by the server and Redis, and not the database. An additional tradeoff here is overhead during the save function; for both saving to the model, database, and Redis.  However, since saving happens less frequently it seems reasonable to take the increased performance in an area that is accessed far more often and give up performance in the less critical component.  We calculate leaders far more than we make new users.  



The leaderboard wasn’t the only area where switching to redis resulted in considerable performance gains.  
In the game we  also needed to display a user's individual rank to each player.
We are going to profile one more important function to see how redis matches up.



Add this info to the context in one of the view.


```
def get_context_data(self, **kwargs):
    context = super(PlayerView, self).get_context_data(**kwargs)
    # For simplicity we are hardcoding the user, in practice
    # This will come from a request.
    player = Player.objects.get(name='FEG6MMR6HB')
    ranking = Player.objects.filter(top_score__gt=player.top_score).count()
    context['rank'] = ranking
    return context
```

The logic here is to simply count the number of players with a score greater than the score of the current player.


## The Results:

## Total Time

|                  |              |
|------------------|--------------|
| User CPU time    | 322.079 msec |
| System CPU time  | 58.778 msec  |
| Total CPU time   | 380.857 msec |
| Elapsed time     | 448.701 msec | 


### SQL
4.06 ms (2 queries )


### View
`/django/views/generic/base.py in view(61)`

time: 0.453381 s

|           |       |
|-----------|-------|
| CumTime   | 0.417 |
| Per       | 0.417 |
| TotTime   | 0.000 |
| Per       | 0.000 | 
| Count     | 1     | 





Now to compare this to Redis.
Redis's sorted set has a built in function [zrevrank](http://redis.io/commands/zrevrank) which returns the rank.


```
    def get_context_data(self, **kwargs):
        context = super(PlayerView, self).get_context_data(**kwargs)
        rank = rediscon.zrevrank('leaderboard', 'FEG6MMR6HB')
        context['rank'] = rank + 1
        return context
```


We pass in two values: 'leaderboard' is the name of our sortedset, 'FEG6MMR6HB' is the player name.
The rank is 0-based so we add 1 to the rank.
[Redis Python Client zrevrank API](https://redis-py.readthedocs.io/en/latest/#redis.StrictRedis.zrevrank) 


## The Results


### Total Time

|                  |             |
|------------------|-------------|
| User CPU time    | 8.408 msec  |
| System CPU time  | 1.262 msec  |
| Total CPU time   | 9.670 msec  |
| Elapsed time     | 15.835 msec | 


### SQL
0 SQL queries 

### View
`/django/views/generic/base.py in view(61)`

time: 0.006418 s

|           |       |
|-----------|-------|
| CumTime   | 0.006 |
| Per       | 0.006 |
| TotTime   | 0.000 |
| Per       | 0.000 | 
| Count     | 1     | 





Much like before this has proved to be significantly faster, with no database calls.



### To Wrap up
In our specific use case, of creating the leaderboard and individual rankings, switching to Redis simplified our code, and improved critical performance.   Redis contained the functionality we desired out of the box and saved us from reinventing the wheel using Django queries that were not performant for the scale of the application. 



&#151;Cornelius Hairston, Software Engineer




