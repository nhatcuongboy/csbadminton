// Check match details
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkMatches() {
  try {
    console.log("🔍 Checking matches...");
    
    const matches = await prisma.match.findMany({
      where: {
        status: "IN_PROGRESS",
      },
      include: {
        court: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    console.log(`📊 Active matches: ${matches.length}`);
    
    matches.forEach((match, index) => {
      console.log(`\n🎾 Match ${index + 1}:`);
      console.log(`  ID: ${match.id}`);
      console.log(`  Court: ${match.court.courtNumber}`);
      console.log(`  Status: ${match.status}`);
      console.log(`  Start Time: ${match.startTime}`);
      console.log(`  Players: ${match.players.length}`);
      
      match.players.forEach((player, pIndex) => {
        console.log(`    Player ${pIndex + 1}: ${player.player.name} (#${player.player.playerNumber})`);
      });
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMatches();
