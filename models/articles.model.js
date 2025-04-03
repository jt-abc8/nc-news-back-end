const db = require("../db/connection");
const { checkExists, reject } = require("../utils");
const format = require("pg-format");

exports.selectArticles = async ({ sort_by, order, topic, limit, p }) => {
   let i = 1;

   if (p < 0) {
      return reject(400);
   }

   limit ??= 10;
   p ??= 1;
   sort_by ??= "created_at";

   const defaultDescending = ["votes", "created_at", "comment_count"];
   order ??= defaultDescending.includes(sort_by) ? "desc" : "asc";

   const validSorts = [
      "title",
      "topic",
      "author",
      "votes",
      "created_at",
      "comment_count",
   ];
   const validOrder = ["asc", "desc"];
   if (!validSorts.includes(sort_by) || !validOrder.includes(order)) {
      return reject(400);
   }

   let queryStr = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments)::INT AS comment_count FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id`;

   const queryParams = [];
   if (topic) {
      const exists = await checkExists("topics", "slug", topic);
      if (!exists) {
         return reject(404);
      }
      queryStr += format(` WHERE articles.topic = $%s`, i++);
      queryParams.push(topic);
   }

   if (sort_by === "comment_count") {
      queryStr += format(
         ` GROUP BY articles.article_id
           ORDER BY %I %s`,
         sort_by,
         order.toUpperCase()
      );
   } else {
      queryStr += format(
         ` GROUP BY articles.article_id
           ORDER BY articles.%I %s`,
         sort_by,
         order.toUpperCase()
      );

   }

   const total = await db.query(queryStr, queryParams);

   const offset = (p - 1) * limit;

   if (offset > 0 && offset >= total.rows.length) {
      return reject(404);
   }

   queryParams.push(limit, offset);
   queryStr += format(` LIMIT $%s OFFSET $%s`, i++, i++);

   const page = await db.query(queryStr, queryParams);

   return { articles: page.rows, total_count: total.rows.length };
};

exports.selectArticleByID = (article_id) => {
   return db
      .query(
         `SELECT articles.*, COUNT(comments)::INT AS comment_count FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id 
        WHERE articles.article_id = $1
        GROUP BY articles.article_id`,
         [article_id]
      )
      .then(({ rows }) => {
         return rows.length > 0 ? rows[0] : reject(404);
      });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
   if (!inc_votes) {
      return reject(400);
   }

   return checkExists("articles", "article_id", article_id)
      .then((exists) => {
         if (!exists) {
            return reject(404);
         }

         return db.query(
            `UPDATE articles
                  SET votes = votes + $1
                  WHERE article_id = $2 RETURNING *`,
            [inc_votes, article_id]
         );
      })
      .then(({ rows }) => rows[0]);
};

exports.insertArticle = (author, title, body, topic, article_img_url) => {
   return db
      .query(
         `INSERT INTO articles(author, title, body, topic, article_img_url)
        VALUES($1, $2, $3, $4, $5) 
        RETURNING *`,
         [author, title, body, topic, article_img_url]
      )
      .then(({ rows }) => {
         return { ...rows[0], comment_count: 0 };
      });
};
