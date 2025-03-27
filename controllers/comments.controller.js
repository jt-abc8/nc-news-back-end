const { selectComments, insertComment, sqlDeleteComment } = require("../models/comments.model");

exports.getComments = (req, res, next) => {
    selectComments(req.params)
        .then((comments) => res.status(200).send({ comments }))
        .catch((err) => next(err));
};

exports.postComment = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;
    insertComment(article_id, username, body)
        .then((comment) => res.status(201).send({ comment }))
        .catch((err) => next(err));
};
exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params;
    sqlDeleteComment(comment_id)
        .then(() => res.status(204).send())
        .catch((err) => next(err));
};
