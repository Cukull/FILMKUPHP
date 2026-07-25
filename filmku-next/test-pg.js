const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.ffayctfbfaiurttrbuag:Kiaracondong123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=disable"
});

async function testConnection() {
  console.log("Attempting to connect with pg (NO SSL)...");
  try {
    await client.connect();
    console.log("Connected successfully to PostgreSQL without SSL!");
    const res = await client.query('SELECT NOW()');
    console.log("Query result:", res.rows[0]);
  } catch (err) {
    console.error("Connection error:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
