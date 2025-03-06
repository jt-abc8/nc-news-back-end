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
