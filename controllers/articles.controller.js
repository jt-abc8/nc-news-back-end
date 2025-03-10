const { selectArticleByID } = require("../models/articles.model");

exports.getArticleByID = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleByID(article_id)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch((err) => next(err));
};
