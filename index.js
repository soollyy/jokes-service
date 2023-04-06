const express = require('express');
const app = express();
const { Joke } = require('./db');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/jokes/', async (req, res, next) => {
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
      const contentArray = content.split(',')
      if (Array.isArray(jokes)) {
        jokes = jokes.filter(joke => { 
          return contentArray.every(content => joke.joke.includes(content))
        });
      } else {
        jokes = [];
      }
    }
    //because in Joke.js the table defines joke and tags, line 26 should be joke.joke.includes instead of joke.content.includes because there is no content table only joke and tags.
    //line 26- can be return contentArray.some so its not strict compared to tagArray where it is strict. both .every and .some work the same
    
    res.send(jokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
})

app.post('/jokes/', async (req, res, next) => {
  try {
    const { setup, punchline } = req.body; // extratcs the setup and punchline fields from the request body
    const newJoke = await Joke.create({ setup, punchline }); // creates a new joke and add it to the database using the create method of the Joke model

    res.status(200).json({ message: 'Joke added successfully' }); // sends a response indicating that the joke was added successfully
  } catch (error) { // If an error occurs while adding the joke
      res.status(500).json({ message: 'Failed to add joke' }); // sends a response with an error message
  }
});

app.use(express.json()); // uses middleware to parse the request body



// we export the app, not listening in here, so that we can run tests
module.exports = app;


//TODO:
//A fully complete GET /jokes route should:

// Return a list of all jokes when no query string parameters are provided

// Return a list of jokes, filtered by tag for GET /jokes?tag=YOUR_QUERY_HERE

// Return a list of jokes, filtered by content GET /jokes?content=YOUR_QUERY_HERE


//EXTENTION:

// Implement one or all of the following routes. Write your process, step by step on each line, dont forget to comment them out ( // )

// POST /jokes: Adds a joke to the database. Should accept both columns in the req.body

// DELETE /jokes/:id: Removes a joke from the database, by ID.

// PUT /jokes/:id: Edits a joke by ID.  Should accept both/either columns in the req.body

//For the DELETE and PUT routes, be sure to send back an error (by calling next) if no joke exists that matches the ID (i.e. if it was previously deleted, or if it was never added.



// FURTHER EXTENSION:

//As an added challenge, try your hand at writing tests for the above routes! Use the preexisting tests as a guide



