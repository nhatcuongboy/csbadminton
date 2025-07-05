const { PrismaClient } = require("./src/generated/prisma");

async function testConnections() {
  const connections = [
    {
      name: "Direct Connection",
      url: "postgresql://postgres:WTuzR3hzvCaroOzu@db.wlryixuozijkpdpwnuri.supabase.co:5432/postgres",
    },
    {
      name: "Connection Pooling",
      url: "postgresql://postgres:WTuzR3hzvCaroOzu@db.wlryixuozijkpdpwnuri.supabase.co:6543/postgres?pgbouncer=true",
    },
    {
      name: "Direct Connection with SSL",
      url: "postgresql://postgres:WTuzR3hzvCaroOzu@db.wlryixuozijkpdpwnuri.supabase.co:5432/postgres?sslmode=require",
    },
    {
      name: "Connection Pooling with SSL",
      url: "postgresql://postgres:WTuzR3hzvCaroOzu@db.wlryixuozijkpdpwnuri.supabase.co:6543/postgres?pgbouncer=true&sslmode=require",
    },
  ];

  for (const conn of connections) {
    console.log(`\nTesting ${conn.name}...`);
    console.log(`URL: ${conn.url}`);

    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: conn.url,
          },
        },
      });

      // Test basic connection
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log(`✅ ${conn.name}: SUCCESS`);
      console.log(`   Result: ${JSON.stringify(result)}`);

      // Test user count
      const userCount = await prisma.user.count();
      console.log(`   User count: ${userCount}`);

      await prisma.$disconnect();
    } catch (error) {
      console.log(`❌ ${conn.name}: FAILED`);
      console.log(`   Error: ${error.message}`);
    }
  }
}

testConnections().catch(console.error);
