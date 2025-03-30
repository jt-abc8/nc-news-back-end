const db = require("../db/connection");
const { checkExists } = require("../utils");
const format = require("pg-format");

exports.selectArticles = async (sort_by, order, topic) => {
   sort_by ??= "created_at";
   const defaultDescending = ["votes", "created_at"];
   order ??= defaultDescending.includes(sort_by) ? "desc" : "asc";

   const validSorts = ["title", "topic", "author", "votes", "created_at"];
   const validOrder = ["asc", "desc"];
   if (!validSorts.includes(sort_by) || !validOrder.includes(order)) {
      return Promise.reject({ status: 400, msg: "400 Bad Request" });
   }

   let queryStr = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments)::INT AS comment_count FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id`;

   const queryParams = [];
   if (topic) {
      const exists = await checkExists("topics", "slug", topic);
      if (exists) {
         queryStr += " WHERE articles.topic = $1";
         queryParams.push(topic);
      } else {
         return Promise.reject({ status: 404, msg: "404 Not Found" });
      }
   }

   queryStr += format(
      ` GROUP BY articles.article_id
        ORDER BY articles.%I %s`,
      sort_by,
      order.toUpperCase()
   );
   return db.query(queryStr, queryParams).then(({ rows }) => rows);
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
         return rows.length > 0
            ? rows[0]
            : Promise.reject({ status: 404, msg: "404 Not Found" });
      });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
   if (!inc_votes) {
      return Promise.reject({ status: 400, msg: "400 Bad Request" });
   } else {
      return checkExists("articles", "article_id", article_id).then(
         (exists) => {
            if (exists) {
               return db
                  .query(
                     `UPDATE articles
                        SET votes = votes + $1
                        WHERE article_id = $2 RETURNING *`,
                     [inc_votes, article_id]
                  )
                  .then(({ rows }) => rows[0]);
            } else {
               return Promise.reject({
                  status: 404,
                  msg: "404 Not Found",
               });
            }
         }
      );
   }
};

exports.insertArticle = ({ author, title, body, topic, article_img_url }) => {
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
