const mysql = require('mysql2/promise');
async function test() {
  const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'wav14298_thangmaytesla' });
  const [tables] = await connection.execute('SHOW TABLES');
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    try {
      const [cols] = await connection.execute('SHOW COLUMNS FROM ' + tableName + ' LIKE "createdAt"');
      if (cols.length > 0) {
        const [res] = await connection.execute('SELECT COUNT(*) as c FROM ' + tableName + ' WHERE DATE(createdAt) = CURDATE()');
        if (res[0].c > 0) {
          console.log(tableName + ' has ' + res[0].c + ' new rows today!');
          const [dt] = await connection.execute('SELECT * FROM ' + tableName + ' ORDER BY id DESC LIMIT 1');
          console.log(dt);
        }
      }
    } catch(e) {}
  }
  connection.end();
}
test().catch(console.error);
