const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const app = require("../app");

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
