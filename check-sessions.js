// Check current sessions status
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkSessions() {
  try {
    console.log("🔍 Checking sessions...");
    
    const sessions = await prisma.session.findMany({
      include: {
        courts: {
          include: {
            currentPlayers: true,
          },
        },
        players: true,
        matches: {
          where: {
            status: "IN_PROGRESS",
          },
        },
      },
    });

    console.log(`📊 Total sessions: ${sessions.length}`);
    
    sessions.forEach((session, index) => {
      console.log(`\n📋 Session ${index + 1}:`);
      console.log(`  ID: ${session.id}`);
      console.log(`  Status: ${session.status}`);
      console.log(`  Title: ${session.title}`);
      console.log(`  Courts: ${session.courts.length}`);
      console.log(`  Players: ${session.players.length}`);
      console.log(`  Active Matches: ${session.matches.length}`);
      
      if (session.matches.length > 0) {
        session.matches.forEach((match, mIndex) => {
          console.log(`    Match ${mIndex + 1}: Court ${match.courtId} - ${match.status}`);
        });
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessions();
