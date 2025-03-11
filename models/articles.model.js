const db = require("../db/connection");

exports.selectArticles = () => {
    return db
        .query(
            `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments)::INT AS comment_count FROM articles 
            LEFT JOIN comments ON articles.article_id = comments.article_id
            GROUP BY articles.article_id
            ORDER BY articles.created_at DESC`
        )
        .then(({ rows }) => rows);
};

exports.selectArticleByID = (article_id) => {
    return db
        .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
        .then(({ rows }) => {
            return rows.length > 0
                ? rows[0]
                : Promise.reject({ status: 404, msg: "404 Not Found" });
        });
};
