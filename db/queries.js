exports.createTopicsQuery = `CREATE TABLE topics(
    slug VARCHAR(32) PRIMARY KEY NOT NULL,
    description VARCHAR(128),
    img_url VARCHAR(1000))`;

exports.createUsersQuery = `CREATE TABLE users(
    username VARCHAR(32) PRIMARY KEY NOT NULL UNIQUE,
    name VARCHAR(64) NOT NULL,
    avatar_url VARCHAR(1000))`

exports.createArticlesQuery = `CREATE TABLE articles(
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(64) NOT NULL,
    topic VARCHAR(32) REFERENCES topics(slug) NOT NULL,
    author VARCHAR(32) REFERENCES users(username) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000))`

exports.createCommentsQuery = `CREATE TABLE comments(
    comment_id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(article_id) NOT NULL,
    body TEXT NOT NULL,
    votes INT DEFAULT 0, 
    author VARCHAR(32) REFERENCES users(username) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`