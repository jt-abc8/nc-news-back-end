const db = require("../connection");
const format = require("pg-format");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
   if (!created_at) return { ...otherProperties };
   return { created_at: new Date(created_at), ...otherProperties };
};

exports.getRecordID = async (idKey, tableName, ref) => {
   const { rows } = await db.query(format(`SELECT * FROM %s`, [tableName]));
   const lookup = rows.reduce((obj, record) => {
      obj[record[ref.key]] = record[idKey];
      return obj;
   }, {});
   return lookup[ref.value];
};

exports.checkExists = (table, column, value) => {
   const queryStr = format(`SELECT * FROM %I where %I = $1`, table, column);
   return db.query(queryStr, [value]).then(({ rows }) => {
      return rows.length > 0;
   });
};

exports.updateVotesQuery = (table, idColumn, inc_votes, record_id) => {
   const queryStr = format(
      `UPDATE %I
      SET votes = votes + $1
      WHERE %I = $2 RETURNING *`,
      table,
      idColumn
   );
   return db.query(queryStr, [inc_votes, record_id]).then(({ rows }) => {
      return rows[0];
   });
};
