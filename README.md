# sudo ISL

The [Hexo](https://hexo.io/) Powered ISL Engineering Blog

## Installation

    $ nvm install
    $ npm install

## Quick Start

    $ nvm use
    $ npm run dev

If you want to change the port that Hexo uses, set the $PORT environment variable:

    $ PORT=8000 npm run dev

##  Write a New Post

1. Create a new post by running `npm run hexo new post "my blog post title"`
2. Write your blog post in markdown (make sure to follow the directions in the
sample post)
3. Submit a pull request when you're finished
4. Have (at least) one other person review your post
5. ???
6. Profit

## Deployment

Build site into `public` and cachebust the assets:

    $ npm run build

## Documentation

See: <https://hexo.io/docs/>
