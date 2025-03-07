const {
    dropTables,
    createTables,
    insertTopicData,
    insertUserData,
    insertArticleData,
    insertCommentData,
} = require("./seed-functions");

async function seed({ topicData, userData, articleData, commentData }) {
    await dropTables();
    await createTables();
    await insertTopicData(topicData);
    await insertUserData(userData);
    await insertArticleData(articleData);
    await insertCommentData(commentData);
}

module.exports = seed;
