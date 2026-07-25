const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.ffayctfbfaiurttrbuag:Kiaracondong123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&hostaddr=43.202.154.182"
    }
  }
});

async function main() {
  try {
    const movies = await prisma.movie.findMany({ take: 1 });
    console.log("Success with hostaddr:", movies.length, "movies found");
  } catch (e) {
    console.error("Error connecting with hostaddr:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
