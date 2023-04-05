const express = require('express');
const app = express();
const { Joke } = require('./db');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/jokes', async (req, res, next) => {
  try {
    const { tags, content } = req.query;
    let jokes = await Joke.findAll({
      where: {},
    });
    
    if (tags) {
      const tagArray = tags.split(',');
      jokes = jokes.filter(joke => {
        return tagArray.every(tag => joke.tags.includes(tag));
      });
    }

    if (content) {
      const contentArray = content.split(' ')
      if (Array.isArray(jokes)) {
        jokes = jokes.filter(joke => { 
          return contentArray.some(content => joke.joke.includes(content))
        });
      } else {
        jokes = [];
      }
    }
    //because in Joke.js the table defines joke and tags, line 26 should be joke.joke.includes instead of joke.content.includes because there is no content table only joke and tags.
    
    res.send(jokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// we export the app, not listening in here, so that we can run tests
module.exports = app;


//TODO:
//A fully complete GET /jokes route should:

// Return a list of all jokes when no query string parameters are provided

// Return a list of jokes, filtered by tag for GET /jokes?tag=YOUR_QUERY_HERE

// Return a list of jokes, filtered by content GET /jokes?content=YOUR_QUERY_HERE