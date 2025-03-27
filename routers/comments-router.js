const commentsRouter = require("express").Router({ mergeParams: true });
const controller = require("../controllers/comments.controller");

commentsRouter
   .route("/")
   .get(controller.getComments)
   .post(controller.postComment);

commentsRouter.delete("/:comment_id", controller.deleteComment);

module.exports = commentsRouter;
