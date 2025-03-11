const db = require("../db/connection");
const { selectArticleByID } = require("./articles.model");

exports.selectCommentsByArticleID = (article_id) => {
    return selectArticleByID(article_id)
        .then(() => {
            return db.query(
                "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
                [article_id]
            );
        })
        .then(({ rows }) => rows);
};

exports.insertComment = (article_id, username, body) => {
    if (!username || !body) {
        return Promise.reject({ status: 400, msg: "400 Bad Request" });
    } else {
        return selectArticleByID(article_id).then(() => {
            return db
                .query(
                    "INSERT INTO comments(article_id, author, body) VALUES($1, $2, $3) RETURNING *",
                    [article_id, username, body]
                )
                .then(({ rows }) => rows[0]);
        });
    }
};
