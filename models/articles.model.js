const db = require("../db/connection");
const { checkExists } = require("../db/seeds/utils");
const format = require("pg-format");

exports.selectArticles = (sort_by) => {
    sort_by ??= "created_at";
    const orderQuery = sort_by === "votes" || sort_by === "created_at" ? "DESC" : "ASC";
    
    const validSorts = ["title", "topic", "author", "votes", "created_at"];
    if (!validSorts.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "400 Bad Request" });
    }
    
    const queryStr = format(
        `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments)::INT AS comment_count FROM articles 
            LEFT JOIN comments ON articles.article_id = comments.article_id
            GROUP BY articles.article_id
            ORDER BY articles.%I %s`,
        sort_by,
        orderQuery
    );
    return db.query(queryStr).then(({ rows }) => rows);
};

exports.selectArticleByID = (article_id) => {
    return db.query("SELECT * FROM articles WHERE article_id = $1", [article_id]).then(({ rows }) => {
        return rows.length > 0 ? rows[0] : Promise.reject({ status: 404, msg: "404 Not Found" });
    });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
    if (!inc_votes) {
        return Promise.reject({ status: 400, msg: "400 Bad Request" });
    } else {
        return checkExists("articles", "article_id", article_id).then((exists) => {
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
        });
    }
};
