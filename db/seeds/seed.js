const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate } = require("./utils");

const seed = async ({ topicData, userData, articleData, commentData }) => {
    return db
        .query(`DROP TABLE IF EXISTS topics`)
        .then(() => db.query(`DROP TABLE IF EXISTS comments`))
        .then(() => db.query(`DROP TABLE IF EXISTS users`))
        .then(() => db.query(`DROP TABLE IF EXISTS articles`))

        .then(() => {
            return db.query(`CREATE TABLE topics(
            slug VARCHAR(100) PRIMARY KEY NOT NULL,
            description VARCHAR(200),
            img_url VARCHAR(1000))`);
        })
        .then(() => {
            return db.query(`CREATE TABLE users(
            username VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            avatar_url VARCHAR(1000))`);
        })
        .then(() => {
            return db.query(`CREATE TABLE articles(
            article_id SERIAL PRIMARY KEY,
            title VARCHAR(100),
            topic VARCHAR(100),
            author VARCHAR(100),
            body TEXT,
            created_at TIMESTAMP,
            votes INT,
            article_img_url VARCHAR(1000))`);
        })
        .then(() => {
            return db.query(`CREATE TABLE comments(
            comment_id SERIAL PRIMARY KEY,
            article_id INT REFERENCES articles(article_id),
            body TEXT,
            votes INT, 
            author VARCHAR(100) REFERENCES users(username),
            created_at TIMESTAMP)`);
        })
        .then(() => {
            const formattedData = topicData.map((topic) => [
                topic.slug,
                topic.description,
                topic.img_url,
            ]);
            const query = format(
                `INSERT INTO topics(slug, description, img_url) 
                VALUES %L`,
                formattedData
            );
            return db.query(query);
        })
        .then(() => {
            const formattedData = userData.map((user) => [
                user.username,
                user.name,
                user.avatar_url,
            ]);
            const query = format(
                `INSERT INTO users(username, name, avatar_url)
                VALUES %L`,
                formattedData
            );
            return db.query(query);
        })
        .then(() => {
            const formattedData = articleData.map((article) => [
                article.title,
                article.topic,
                article.author,
                article.body,
                convertTimestampToDate({ created_at: article.created_at })
                    .created_at,
                article.votes,
                article.img_url,
            ]);
            const query = format(
                `INSERT INTO articles(title, topic, author, body, created_at, votes, article_img_url)
                VALUES %L`,
                formattedData
            );
            return db.query(query);
        })
        .then(() => db.query(`SELECT * FROM articles`))
        .then(({ rows }) => {
            const lookup = rows.reduce((obj, { article_id, title }) => {
                obj[title] = article_id;
                return obj;
            }, {});
            const formattedData = commentData.map((comment) => {
                const array = [
                    lookup[comment.article_title],
                    comment.body,
                    comment.votes,
                    comment.author,
                    convertTimestampToDate({ created_at: comment.created_at })
                        .created_at,
                ];
                return array;
            });
            const query = format(
                `INSERT INTO comments(article_id, body, votes, author, created_at)
                VALUES %L`,
                formattedData
            );
            return db.query(query);
        });
};

module.exports = seed;
