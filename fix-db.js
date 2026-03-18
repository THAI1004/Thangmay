const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixPassword() {
  try {
    const saltRounds = 10;
    const plainPassword = '123456';
    const newHash = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('🔑 Generated new hash for "123456":', newHash);

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wav14298_thangmaytesla',
      port: 3306
    });

    console.log('📦 Connected to DB');
    
    const [rows] = await connection.execute(
      `UPDATE staff SET password = ? WHERE email = ?`,
      [newHash, 'admin@gmail.com']
    );
    
    console.log('✅ Update result:', rows);
    
    const [check] = await connection.execute(
      `SELECT password FROM staff WHERE email = 'admin@gmail.com'`
    );
    
    if (check.length > 0) {
      console.log('🔍 Hash saved in DB:', check[0].password);
      const isMatch = await bcrypt.compare('123456', check[0].password);
      console.log('✅ DB Hash matches "123456":', isMatch);
    }

    await connection.end();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

fixPassword();
