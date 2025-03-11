const { selectCommentsByArticleID, insertComment } = require("../models/comments.model");

exports.getCommentsByArticleID = (req, res, next) => {
    const { article_id } = req.params;
    selectCommentsByArticleID(article_id)
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