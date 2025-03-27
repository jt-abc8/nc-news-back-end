const {
   convertTimestampToDate,
   getRecordID,
   checkExists,
} = require("../utils");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

beforeAll(() => seed(data));
afterAll(() => db.end());

describe("convertTimestampToDate", () => {
   test("returns a new object", () => {
      const timestamp = 1557572706232;
      const input = { created_at: timestamp };
      const result = convertTimestampToDate(input);
      expect(result).not.toBe(input);
      expect(result).toBeObject();
   });
   test("converts a created_at property to a date", () => {
      const timestamp = 1557572706232;
      const input = { created_at: timestamp };
      const result = convertTimestampToDate(input);
      expect(result.created_at).toBeDate();
      expect(result.created_at).toEqual(new Date(timestamp));
   });
   test("does not mutate the input", () => {
      const timestamp = 1557572706232;
      const input = { created_at: timestamp };
      convertTimestampToDate(input);
      const control = { created_at: timestamp };
      expect(input).toEqual(control);
   });
   test("ignores includes any other key-value-pairs in returned object", () => {
      const input = { created_at: 0, key1: true, key2: 1 };
      const result = convertTimestampToDate(input);
      expect(result.key1).toBe(true);
      expect(result.key2).toBe(1);
   });
   test("returns unchanged object if no created_at property", () => {
      const input = { key: "value" };
      const result = convertTimestampToDate(input);
      const expected = { key: "value" };
      expect(result).toEqual(expected);
   });
});

describe("getRecordID", () => {
   const { commentData } = data;
   const { article_title } = commentData[10];

   test("returns an integer", async () => {
      const ref = { key: "title", value: article_title };
      const result = await getRecordID("article_id", "articles", ref);
      expect(Number.isInteger(result)).toBe(true);
   });
   test("returns the specific id of a record with a matching reference value", async () => {
      const ref = { key: "title", value: article_title };
      const result = await getRecordID("article_id", "articles", ref);
      expect(result).toBe(3);
   });
});

describe("checkExists", () => {
   test("returns false if the record does not exist", () => {
      return checkExists("topics", "slug", "twin peaks").then((result) => {
         expect(result).toBe(false);
      });
   });
   test("returns a data object if the record exists", () => {
      return checkExists("topics", "slug", "mitch").then((result) => {
         expect(result).toMatchObject({
            description: "The man, the Mitch, the legend",
            slug: "mitch",
            img_url: "",
         });
      });
   });
});
