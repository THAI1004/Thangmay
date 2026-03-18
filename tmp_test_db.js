const mysql = require('mysql2/promise');
require('dotenv').config();

async function testUpdate() {
  console.log("Connecting to DB...");
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASS || '',
    database: process.env.DATABASE_NAME || 'wav14298_thangmaytesla',
  });
  
  // Try finding an ID
  const [rows] = await conn.execute("SELECT id, actualDate FROM maintenance ORDER BY id DESC LIMIT 1");
  if (rows.length === 0) return console.log("No maintenance records found");
  
  const targetId = rows[0].id;
  console.log("Updating maintenance ID", targetId, "current actualDate=", rows[0].actualDate);
  
  // Do exactly what TypeORM does conceptually
  const updateQuery = "UPDATE maintenance SET actualDate = ? WHERE id = ?";
  const result = await conn.execute(updateQuery, ['2026-03-25', targetId]);
  
  console.log("Update result:", result[0]);
  
  const [newRows] = await conn.execute("SELECT id, actualDate FROM maintenance WHERE id = ?", [targetId]);
  console.log("After update:", newRows[0]);
  
  await conn.end();
}
testUpdate().catch(console.error);
