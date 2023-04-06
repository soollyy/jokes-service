const app = require('./index');
const { sequelize, Joke } = require('./db');
const request = require('supertest');
const seed = require('./db/seedFn');
const seedData = require('./db/seedData');

describe('GET /jokes', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // recreate db
        await seed()
    });

    it('should return a list of all jokes', async () => {
        const response = await request(app).get('/jokes')
        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(seedData.length)
        expect(response.body[0]).toEqual(expect.objectContaining(seedData[0]))
    });

    it('should return a list of jokes, filtered by tag', async () => {
        const response = await request(app).get('/jokes?tags=anatomy')
        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(3)
        expect(response.body[0]).toEqual(expect.objectContaining(seedData[3]))
    });

    it('should return a list of jokes, filtered by content', async () => {
        const response = await request(app).get('/jokes?content=flamingo')
        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(1)
        expect(response.body[0]).toEqual(expect.objectContaining(seedData[2]))
    });
});

describe('POST /jokes', () => {
    it('should add a joke to the database', async () => {
        const joke = { setup: 'example joke?', punchline: 'example answer.'}
        const response = await request(app)
        .post('/jokes') //calls on the request object that specifies the HTTP method and endpoint for the request
        .send(joke);//calls on the request object that sends the joke object in the body of the HTTP request. 

    })
})
