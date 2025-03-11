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
