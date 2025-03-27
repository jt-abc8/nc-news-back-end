const db = require("../db/connection");
const { checkExists } = require("../db/seeds/utils");

exports.selectUsers = ({ username }) => {
   if (username) {
      return checkExists("users", "username", username).then((user) => {
         return user
            ? { user }
            : Promise.reject({
                 status: 404,
                 msg: "404 Not Found",
              });
      });
   }

   return db.query("SELECT * FROM users").then(({ rows }) => {
      return { users: rows };
   });
};
