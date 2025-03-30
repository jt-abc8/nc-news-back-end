const db = require("../db/connection");
const { checkExists, reject } = require("../utils");

exports.selectComments = ({ article_id }) => {
   return checkExists("articles", "article_id", article_id)
      .then((exists) => {
         if (!exists) {
            return reject(404);
         }

         return db.query(
            "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
            [article_id]
         );
      })
      .then(({ rows }) => rows);
};

exports.insertComment = (article_id, username, body) => {
   return checkExists("articles", "article_id", article_id)
      .then((exists) => {
         if (!exists) {
            return reject(404);
         }

         return db.query(
            "INSERT INTO comments(article_id, author, body) VALUES($1, $2, $3) RETURNING *",
            [article_id, username, body]
         );
      })
      .then(({ rows }) => rows[0]);
};

exports.sqlDeleteComment = (comment_id) => {
   return checkExists("comments", "comment_id", comment_id).then((exists) => {
      if (!exists) {
         return reject(404);
      }

      return db.query(`DELETE FROM comments WHERE comment_id = $1`, [
         comment_id,
      ]);
   });
};

exports.updateCommentVotes = ({ comment_id }, { inc_votes }) => {
   if (!inc_votes) {
      return reject(400);
   }

   return checkExists("comments", "comment_id", comment_id)
      .then((exists) => {
         if (!exists) {
            return reject(404);
         }

         return db.query(
            `UPDATE comments 
                SET votes = votes + $1 
                WHERE comment_id = $2
                RETURNING *`,
            [inc_votes, comment_id]
         );
      })
      .then(({ rows }) => rows[0]);
};
