require('dotenv').config();
module.exports = {
  'dialect': process.env.DBTYPE,
  'host': process.env.DBHOST,
  'database': process.env.DBNAME,
  'username': process.env.DBUSER,
  'password': process.env.DBPASS,
  'logging': false,
  'define': {
    'timestamps': true,
    'paranoid': true,
    // freeze = doesn't auto-plural
    'freezeTableName': false
  },
  'migrationStorageTableName': '_migrations'
}