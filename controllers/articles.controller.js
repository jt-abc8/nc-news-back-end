const { selectArticles, selectArticleByID, updateArticleVotes } = require("../models/articles.model");

exports.getArticles = (req, res, next) => {
    const { sort_by, order } = req.query;
    selectArticles(sort_by, order)
        .then((articles) => res.status(200).send({ articles }))
        .catch((err) => next(err));
};

exports.getArticleByID = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleByID(article_id)
        .then((article) => res.status(200).send({ article }))
        .catch((err) => next(err));
};

exports.patchArticleVotes = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    updateArticleVotes(article_id, inc_votes)
        .then((article) => res.status(200).send({ article }))
        .catch((err) => next(err));
};
