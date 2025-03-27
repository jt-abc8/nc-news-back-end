const db = require("../db/connection");
const { checkExists } = require("../db/seeds/utils");

exports.selectComments= ({article_id}) => {
    return checkExists("articles", "article_id", article_id)
        .then((exists) => {
            if (exists) {
                return db.query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC", [article_id]);
            } else {
                return Promise.reject({
                    status: 404,
                    msg: "404 Not Found",
                });
            }
        })
        .then(({ rows }) => rows);
};

exports.insertComment = (article_id, username, body) => {
    if (!username || !body) {
        return Promise.reject({ status: 400, msg: "400 Bad Request" });
    } else {
        return checkExists("articles", "article_id", article_id).then((exists) => {
            if (exists) {
                return db
                    .query("INSERT INTO comments(article_id, author, body) VALUES($1, $2, $3) RETURNING *", [
                        article_id,
                        username,
                        body,
                    ])
                    .then(({ rows }) => rows[0]);
            } else {
                return Promise.reject({
                    status: 404,
                    msg: "404 Not Found",
                });
            }
        });
    }
};

exports.sqlDeleteComment = (comment_id) => {
    return checkExists("comments", "comment_id", comment_id).then((exists) => {
        if (exists) {
            return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id]);
        } else {
            return Promise.reject({
                status: 404,
                msg: "404 Not Found",
            });
        }
    });
};
