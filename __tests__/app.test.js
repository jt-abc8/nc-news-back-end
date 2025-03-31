const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const app = require("../app");

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
                  expect(articles.length).toBeGreaterThan(0);
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
         test("the article array is sorted by date in descending order by default", () => {
            return request(app)
               .get("/api/articles")
               .expect(200)
               .then(({ body: { articles } }) => {
                  expect(articles).toBeSortedBy("created_at", {
                     descending: true,
                  });
               });
         });

         describe("queries", () => {
            describe("sort_by", () => {
               const sortBy = (column, property) => {
                  return request(app)
                     .get(`/api/articles?sort_by=${column}`)
                     .expect(200)
                     .then(({ body: { articles } }) => {
                        const orderCondition = {};
                        orderCondition[property] = true;
                        expect(articles).toBeSortedBy(column, orderCondition);
                     });
               };

               test("sorts the response by title, default ascending", () => {
                  return sortBy("title", "ascending");
               });

               test("sorts the response by topic, default ascending", () => {
                  return sortBy("topic", "ascending");
               });
               test("sorts the response by author, default ascending", () => {
                  return sortBy("author", "ascending");
               });
               test("sorts the response by created_at, default descending", () => {
                  return sortBy("created_at", "descending");
               });
               test("sorts the response by votes, default descending", () => {
                  return sortBy("votes", "descending");
               });
            });

            describe("order", () => {
               test("sorts by ascending order", () => {
                  return request(app)
                     .get(`/api/articles?order=asc`)
                     .expect(200)
                     .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("created_at", {
                           ascending: true,
                        });
                     });
               });
               test("sorts by descending order", () => {
                  return request(app)
                     .get(`/api/articles?order=desc`)
                     .expect(200)
                     .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("created_at", {
                           descending: true,
                        });
                     });
               });
               test("sorts by ascending order when paired with sort_by query", () => {
                  return request(app)
                     .get(`/api/articles?sort_by=votes&order=asc`)
                     .expect(200)
                     .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("votes", {
                           ascending: true,
                        });
                     });
               });
               test("sorts by descending order when paired with sort_by query", () => {
                  return request(app)
                     .get(`/api/articles?sort_by=author&order=desc`)
                     .expect(200)
                     .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("author", {
                           descending: true,
                        });
                     });
               });
            });

            describe("topic", () => {
               test("responds with an empty array if there are no articles on the specified topic", () => {
                  return request(app)
                     .get(`/api/articles?topic=paper`)
                     .expect(200)
                     .then(({ body: { articles } }) => {
                        expect(articles.length).toBe(0);
                     });
               });
               test("responds with only the articles on the specified topic", () => {
                  const mitch = request(app)
                     .get(`/api/articles?topic=mitch&limit=20`)
                     .expect(200)
                     .then(({ body: { articles } }) => {
                        expect(articles.length).toBe(12);

                        articles.forEach(({ topic }) => {
                           expect(topic).toBe("mitch");
                        });
                     });

                  const cats = request(app)
                     .get(`/api/articles?topic=cats`)
                     .expect(200)
                     .then(({ body: { articles } }) => {
                        expect(articles.length).toBe(1);

                        articles.forEach(({ topic }) => {
                           expect(topic).toBe("cats");
                        });
                     });

                  return Promise.all([mitch, cats]);
               });
            });
         });

         describe("pagination", () => {
            describe("total_count", () => {
               test("Returns a total_count property on the response object, displaying the total number of articles", () => {
                  return request(app)
                     .get(`/api/articles`)
                     .expect(200)
                     .then(({ body: { total_count } }) => {
                        expect(total_count).toBe(13);
                     });
               });

               test("Returns total_count when a filter is applied", () => {
                  return request(app)
                     .get(`/api/articles?topic=mitch`)
                     .expect(200)
                     .then(({ body: { total_count } }) => {
                        expect(total_count).toBe(12);
                     });
               });
            });

            describe("queries", () => {
               describe("limit", () => {
                  test("limits the number of articles contained in the response array", () => {
                     return request(app)
                        .get(`/api/articles?limit=4`)
                        .expect(200)
                        .then(({ body: { articles } }) => {
                           expect(articles.length).toBe(4);
                        });
                  });
                  test("defaults to 10", () => {
                     return request(app)
                        .get(`/api/articles`)
                        .expect(200)
                        .then(({ body: { articles } }) => {
                           expect(articles.length).toBe(10);
                        });
                  });
               });

               describe("p", () => {
                  test("displays the articles on the specified page - calculated via the limit query", async () => {
                     let res = await request(app).get("/api/articles?limit=13");
                     const allArticles = res.body.articles;
                     const {
                        body: { articles },
                     } = await request(app)
                        .get(`/api/articles?limit=3&p=3`)
                        .expect(200);

                     expect(articles.length).toBe(3);
                     expect(articles[0].article_id).toBe(
                        allArticles[6].article_id
                     );
                     expect(articles[1].article_id).toBe(
                        allArticles[7].article_id
                     );
                     expect(articles[2].article_id).toBe(
                        allArticles[8].article_id
                     );
                  });

                  test("defaults to 1", async () => {
                     let res = await request(app).get("/api/articles?limit=13");
                     const allArticles = res.body.articles;
                     const {
                        body: { articles },
                     } = await request(app)
                        .get(`/api/articles?limit=4`)
                        .expect(200);

                     expect(articles.length).toBe(4);
                     expect(articles[0].article_id).toBe(
                        allArticles[0].article_id
                     );
                     expect(articles[1].article_id).toBe(
                        allArticles[1].article_id
                     );
                     expect(articles[2].article_id).toBe(
                        allArticles[2].article_id
                     );
                     expect(articles[3].article_id).toBe(
                        allArticles[3].article_id
                     );
                  });
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

         describe("queries", () => {
            describe("topic", () => {
               test("Responds with 404 Not Found when topic query value does not exist in database", () => {
                  return request(app)
                     .get("/api/articles?topic=twin-peaks")
                     .expect(404)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("404 Not Found");
                     });
               });
            });
            describe("p", () => {
               test("Responds with 404 Not Found when p query value is greater than total number of pages", () => {
                  return request(app)
                     .get("/api/articles?limit=4&p=8")
                     .expect(404)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("404 Not Found");
                     });
               });
            });
         });
      });

      describe("400 Bad Request", () => {
         describe("queries", () => {
            describe("sort_by", () => {
               test("Responds with 400 Bad Request when sort_by query is invalid", () => {
                  return request(app)
                     .get("/api/articles?sort_by=not-valid")
                     .expect(400)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                     });
               });

               test("Responds with 400 Bad Request when sort_by query is invalid, even when paired with valid order query", () => {
                  return request(app)
                     .get("/api/articles?sort_by=not-valid&order=asc")
                     .expect(400)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                     });
               });
            });
            describe("order", () => {
               test("Responds with 400 Bad Request when order query is invalid", () => {
                  return request(app)
                     .get("/api/articles?order=wacky-random-order-pls")
                     .expect(400)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                     });
               });
               test("Responds with 400 Bad Request when order query is invalid, even when paired with valid sort_by query", () => {
                  return request(app)
                     .get(
                        "/api/articles?sort_by=title&order=wacky-random-order-pls"
                     )
                     .expect(400)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                     });
               });
            });
            describe("limit", () => {
               test("Responds with 400 Bad Request when limit query is invalid", () => {
                  const invalid = request(app)
                     .get("/api/articles?limit=invalid")
                     .expect(400)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                     });

                  const negative = request(app)
                     .get("/api/articles?limit=-10")
                     .expect(400)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                     });

                  return Promise.all([invalid, negative]);
               });
            });
            describe("p", () => {
               test("Responds with 400 Bad Request when p query is invalid", () => {
                  const invalid = request(app)
                     .get("/api/articles?p=invalid")
                     .expect(400)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                     });

                  const negative = request(app)
                     .get("/api/articles?p=-4")
                     .expect(400)
                     .then(({ body: { msg } }) => {
                        expect(msg).toBe("400 Bad Request");
                     });

                  return Promise.all([invalid, negative]);
               });
            });
         });
      });
   });
   describe("POST", () => {
      describe("201 Created", () => {
         test("adds a new article", () => {
            return request(app)
               .post("/api/articles")
               .send({
                  author: "butter_bridge",
                  title: "How to enjoy a damn fine cup of coffee",
                  body: "And a slice of cherry pie",
                  topic: "paper",
                  article_img_url: "example.com",
               })
               .expect(201)
               .then(({ body: { article } }) => {
                  expect(article).toMatchObject({
                     author: "butter_bridge",
                     title: "How to enjoy a damn fine cup of coffee",
                     body: "And a slice of cherry pie",
                     topic: "paper",
                     article_img_url: "example.com",
                     article_id: 14,
                     votes: 0,
                     created_at: expect.any(String),
                     comment_count: 0,
                  });
               });
         });
         test("img_url returns a default string if one is not provided", () => {
            return request(app)
               .post("/api/articles")
               .send({
                  author: "butter_bridge",
                  title: "How to enjoy a damn fine cup of coffee",
                  body: "And a slice of cherry pie",
                  topic: "paper",
                  article_img_url: "example.com",
               })
               .expect(201)
               .then(({ body: { article } }) => {
                  const { article_img_url } = article;
                  expect(article_img_url).toEqual(expect.any(String));
               });
         });
      });
      describe("400 Bad Request", () => {
         test("responds with a bad request when article data is incomplete", () => {
            const noAuthor = request(app)
               .post("/api/articles")
               .send({
                  title: "How to enjoy a damn fine cup of coffee",
                  body: "And a slice of cherry pie",
                  topic: "paper",
                  article_img_url: "example.com",
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
            const noTitle = request(app)
               .post("/api/articles")
               .send({
                  author: "butter_bridge",
                  body: "And a slice of cherry pie",
                  topic: "paper",
                  article_img_url: "example.com",
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
            const noBody = request(app)
               .post("/api/articles")
               .send({
                  author: "butter_bridge",
                  title: "How to enjoy a damn fine cup of coffee",
                  topic: "paper",
                  article_img_url: "example.com",
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
            const noTopic = request(app)
               .post("/api/articles")
               .send({
                  author: "butter_bridge",
                  title: "How to enjoy a damn fine cup of coffee",
                  body: "And a slice of cherry pie",
                  article_img_url: "example.com",
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });

            return Promise.all([noAuthor, noTitle, noBody, noTopic]);
         });
         test("responds with a bad request if any foreign key violations are detected", () => {
            const authorViolation = request(app)
               .post("/api/articles")
               .send({
                  author: "jt",
                  title: "How to enjoy a damn fine cup of coffee",
                  body: "And a slice of cherry pie",
                  topic: "paper",
                  article_img_url: "example.com",
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });

            const topicViolation = request(app)
               .post("/api/articles")
               .send({
                  author: "butter_bridge",
                  title: "How to enjoy a damn fine cup of coffee",
                  body: "And a slice of cherry pie",
                  topic: "twin peaks",
                  article_img_url: "example.com",
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });

            return Promise.all([authorViolation, topicViolation]);
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
                  const expected = data.articleData[3];
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
         test("Response data includes a comment_count property, which provides the total count of all the comments with the matching article_id", () => {
            const article1 = request(app)
               .get("/api/articles/1")
               .expect(200)
               .then(({ body: { article } }) => {
                  expect(article.comment_count).toBe(11);
               });

            const article2 = request(app)
               .get("/api/articles/9")
               .expect(200)
               .then(({ body: { article } }) => {
                  expect(article.comment_count).toBe(2);
               });

            const article3 = request(app)
               .get("/api/articles/2")
               .expect(200)
               .then(({ body: { article } }) => {
                  expect(article.comment_count).toBe(0);
               });

            return Promise.all([article1, article2, article3]);
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
   describe("PATCH", () => {
      describe("200 OK", () => {
         test("increments the selected article's votes property and returns the updated article data", () => {
            return request(app)
               .patch("/api/articles/1")
               .send({
                  inc_votes: 5,
               })
               .expect(200)
               .then(({ body: { article } }) => {
                  const expected = data.articleData[0];
                  expect(article).toMatchObject({
                     article_id: 1,
                     title: expected.title,
                     topic: expected.topic,
                     author: expected.author,
                     body: expected.body,
                     created_at: expect.any(String),
                     votes: 105,
                     article_img_url: expected.article_img_url,
                  });
               });
         });
      });
      describe("400 bad request", () => {
         test("responds with a bad request if inc_votes property is missing", () => {
            return request(app)
               .patch("/api/articles/1")
               .send({
                  wrong_property: 5,
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
         });

         test("responds with a bad request if inc_votes property is wrong data type", () => {
            return request(app)
               .patch("/api/articles/1")
               .send({
                  inc_votes: "wrong data type",
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
         });

         test("Responds with a 400 Bad Request message when article_id parameter is invalid", () => {
            return request(app)
               .patch("/api/articles/not-a-valid-article")
               .send({
                  inc_votes: 5,
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
         });
      });
      describe("404 Not Found", () => {
         test("Responds with a 404 Not Found message when article is not found", () => {
            return request(app)
               .patch("/api/articles/412")
               .send({
                  inc_votes: 5,
               })
               .expect(404)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("404 Not Found");
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

describe("/api/comments/:comment_id", () => {
   describe("DELETE", () => {
      describe("204 no content", () => {
         test("responds with 204 when comment is succesfully deleted", () => {
            return request(app)
               .delete("/api/comments/6")
               .expect(204)
               .then((res) => {
                  expect(res.noContent).toBe(true);
               });
         });
      });
      describe("400 bad request", () => {
         test("responds with a bad request when comment id is wrong data type", () => {
            return request(app)
               .delete("/api/comments/not-valid")
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
         });
      });
      describe("404 not found", () => {
         test("responds with not found when comment does not exist in database", () => {
            return request(app)
               .delete("/api/comments/5000")
               .expect(404)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("404 Not Found");
               });
         });
      });
   });
   describe("PATCH", () => {
      describe("200 OK", () => {
         test("increments the selected comment's votes property and returns the updated comment data", () => {
            return request(app)
               .patch("/api/comments/2")
               .send({ inc_votes: 1 })
               .expect(200)
               .then(({ body: { comment } }) => {
                  expect(comment).toMatchObject({
                     article_id: 1,
                     body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
                     votes: 15,
                     author: "butter_bridge",
                     created_at: expect.any(String),
                  });
               });
         });
         test("decrements the selected comment's votes property and returns the updated comment data", () => {
            return request(app)
               .patch("/api/comments/2")
               .send({ inc_votes: -1 })
               .expect(200)
               .then(({ body: { comment } }) => {
                  expect(comment).toMatchObject({
                     article_id: 1,
                     body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
                     votes: 13,
                     author: "butter_bridge",
                     created_at: expect.any(String),
                  });
               });
         });
      });
      describe("400 Bad Request", () => {
         test("responds with a bad request if inc_votes property is missing", () => {
            return request(app)
               .patch("/api/comments/2")
               .send({
                  wrong_property: 5,
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
         });

         test("responds with a bad request if inc_votes property is wrong data type", () => {
            return request(app)
               .patch("/api/comments/2")
               .send({
                  inc_votes: "wrong data type",
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
         });

         test("Responds with a 400 Bad Request message when article_id parameter is invalid", () => {
            return request(app)
               .patch("/api/comments/invalid-parameter")
               .send({
                  inc_votes: 1,
               })
               .expect(400)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("400 Bad Request");
               });
         });
      });
      describe("404 Not Found", () => {
         test("Responds with a 404 Not Found message when comment_id is not found", () => {
            return request(app)
               .post("/api/comments/5678")
               .send({ inc_votes: 1 })
               .expect(404)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("404 Not Found");
               });
         });
      });
   });
});

describe("/api/users", () => {
   describe("GET", () => {
      describe("200 OK", () => {
         test("responds with an array of objects containing the data for each user in the database", () => {
            return request(app)
               .get("/api/users")
               .expect(200)
               .then(({ body: { users } }) => {
                  expect(Array.isArray(users)).toBe(true);
                  expect(users.length).toBeGreaterThan(0);

                  users.forEach((user) => {
                     expect(user).toMatchObject({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String),
                     });
                  });
               });
         });
      });
      describe("404 Not Found", () => {
         test("Responds with a 404 Not Found message when endpoint is not found", () => {
            return request(app)
               .get("/api/not-users")
               .expect(404)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("404 Not Found");
               });
         });
      });
   });
});

describe("/api/users/:username", () => {
   describe("GET", () => {
      describe("200 OK", () => {
         test("Responds with an object containing username, avatar_url and name properties", () => {
            return request(app)
               .get("/api/users/rogersop")
               .expect(200)
               .then(({ body: { user } }) => {
                  expect(user).toMatchObject({
                     username: "rogersop",
                     name: "paul",
                     avatar_url:
                        "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
                  });
               });
         });
      });
      describe("404 Not Found", () => {
         test("Responds with a 404 Not Found message when endpoint is not found (username does not exist in database)", () => {
            return request(app)
               .get("/api/users/mr-not-a-username-362")
               .expect(404)
               .then(({ body: { msg } }) => {
                  expect(msg).toBe("404 Not Found");
               });
         });
      });
   });
});
