import { DataSource } from 'typeorm';

async function updatePassword() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'wav14298_thangmaytesla',
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  });

  try {
    await dataSource.initialize();
    console.log('📦 Connected to DB');
    
    const result = await dataSource.query(`UPDATE staff SET password = ? WHERE email = ?`, [
      '$2b$10$0UWfZ1B3SUCw6N25QYbsLFNzn/N.3X5TTrvM8JtFw8M/w1s9d7y3O', 
      'admin@gmail.com'
    ]);
    console.log('✅ Update result:', result);
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

updatePassword();
