const {
   selectArticles,
   selectArticleByID,
   updateArticleVotes,
   insertArticle,
} = require("../models/articles.model");

exports.getArticles = (req, res, next) => {
   selectArticles(req.query)
      .then((articleObj) => res.status(200).send(articleObj))
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

exports.postArticle = (req, res, next) => {
   const { author, title, body, topic, article_img_url } = req.body;
   insertArticle(author, title, body, topic, article_img_url)
      .then((article) => res.status(201).send({ article }))
      .catch((err) => next(err));
};
