const articlesRouter = require("express").Router();
const controller = require("../controllers/articles.controller");
const commentsRouter = require("./comments-router");

articlesRouter.get("/", controller.getArticles);

articlesRouter
   .route("/:article_id")
   .get(controller.getArticleByID)
   .patch(controller.patchArticleVotes);

articlesRouter.use("/:article_id/comments", commentsRouter);

module.exports = articlesRouter;
