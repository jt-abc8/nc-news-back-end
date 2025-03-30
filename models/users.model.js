const db = require("../db/connection");
const { checkExists, reject } = require("../utils");

exports.selectUsers = (username) => {
   if (username) {
      return checkExists("users", "username", username).then((user) => {
         return user ? { user } : reject(404);
      });
   }

   return db.query("SELECT * FROM users").then(({ rows }) => {
      return { users: rows };
   });
};
