const { createConnection } = require('mysql2');

const connection = createConnection(
    {
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'employees'
  },
  console.log(`Connected to the Employees database.`)
);

connection.connect (function (err) {
    if (err) throw err;
});

module.exports = connection;