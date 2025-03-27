const articlesRouter = require("express").Router();
const {
   getArticles,
   getArticleByID,
   patchArticleVotes,
} = require("../controllers/articles.controller");
const {
   getCommentsByArticleID,
   postComment,
} = require("../controllers/comments.controller");

articlesRouter.get("/", getArticles);

articlesRouter
   .route("/:article_id")
   .get(getArticleByID)
   .patch(patchArticleVotes);

articlesRouter
   .route("/:article_id/comments")
   .get(getCommentsByArticleID)
   .post(postComment);

module.exports = articlesRouter;
