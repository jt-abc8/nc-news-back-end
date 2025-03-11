const {
    selectArticles,
    selectArticleByID,
    appendCommentCount,
} = require("../models/articles.model");

exports.getArticles = (req, res, next) => {
    selectArticles()
        // .then((articles) => appendCommentCount(articles))
        .then((articles) => res.status(200).send({ articles }))
        .catch((err) => next(err));
};

exports.getArticleByID = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleByID(article_id)
        .then((article) => res.status(200).send({ article }))
        .catch((err) => next(err));
};

