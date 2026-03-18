const mysql = require('mysql2/promise');

async function updatePassword() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wav14298_thangmaytesla',
      port: 3306
    });

    console.log('📦 Connected to DB (mysql2)');
    
    const [rows, fields] = await connection.execute(
      `UPDATE staff SET password = ? WHERE email = ?`,
      ['$2b$10$0UWfZ1B3SUCw6N25QYbsLFNzn/N.3X5TTrvM8JtFw8M/w1s9d7y3O', 'admin@gmail.com']
    );
    
    console.log('✅ Update result:', rows);
    await connection.end();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

updatePassword();
