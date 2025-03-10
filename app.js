const express = require("express");
const { getEndpoints } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");

const app = express();

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.all("/api/*", (req, res) => {
    res.status(404).send({ msg: "404 Not Found"});
})

module.exports = app;