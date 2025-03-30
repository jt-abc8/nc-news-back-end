const articlesRouter = require("express").Router();
const commentsRouter = require("./comments-router");
const controller = require("../controllers/articles.controller");

articlesRouter
   .route("/")
   .get(controller.getArticles)
   .post(controller.postArticle);

articlesRouter
   .route("/:article_id")
   .get(controller.getArticleByID)
   .patch(controller.patchArticleVotes);

articlesRouter.use("/:article_id/comments", commentsRouter);

module.exports = articlesRouter;
