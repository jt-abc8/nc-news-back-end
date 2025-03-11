const db = require("../db/connection");

exports.selectArticles = () => {
    return db
        .query("SELECT * FROM articles ORDER BY created_at DESC")
        .then(({ rows }) => {
            return rows.map((row) => {
                return {
                    article_id: row.article_id,
                    title: row.title,
                    topic: row.topic,
                    author: row.author,
                    created_at: row.created_at,
                    votes: row.votes,
                    article_img_url: row.article_img_url,
                };
            });
        });
};

exports.appendCommentCount = (articles) => {
    const promises = articles.map((article) => {
        return db
            .query("SELECT * FROM comments WHERE article_id = $1", [
                article.article_id,
            ])
            .then(({ rows }) => {
                article.comment_count = rows.length;
                return article;
            });
    });
    return Promise.all(promises);
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
