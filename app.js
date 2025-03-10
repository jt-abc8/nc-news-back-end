const express = require("express");
const { getEndpoints } = require("./controllers/api.controller");
const {
    getTopics,
    getArticleByID,
} = require("./controllers/topics.controller");
const {
    handleCustomErrors,
    handlePsqlErrors,
} = require("./controllers/errors.controller");

const app = express();

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleByID);
app.all("/api/*", (req, res) => {
    res.status(404).send({ msg: "404 Not Found" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);

module.exports = app;
