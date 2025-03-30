const { selectUsers } = require("../models/users.model");

exports.getUsers = (req, res, next) => {
   const { username } = req.params;
   selectUsers(username)
      .then((userObj) => res.status(200).send(userObj))
      .catch((err) => next(err));
};
