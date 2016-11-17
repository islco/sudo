---
title: Redis Leaderboard
permalink: redis-leaderboard
author: Cornelius Hairston
description: "Creating a high performance leaderboard using Django and
backed by Redis"
---

We built a desktop [game](https://isl.co/work/rival-road/) for one of our clients.  In the game we expected a high volume of traffic, with a number of simultaneous users playing the game. One of the core components of any game is keeping score. In addition to keeping score we need to create a leaderboard to show how players rank against one another.

To accomplish we used Django, backed by Redis. However before we jump into using Redis let's test how we could do this with PostgreSQL and compare the performance of the two. 

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


Now to create our leaderboard, all we need is to just sort by score.
We want to display the top 25 players. To do so we can query our model:

```
Player.objects.order_by('-top_score')[:25]
```

To make things simple we can display these players in a ListView
and loop through the results in our template.


```
<ul>
{% for obj in object_list %}
    <li>{{ obj.name }} - {{ obj.top_score }}</li>
{% endfor %}
</ul>
```

This will give us exactly what we need. 
However when you have a DB with a lot players this can start to be very slow operation.

We profiled our app with 100,000 players and here are the results


### Time
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


|          |       |
|----------|-------|
| CumTime  | 0.000 |
| Per      | 0.000 |
| TotTime  | 0.000 |
| Per      | 0.000 | 
| Count    | 1     | 
Total time: 0.000469 s


This isn't bad for a single request and a template doing only one thing, but we can do better.

We love Postgres as it is fully featured, fast and reliable but maybe we should use a more appropriate data store.
The answer we were looking for is Redis, particularly the sorted sets datatype, worked perfectly for this situation.


`Redis Sorted Sets are, similarly to Redis Sets, non repeating collections of Strings. The difference is that every member of a Sorted Set is associated with score, that is used in order to take the sorted set ordered, from the smallest to the greatest score. While members are unique, scores may be repeated.`
~ [Data Types](http://redis.io/topics/data-types)


To setup Redis to work with Django you need two packages redis-py and django-redis
Add the following to your `settings.py` file.


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


In your `models.py` add the following import and set the `rediscon` variable for use later.
`django-redis` is great for doing basic caching by getting and setting keys. However
we are going use some more advanced features of redis which will require us to use the 
redis client directly.


```
 from django_redis import get_redis_connection


rediscon = get_redis_connection('leaderboard_default')
```

For convenience, override the save method. Now when we save or update a user we save them to redis in our sorted set.


```
    def save(self, *args, **kwargs):
        super(Player, self).save(*args, **kwargs)
        rediscon.zadd('leaderboard', self.top_score, self.name)
```

[zadd](http://redis.io/commands/zadd) adds the player to the sorted set.  top_score is the score and name is the value in the set.  Redis will also update the current score of a player if they already exist.  
[Redis Python Client zadd API](https://redis-py.readthedocs.io/en/latest/#redis.StrictRedis.zadd) 


Now that we have this setup and we are saving players' names and scores to redis, how can we use this data?
To get our top 25 players again we can query redis doing the following:


```
leaderboard = rediscon.zrevrange('leaderboard', 0, 24, withscores=True)
data = [{'name': players[0], 'top_score': players[1]} for players in leaderboard]
```


We created a list called `data`. This will be used to for a dictionary of our leaderboard data. 
Next we can use built-in redis function [zrevrange](http://redis.io/commands/zrevrange) which will give us all the members in the given range sorted by score.
Last, using a list comprehension we populate our list dictionaries.


We can return `data` instead of our normal queryset and use the same template as before


Let's profile our app now
## The Results:


### Time:


|                 |             |
|-----------------|-------------|
| User CPU time   | 17.577 msec |
| System CPU time | 2.775 msec  |
| Total CPU time  | 20.352 msec |
| Elapsed time    | 23.072 msec | 




### SQL
0 SQL queries 


### View
/django/views/generic/base.py in view(61)

|          |       |
|----------|-------|
| CumTime  | 0.006 |
| Per      | 0.006 |
| TotTime  | 0.000 |
| Per      | 0.000 | 
| Count    | 1     | 
Total time: 0.005919 s


There are few things to notice here.
- This is 7 times faster than doing almost the same thing with Postgres
- We have zero SQL queries
- There was a small increase in time on the view function.


From here we can determine the majority of work being done by the server and Redis, and not the database. An additional tradeoff is overhead during the save function, during both saving to the model, database and Redis.  Since saving happens less frequently we will take the greater performance in an area that is accessed far more often.


So far we are pretty happy with these results.




In our game we will more than likely need to display a user's individual rank to a player.
We are going to profile one more important function to see how redis matches up.


If we add this info to the context in one of our views it might look like the following.


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

What we are doing here is counting the number of players with a score greater
than the score of our current player.


## The Results:

## Time
|                 |              |
|-----------------|--------------|
| User CPU time   | 322.079 msec |
| System CPU time | 58.778 msec  |
| Total CPU time  | 380.857 msec |
| Elapsed time    | 448.701 msec | 


### SQL
4.06 ms (2 queries )


### View
/django/views/generic/base.py in view(61)


|          |       |
|----------|-------|
| CumTime  | 0.417 |
| Per      | 0.417 |
| TotTime  | 0.000 |
| Per      | 0.000 | 
| Count    | 1     | 

Total time: 0.453381 s



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


### Time
|                 |             |
|-----------------|-------------|
| User CPU time   | 8.408 msec  |
| System CPU time | 1.262 msec  |
| Total CPU time  | 9.670 msec  |
| Elapsed time    | 15.835 msec | 


### SQL
0 SQL queries 

### View
/django/views/generic/base.py in view(61)

|          |       |
|----------|-------|
| CumTime  | 0.006 |
| Per      | 0.006 |
| TotTime  | 0.000 |
| Per      | 0.000 | 
| Count    | 1     | 



Total time: 0.006418 s


Much like before this has proved to be significantly faster, with no database calls.


To Wrap up
*TODO*
*Add link to github*



&#151;Cornelius Hairston, Software Engineer




