const { selectUsers } = require("../models/users.model");

exports.getUsers = (req, res, next) => {
   selectUsers(req.params)
      .then((userObj) => res.status(200).send(userObj))
      .catch((err) => next(err));
};
