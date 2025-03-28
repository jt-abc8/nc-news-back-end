const commentsRouter = require("express").Router({ mergeParams: true });
const controller = require("../controllers/comments.controller");

commentsRouter
   .route("/")
   .get(controller.getComments)
   .post(controller.postComment);

commentsRouter
   .route("/:comment_id")
   .delete(controller.deleteComment)
   .patch(controller.patchCommentVotes);

module.exports = commentsRouter;
