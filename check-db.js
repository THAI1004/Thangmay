const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wav14298_thangmaytesla',
      port: 3306
    });

    console.log('📦 Connected to DB');
    
    const [rows] = await connection.execute(
      `SELECT email, password FROM staff WHERE email = 'admin@gmail.com'`
    );
    
    console.log('✅ Current DB data:', rows);

    // Also testing hash locally
    const bcrypt = require('bcrypt');
    if (rows.length > 0) {
      const dbHash = rows[0].password;
      const isMatch = await bcrypt.compare('123456789', dbHash);
      console.log('✅ Local bcrypt comparison with DB hash:', isMatch);
    }
    
    await connection.end();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkDatabase();
