const app = require("./index");
const { sequelize, Joke } = require("./db");
const request = require("supertest");
const seed = require("./db/seedFn");
const seedData = require("./db/seedData");

describe("GET /jokes", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // recreate db
    await seed();
  });

  it("should return a list of all jokes", async () => {
    const response = await request(app).get("/jokes");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(seedData.length);
    expect(response.body[0]).toEqual(expect.objectContaining(seedData[0]));
  });

  it("should return a list of jokes, filtered by tag", async () => {
    const response = await request(app).get("/jokes?tags=anatomy");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual(expect.objectContaining(seedData[3]));
  });

  it("should return a list of jokes, filtered by content", async () => {
    const response = await request(app).get("/jokes?content=flamingo");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(expect.objectContaining(seedData[2]));
  });
});

describe("POST /jokes", () => {
  it("should add a joke to the database", async () => {
    const joke = { setup: "example joke?", punchline: "example answer." };
    const response = await request(app)
      .post("/jokes") //calls on the request object that specifies the HTTP method and endpoint for the request
      .send(joke); //calls on the request object that sends the joke object in the body of the HTTP request.
  });
});

describe("DELETE /jokes/:id", () => {
  it("should delete a joke from the database", async () => {
    const joke = await Joke.create({
      setup: "example joke?",
      punchline: "example answer.",
    }); // Create a joke in the database to delete
    const response = await request(app).delete(`/jokes/${joke.id}`); // calls on the request object that specifies the HTTP method and endpoint for the request, with the ID of the joke to delete
    expect(response.status).toBe(204); // checks that the response status is 204 No Content, indicating successful deletion
    const deletedJoke = await Joke.findByPk(joke.id); // Try to find the deleted joke in the database
    expect(deletedJoke).toBeNull(); // Checks that the deleted joke cannot be found, indicating successful deletion
  });
});

describe("PUT /jokes/:id", () => {
  beforeAll(async () => {
    await Joke.sync({ force: true });
  });

  beforeEach(async () => {
    await Joke.create({
      joke: "Why did the chicken cross the road?",
      tags: "animals, humor",
    });
  });

  afterEach(async () => {
    await Joke.destroy({ where: {} });
  });

  afterAll(async () => {
    await Joke.drop();
  });

  it("should return a 404 status if the joke is not found", async () => {
    const response = await request(app)
      .put("/jokes/999")
      .send({ joke: "Why did the cat cross the road?" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Joke not found" });
  });

  it("should update the joke by ID and return the updated joke", async () => {
    const createdJoke = await Joke.findOne({
      where: { joke: "Why did the chicken cross the road?" },
    });

    const response = await request(app)
      .put(`/jokes/${createdJoke.id}`)
      .send({ joke: "Why did the cat cross the road?" });

    expect(response.status).toBe(200);
    expect(response.body.joke).toBe("Why did the cat cross the road?");
    expect(response.body.tags).toBe("animals, humor");
  });

  it("should update the tags by ID and return the updated joke", async () => {
    const createdJoke = await Joke.findOne({
      where: { joke: "Why did the chicken cross the road?" },
    });

    const response = await request(app)
      .put(`/jokes/${createdJoke.id}`)
      .send({ tags: "animals, humor, pets" });

    expect(response.status).toBe(200);
    expect(response.body.joke).toBe("Why did the chicken cross the road?");
    expect(response.body.tags).toBe("animals, humor, pets");
  });

  it("should update both joke and tags by ID and return the updated joke", async () => {
    const createdJoke = await Joke.findOne({
      where: { joke: "Why did the chicken cross the road?" },
    });

    const response = await request(app).put(`/jokes/${createdJoke.id}`).send({
      joke: "Why did the cat cross the road?",
      tags: "animals, humor, pets",
    });

    expect(response.status).toBe(200);
    expect(response.body.joke).toBe("Why did the cat cross the road?");
    expect(response.body.tags).toBe("animals, humor, pets");
  });
});
