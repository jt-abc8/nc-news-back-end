const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const app = require("../app");
const { convertTimestampToDate } = require("../db/seeds/utils");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
    describe("GET", () => {
        test("200: Responds with an object detailing the documentation for each endpoint", () => {
            return request(app)
                .get("/api")
                .expect(200)
                .then(({ body: { endpoints } }) => {
                    expect(endpoints).toEqual(endpointsJson);
                });
        });
    });
});

describe("/api/topics", () => {
    describe("GET", () => {
        describe("200 OK", () => {
            test("Responds with an array of objects containing the data for each topic in the database", () => {
                return request(app)
                    .get("/api/topics")
                    .expect(200)
                    .then(({ body: { topics } }) => {
                        expect(Array.isArray(topics)).toBe(true);
                        expect(topics.length).toBeGreaterThan(0);

                        topics.forEach((topic) => {
                            expect(topic).toMatchObject({
                                slug: expect.any(String),
                                description: expect.any(String),
                                img_url: expect.any(String),
                            });
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
});

describe("/api/articles", () => {
    describe("GET", () => {
        describe("200 OK", () => {
            test("responds with an array of objects containing the data for each article in the database", () => {
                return request(app)
                    .get("/api/articles")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(Array.isArray(articles)).toBe(true);
                        expect(articles.length).toBe(13);
                        articles.forEach((article) => {
                            expect(article).not.toHaveProperty("body");
                            expect(article).toMatchObject({
                                article_id: expect.any(Number),
                                title: expect.any(String),
                                topic: expect.any(String),
                                author: expect.any(String),
                                created_at: expect.any(String),
                                votes: expect.any(Number),
                                article_img_url: expect.any(String),
                                comment_count: expect.any(Number),
                            });
                        });
                    });
            });
            test("the article array is sorted by date in descending order", () => {
                return request(app)
                    .get("/api/articles")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("created_at", {
                            descending: true,
                        });
                    });
            });
        });
        describe("404 Not Found", () => {
            test("Responds with a 404 Not Found message when endpoint is not found", () => {
                return request(app)
                    .get("/api/not-articles")
                    .expect(404)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("404 Not Found");
                    });
            });
        });
    });
});

describe("/api/articles/:article_id", () => {
    describe("GET", () => {
        describe("200 OK", () => {
            test("Responds with data for a specific article", () => {
                return request(app)
                    .get("/api/articles/4")
                    .expect(200)
                    .then(({ body: { article } }) => {
                        const expected = convertTimestampToDate(
                            data.articleData[3]
                        );
                        expect(article).toMatchObject({
                            article_id: 4,
                            title: expected.title,
                            topic: expected.topic,
                            author: expected.author,
                            body: expected.body,
                            created_at: expect.any(String),
                            votes: expected.votes,
                            article_img_url: expected.article_img_url,
                        });
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
            test("Responds with a 400 Bad Request message when article_id parameter is invalid", () => {
                return request(app)
                    .get("/api/articles/not-a-valid-article")
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                    });
            });
        });
    });
});

describe("/api/articles/:article_id/comments", () => {
    describe("GET", () => {
        describe("200 OK", () => {
            test("Responds with an empty array when there are no comments on the relevant article", () => {
                return request(app)
                    .get("/api/articles/2/comments")
                    .expect(200)
                    .then(({ body: { comments } }) => {
                        expect(Array.isArray(comments)).toBe(true);
                        expect(comments.length).toBe(0);
                    });
            });
            test("returns the array of comments for a specfic article", () => {
                return request(app)
                    .get("/api/articles/1/comments")
                    .expect(200)
                    .then(({ body: { comments } }) => {
                        expect(Array.isArray(comments)).toBe(true);
                        expect(comments.length).toBe(11);

                        comments.forEach((comment) => {
                            expect(comment).toMatchObject({
                                comment_id: expect.any(Number),
                                votes: expect.any(Number),
                                created_at: expect.any(String),
                                author: expect.any(String),
                                body: expect.any(String),
                                article_id: expect.any(Number),
                            });
                        });
                    });
            });
            test("ordered by most recent comments - i.e. date in descending order", () => {
                return request(app)
                    .get("/api/articles/1/comments")
                    .expect(200)
                    .then(({ body: { comments } }) => {
                        expect(comments).toBeSortedBy("created_at", {
                            descending: true,
                        });
                    });
            });
        });
        describe("404 Not Found", () => {
            test("Responds with a 404 Not Found message when article_id is not found", () => {
                return request(app)
                    .get("/api/articles/627/comments")
                    .expect(404)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("404 Not Found");
                    });
            });
        });
        describe("400 Bad Request", () => {
            test("Responds with a 400 Bad Request message when the article_id is invalid", () => {
                return request(app)
                    .get("/api/articles/my-invalid-article/comments")
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                    });
            });
        });
    });
    describe("POST", () => {
        describe("201 Created", () => {
            test("adds a comment for the selected article", () => {
                return request(app)
                    .post("/api/articles/3/comments")
                    .send({
                        username: "butter_bridge",
                        body: "i loved this article! very thought-provoking",
                    })
                    .expect(201)
                    .then(({ body: { comment } }) => {
                        expect(comment).toMatchObject({
                            article_id: 3,
                            body: "i loved this article! very thought-provoking",
                            votes: 0,
                            author: "butter_bridge",
                            created_at: expect.any(String),
                        });
                    });
            });
        });
        describe("400 Bad Request", () => {
            test("responds with a bad request when comment data is incomplete", () => {
                return request(app)
                    .post("/api/articles/3/comments")
                    .send({
                        username: "butter_bridge",
                    })
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                    });
            });
            test("responds with a bad request when sent username is a foreign key violation - i.e. wrong data type/does not exist in users table", () => {
                const doesNotExist = request(app)
                    .post("/api/articles/3/comments")
                    .send({
                        username: "jt",
                        body: "don't you know who i am?!",
                    })
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                    });

                const wrongDataType = request(app)
                    .post("/api/articles/3/comments")
                    .send({
                        username: new Date(),
                        body: "what's the time",
                    })
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                    });

                return Promise.all([doesNotExist, wrongDataType]);
            });
            test("Responds with a 400 Bad Request message when the article_id is invalid", () => {
                return request(app)
                    .post("/api/articles/my-invalid-article/comments")
                    .send({
                        username: "butter_bridge",
                        body: "i loved this article! very thought-provoking",
                    })
                    .expect(400)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                    });
            });
        });
        describe("404 Not Found", () => {
            test("Responds with a 404 Not Found message when article_id is not found", () => {
                return request(app)
                    .post("/api/articles/627/comments")
                    .send({
                        username: "butter_bridge",
                        body: "i loved this article! very thought-provoking",
                    })
                    .expect(404)
                    .then(({ body: { msg } }) => {
                        expect(msg).toBe("404 Not Found");
                    });
            });
        });
    });
});
