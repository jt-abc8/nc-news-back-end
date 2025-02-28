const db = require("./connection");

async function devQueries() {
    const users = await db.query("SELECT * FROM users");
    console.log(users.rows);

    const codingArticles = await db.query(
        "SELECT * FROM articles WHERE topic = 'coding'"
    );
    console.log(codingArticles.rows)

    const unpopularComments = await db.query(
        "SELECT * FROM comments WHERE votes < 0"
    );
    console.log(unpopularComments.rows);

    const allTopics = await db.query("SELECT * FROM topics");
    console.log(allTopics.rows)

    const articlesByGrumpy19 = await db.query(
        "SELECT * FROM articles WHERE author = 'grumpy19'"
    );
    console.log(articlesByGrumpy19.rows)

    const popularComments = await db.query(
        "SELECT * FROM comments WHERE votes > 10"
    );
    console.log(popularComments.rows);
    
    db.end()
}

devQueries();