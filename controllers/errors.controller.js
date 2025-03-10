exports.handleCustomErrors = (err, req, res, next) => {
    err.status && err.msg
        ? res.status(err.status).send({ msg: err.msg })
        : next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
    err.code === "22P02"
        ? res.status(400).send({ msg: "400 Bad Request" })
        : next(err);
};
