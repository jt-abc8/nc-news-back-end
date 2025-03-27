const apiRouter = require("express").Router();
const topicsRouter = require("../routers/topics-router");
const articlesRouter = require("./articles-router");
const usersRouter = require("../routers/users-router")
const commentsRouter = require("../routers/comments-router")

const { getEndpoints } = require("../controllers/api.controller");

apiRouter.get("/", getEndpoints);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.all("/*", (req, res) => res.status(404).send({ msg: "404 Not Found" }));

module.exports = apiRouter;
