exports.createTopicsQuery = `CREATE TABLE topics(
    slug VARCHAR(100) PRIMARY KEY NOT NULL,
    description VARCHAR(200),
    img_url VARCHAR(1000))`;

exports.createUsersQuery = `CREATE TABLE users(
    username VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(1000))`

exports.createArticlesQuery = `CREATE TABLE articles(
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    topic VARCHAR(100) REFERENCES topics(slug),
    author VARCHAR(100) REFERENCES users(username),
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000))`

exports.createCommentsQuery = `CREATE TABLE comments(
    comment_id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(article_id),
    body TEXT,
    votes INT DEFAULT 0, 
    author VARCHAR(100) REFERENCES users(username),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`