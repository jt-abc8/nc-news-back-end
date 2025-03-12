const express = require("express");
const { getEndpoints } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const { getArticleByID, getArticles, patchArticleVotes } = require("./controllers/articles.controller");
const { handleCustomErrors, handlePsqlErrors } = require("./controllers/errors.controller");
const { getCommentsByArticleID, postComment } = require("./controllers/comments.controller");

const app = express();
app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleByID);
app.patch("/api/articles/:article_id", patchArticleVotes);

app.get("/api/articles/:article_id/comments", getCommentsByArticleID);
app.post("/api/articles/:article_id/comments", postComment);

app.all("/api/*", (req, res) => res.status(404).send({ msg: "404 Not Found" }));

app.use(handleCustomErrors);
app.use(handlePsqlErrors);

module.exports = app;
