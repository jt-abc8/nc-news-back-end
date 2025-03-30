exports.handleCustomErrors = (err, req, res, next) => {
   err.status && err.msg
      ? res.status(err.status).send({ msg: err.msg })
      : next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
   const codes = ["22P02", "2201W", "23502", "23503"];
   codes.includes(err.code)
      ? res.status(400).send({ msg: "400 Bad Request" })
      : next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
   console.log(err);
   res.status(500).send({ msg: "500 Internal Server Error" });
};
