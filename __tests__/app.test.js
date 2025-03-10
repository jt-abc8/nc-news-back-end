const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const app = require("../app");
const { convertTimestampToDate } = require("../db/seeds/utils");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api", () => {
    test("200: Responds with an object detailing the documentation for each endpoint", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body: { endpoints } }) => {
                expect(endpoints).toEqual(endpointsJson);
            });
    });
});

describe("GET /api/topics", () => {
    describe("200 OK", () => {
        test("Responds with an array of objects containing the data for each topic in the database", () => {
            return request(app)
                .get("/api/topics")
                .expect(200)
                .then(({ body: { topics } }) => {
                    topics.forEach(({ slug, description, img_url }) => {
                        expect(typeof slug).toBe("string");
                        expect(typeof description).toBe("string");
                        expect(typeof img_url).toBe("string");
                    });
                });
        });
    });
    describe("404 Not Found", () => {
        test("Responds with a 404 Not Found message when endpoint is not found", () => {
            return request(app)
                .get("/api/not-topics")
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("404 Not Found");
                });
        });
    });
});

describe("GET /api/articles/:article_id", () => {
    describe("200 OK", () => {
        test("Responds with data for a specific article", () => {
            return request(app)
                .get("/api/articles/4")
                .expect(200)
                .then(({ body: { article } }) => {
                    const expected = convertTimestampToDate(
                        data.articleData[3]
                    );

                    expect(article.article_id).toBe(4);
                    expect(article.title).toBe(expected.title);
                    expect(article.topic).toBe(expected.topic);
                    expect(article.author).toBe(expected.author);
                    expect(article.body).toBe(expected.body);
                    expect(typeof article.created_at).toBe("string"); //!
                    expect(article.votes).toBe(expected.votes);
                    expect(article.article_img_url).toBe(expected.article_img_url);
                });
        });
    });
    describe("404 Not Found", () => {
        test("Responds with a 404 Not Found message when article is not found", () => {
            return request(app)
                .get("/api/articles/412")
                .expect(404)
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("404 Not Found");
                });
        });
    });
    describe("400 Bad Request", () => {
        test(
            "Responds with a 400 Bad Request message when article_id parameter is invalid", () => {
              return request(app)
              .get("/api/articles/not-a-valid-article")
              .expect(400)
              .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
              });
            }
        );
    });
});
