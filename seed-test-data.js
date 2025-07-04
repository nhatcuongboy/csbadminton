import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection successful!");

    // Get or create a test session
    let session = await prisma.session.findFirst({
      where: { status: 'IN_PROGRESS' },
      include: {
        courts: true,
        players: true,
        matches: true,
        host: true
      }
    });

    if (!session) {
      // Create a test user if none exists
      const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          name: 'Test Host',
          email: 'test@example.com',
        }
      });

      // Create a test session
      session = await prisma.session.create({
        data: {
          name: 'Test Badminton Session',
          numberOfCourts: 3,
          sessionDuration: 180,
          maxPlayersPerCourt: 8,
          requirePlayerInfo: true,
          status: 'IN_PROGRESS',
          startTime: new Date(),
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
          hostId: user.id
        },
        include: {
          courts: true,
          players: true,
          matches: true,
          host: true
        }
      });
    }

    console.log(`📊 Session: ${session.name} (ID: ${session.id})`);

    // Create courts if they don't exist
    if (session.courts.length === 0) {
      const courts = await Promise.all([
        prisma.court.create({
          data: {
            name: 'Court 1',
            sessionId: session.id,
            status: 'EMPTY'
          }
        }),
        prisma.court.create({
          data: {
            name: 'Court 2',
            sessionId: session.id,
            status: 'EMPTY'
          }
        }),
        prisma.court.create({
          data: {
            name: 'Court 3',
            sessionId: session.id,
            status: 'EMPTY'
          }
        })
      ]);
      console.log(`✅ Created ${courts.length} courts`);
    }

    // Create test players if they don't exist
    if (session.players.length < 8) {
      const players = [];
      for (let i = session.players.length; i < 8; i++) {
        const player = await prisma.player.create({
          data: {
            sessionId: session.id,
            playerNumber: i + 1,
            name: `Player ${i + 1}`,
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
            level: ['Y', 'Y_PLUS', 'TBY', 'TB_MINUS', 'TB', 'TB_PLUS'][i % 6],
            preFilledByHost: true,
            confirmedByPlayer: true,
            status: i < 4 ? 'WAITING' : 'PLAYING',
            currentWaitTime: Math.floor(Math.random() * 30),
            totalWaitTime: Math.floor(Math.random() * 60)
          }
        });
        players.push(player);
      }
      console.log(`✅ Created ${players.length} additional players`);
    }

    // Create a test match if none exists
    const currentMatches = await prisma.match.findMany({
      where: { 
        sessionId: session.id,
        status: 'IN_PROGRESS'
      }
    });

    if (currentMatches.length === 0) {
      const court = await prisma.court.findFirst({
        where: { sessionId: session.id }
      });
      
      const players = await prisma.player.findMany({
        where: { sessionId: session.id },
        take: 4
      });

      if (court && players.length >= 4) {
        const match = await prisma.match.create({
          data: {
            sessionId: session.id,
            courtId: court.id,
            status: 'IN_PROGRESS',
            startTime: new Date()
          }
        });

        // Create match players
        await Promise.all(players.slice(0, 4).map((player, index) => 
          prisma.matchPlayer.create({
            data: {
              matchId: match.id,
              playerId: player.id,
              position: index + 1
            }
          })
        ));

        // Update court status
        await prisma.court.update({
          where: { id: court.id },
          data: { status: 'IN_USE' }
        });

        // Update player statuses
        await Promise.all(players.slice(0, 4).map(p => 
          prisma.player.update({
            where: { id: p.id },
            data: { 
              status: 'PLAYING',
              currentCourtId: court.id
            }
          })
        ));

        console.log(`✅ Created test match on ${court.name}`);
      }
    }

    // Get final session data
    const finalSession = await prisma.session.findUnique({
      where: { id: session.id },
      include: {
        courts: true,
        players: true,
        matches: {
          include: {
            court: true,
            players: true
          }
        }
      }
    });

    console.log(`📊 Final session state:`);
    console.log(`  - Courts: ${finalSession.courts.length}`);
    console.log(`  - Players: ${finalSession.players.length}`);
    console.log(`  - Active matches: ${finalSession.matches.filter(m => m.status === 'IN_PROGRESS').length}`);
    console.log(`  - Waiting players: ${finalSession.players.filter(p => p.status === 'WAITING').length}`);
    console.log(`  - Playing players: ${finalSession.players.filter(p => p.status === 'PLAYING').length}`);

    console.log(`🎯 Test data seeded successfully!`);
    console.log(`🌐 You can now test the management features at: http://localhost:3002/host/sessions/${session.id}`);

  } catch (error) {
    console.error("❌ Error seeding test data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
