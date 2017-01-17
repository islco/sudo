---
title: Redis Leaderboard
permalink: redis-leaderboard
author: Cornelius Hairston
description: "Creating a high performance leaderboard using Django and backed by Redis"
---

Volkswagen recently contracted ISL to build a web-based video game as part of a larger multi-channel campaign (see: <https://isl.co/work/rival-road/>). Since we expected both high volumes of traffic and a large number of simultaneous users, we knew from the beginning that performance would be critical.

Like many games, one of the core components was keeping score for each player.  In addition to tracking individual scores, we needed to create a leaderboard to show how players ranked against one another and to encourage competition.

Our tech stack consisted of the familiar Djano, PostgreSQL, and Redis. For awhile, we've wanted to leverage some of the more advanced Redis features like sorted sets, and this seemed like the perfect oportunity. Before jumping in though, we established a baseline benchmark against Postgres to let us understand just what performance gains we were getting from Redis.

## The Models

To demonstrate our example, we will create a Player model on which we will save the score.

```python
class Player(models.Model):
    name = models.CharField(
        max_length=10,
        error_messages={'unique': 'Name not available.'})

    top_score = models.FloatField(db_index=True, default=0.0, blank=True)
```


Now, to create our leaderboard, all we need is to just sort by score.  In our case, we want to display the top 25 players. To do so we first query our model:

```python
Player.objects.order_by('-top_score')[:25]
```

Next, we simply display these players in a ListView and loop through the results in the template.


```html
<ul>
{% for obj in object_list %}
    <li>{{ obj.name }} - {{ obj.top_score }}</li>
{% endfor %}
</ul>
```

This will give us exactly what we need. However, when you have a DB with a lot players this can be a very slow operation.


To test, we profiled our app with 100,000 players. Below we have 3 results:

- User CPU - The time the it took your application to process the request.
- System CPU - The time it took the operating system to process the request 
- Total CPU - This is the combination of the User + System CPU Time.
- Elapsed - The time since the request; this include time for the network round-trip.
- View Execution - The time it took run all the functions associated with the view.
- SQL - The number of queries and the time to execute those queries.


## The Results

| Resource       | Time               |
|----------------|--------------------|
| User CPU       | 105.966 ms         |
| System CPU     | 45.221 ms          |
| Total CPU      | 151.187 ms         |
| Elapsed        | 172.241 ms         |
| View Execution | 0.469 ms           |
| SQL            | 1 query in 6.21 ms |

This isn't bad for a single request and a template doing only one thing, but we knew we could do better.

Postgres is fully featured, fast, and reliable.  However, given our specific use case we felt that maybe we should use a more appropriate data store. The answer we were looking for was Redis, particularly the sorted sets datatype, which worked perfectly for this situation.

> Redis Sorted Sets are, similarly to Redis Sets, non repeating collections of Strings. The difference is that every member of a Sorted Set is associated with score, that is used in order to take the sorted set ordered, from the smallest to the greatest score. While members are unique, scores may be repeated.
>
> <cite>[redis.io](https://redis.io/topics/data-types)</cite>

To setup Redis with Django you need two packages, _redis-py_ and _django-redis_.  Add the following to your `settings.py` file.

```python
CACHES = {
    ...
    "leaderboard_default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CONNECTION_POOL_KWARGS": {"decode_responses": True}
        }
    },
}

```
'leaderboard_default' is the name of our cache configuration

Finally, in your `models.py` add the following import and set the `rediscon` variable for use later. While, `django-redis` is great for doing basic caching (getting and setting keys), there are more advanced features that require the use of the redis client directly. `django_redis` provides the interface `get_redis_connection` to expose the client.

```python
from django_redis import get_redis_connection
rediscon = get_redis_connection('leaderboard_default')
```

For convenience, we overrode the save method. This allows us to store the user in our Redis sorted set whenever we save or update a user.

```python
    def save(self, *args, **kwargs):
        super(Player, self).save(*args, **kwargs)
        rediscon.zadd('leaderboard', self.top_score, self.name)
```

[zadd](https://redis.io/commands/zadd) adds the player to the sorted set.top_score is the score and name is the value in the set.  Redis will also update the current score of a player if they already exist. [Redis Python Client zadd API](https://redis-py.readthedocs.io/en/latest/#redis.StrictRedis.zadd)

Now that we have this setup and are saving players' names and scores to redis, how can we use this data? To get our top 25 players again we can query redis with the following:

```
leaderboard = rediscon.zrevrange('leaderboard', 0, 24, withscores=True)
data = [{'name': players[0], 'top_score': players[1]} for players in leaderboard]
```

We can use a built-in redis function [zrevrange](http://redis.io/commands/zrevrange) to give us all of the members in a given range sorted by score. Next, using list comprehension we populate our list of dictionaries that contains the data for the leaderboard.

We return `data` instead of our normal queryset and use the same template as before

Let's profile our app now.

## The Results:

| Resource       | Time      |
|----------------|-----------|
| User CPU       | 17.577 ms |
| System CPU     | 2.775 ms  |
| Total CPU      | 20.352 ms |
| Elapsed        | 23.072 ms |
| View Execution | 5.919 ms  |
| SQL            | 0 queries |

There are few things to notice here.

- This is 7 times faster than comparable functionality with Postgres.
- We have zero SQL queries.
- There was a small increase in time on the view function.

From this we can determine that the majority of work is being done by the server and Redis, not the database. An additional tradeoff here is overhead during the save function; for both saving to the model, database, and Redis. However, since saving happens less frequently, it seems reasonable to take the increased performance in an area that is accessed far more often and give up performance in the less critical component. We calculate leaders far more often than we make new users.

The leaderboard wasn’t the only area where switching to redis resulted in considerable performance gains. In the game we also needed to display a user's individual rank to each player. We will profile one more important function to see how redis matches up.

Add this info to the context in one of the view.

```
def get_context_data(self, **kwargs):
    context = super(PlayerView, self).get_context_data(**kwargs)
    # For simplicity we are hardcoding the user.
    # In practice this will come from a request.
    player = Player.objects.get(name='FEG6MMR6HB')
    ranking = Player.objects.filter(top_score__gt=player.top_score).count()
    context['rank'] = ranking
    return context
```

The logic here is to simply count the number of players with a score greater than the score of the current player.

## The Results:

| Resource       | Time                  |
|----------------|-----------------------|
| User CPU       | 322.079 ms            |
| System CPU     | 58.778 ms             |
| Total CPU      | 380.857 ms            |
| Elapsed        | 448.701 ms            |
| View Execution | 453.381ms             |
| SQL            |  2 queries in 4.06 ms |

Now to compare this to Redis.

Redis's sorted set has a built in function [zrevrank](http://redis.io/commands/zrevrank) which returns the rank.

```python
    def get_context_data(self, **kwargs):
        context = super(PlayerView, self).get_context_data(**kwargs)
        rank = rediscon.zrevrank('leaderboard', 'FEG6MMR6HB')
        context['rank'] = rank + 1
        return context
```

We pass in two values: 'leaderboard' is the name of our sortedset, 'FEG6MMR6HB' is the player name. The rank is zero-based so we add 1 to the rank.

## The Results

| Resource       | Time      |
|----------------|-----------|
| User CPU       | 8.408 ms  |
| System CPU     | 1.262 ms  |
| Total CPU      | 9.670 ms  |
| Elapsed        | 15.835 ms |
| View Execution | 6.418 ms  |
| SQL            | 0 queries |

Much like before this has proved to be significantly faster, with no database calls.

## To Wrap Up

In our specific use case of creating the leaderboard and individual rankings, switching to Redis simplified our code, and improved performance. Redis contained the functionality we desired out of the box and saved us from reinventing the wheel using Django queries that were not performant for the scale of the application.
