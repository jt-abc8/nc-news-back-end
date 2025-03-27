const db = require("./db/connection");
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

exports.checkExists = async (table, column, value) => {
   const queryStr = format(`SELECT * FROM %I where %I = $1`, table, column);
   const { rows } = await db.query(queryStr, [value]);
   return rows[0] ?? false;
};
