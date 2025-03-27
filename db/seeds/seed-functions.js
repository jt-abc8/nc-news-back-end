const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, getRecordID } = require("../../utils");
const {
    createTopicsQuery,
    createUsersQuery,
    createArticlesQuery,
    createCommentsQuery,
} = require("../queries");

exports.dropTables = async () => {
    await db.query(`DROP TABLE IF EXISTS comments`);
    await db.query(`DROP TABLE IF EXISTS articles`);
    await db.query(`DROP TABLE IF EXISTS users`);
    await db.query(`DROP TABLE IF EXISTS topics`);
}

exports.createTables = async () => {
    await db.query(createTopicsQuery);
    await db.query(createUsersQuery);
    await db.query(createArticlesQuery);
    await db.query(createCommentsQuery);
}

exports.insertTopicData = async (data) => {
    const queryString = format(
        "INSERT INTO topics(slug, description, img_url) VALUES %L",
        data.map(({ slug, description, img_url }) => {
            return [slug, description, img_url];
        })
    );
    return db.query(queryString);
}

exports.insertUserData = async (data) => {
    const queryString = format(
        "INSERT INTO users(username, name, avatar_url) VALUES %L",
        data.map(({ username, name, avatar_url }) => {
            return [username, name, avatar_url];
        })
    );
    return db.query(queryString);
}

exports.insertArticleData = async (data) => {
    const formattedData = data.map(convertTimestampToDate);
    const queryString = format(
        "INSERT INTO articles(title, topic, author, body, created_at, votes, article_img_url) VALUES %L",
        formattedData.map((article) => {
            return [
                article.title,
                article.topic,
                article.author,
                article.body,
                article.created_at,
                article.votes,
                article.article_img_url,
            ];
        })
    );
    return db.query(queryString);
}
exports.insertCommentData = async (data) => {
    const formattedData = data.map(convertTimestampToDate);
    const queryString = format(
        "INSERT INTO comments(article_id, body, votes, author, created_at) VALUES %L",
        await Promise.all(
            formattedData.map(async (comment) => {
                const ref = { key: "title", value: comment.article_title };
                const article_id = await getRecordID(
                    "article_id",
                    "articles",
                    ref
                );
                return [
                    article_id,
                    comment.body,
                    comment.votes,
                    comment.author,
                    comment.created_at,
                ];
            })
        )
    );
    return db.query(queryString);
}