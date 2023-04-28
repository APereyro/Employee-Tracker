const { createConnection } = require(mysql2);

const connection = createConnection(
    {
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'employee_db'
  },
  console.log(`Connected to the Employee database.`)
);

connection.connect (function (err) {
    if (err) throw err;
});

module.exports = connection;