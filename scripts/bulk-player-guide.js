// Complete solution for creating 12 random players
// This script works with any session ID you provide

console.log('📋 BULK PLAYER CREATION SCRIPT');
console.log('==============================');

const sessionId = "cmeejcmnl000l0q36twqkh3gf"; // You can change this
const apiPort = 3002; // Adjust if your server runs on different port

// Diverse player data
const players = [
  {
    playerNumber: 1,
    name: "Nguyễn Văn Minh",
    gender: "MALE",
    level: "TB",
    levelDescription: "Trung bình",
    phone: "0901234567",
    requireConfirmInfo: false
  },
  {
    playerNumber: 2,
    name: "Trần Thị Hương",
    gender: "FEMALE",
    level: "TB_PLUS",
    levelDescription: "Trung bình mạnh",
    phone: "0912345678",
    requireConfirmInfo: true
  },
  {
    playerNumber: 3,
    name: "Lê Hoàng Nam",
    gender: "MALE",
    level: "Y_PLUS",
    levelDescription: "Yếu hơn Trung bình - Yếu",
    phone: "0923456789",
    requireConfirmInfo: false
  },
  {
    playerNumber: 4,
    name: "Phan Thị Linh",
    gender: "FEMALE",
    level: "K",
    levelDescription: "Khá",
    phone: "0934567890",
    requireConfirmInfo: true
  },
  {
    playerNumber: 5,
    name: "Vũ Minh Tuấn",
    gender: "MALE",
    level: "TBY",
    levelDescription: "Trung bình - Yếu",
    phone: "0945678901",
    requireConfirmInfo: false
  },
  {
    playerNumber: 6,
    name: "Đặng Thị Hoa",
    gender: "FEMALE",
    level: "TB_MINUS",
    levelDescription: "Trung bình yếu",
    phone: "0956789012",
    requireConfirmInfo: false
  },
  {
    playerNumber: 7,
    name: "Bùi Thành Đạt",
    gender: "MALE",
    level: "Y",
    levelDescription: "Mức độ Yếu",
    phone: "0967890123",
    requireConfirmInfo: true
  },
  {
    playerNumber: 8,
    name: "Hoàng Thị Yến",
    gender: "FEMALE",
    level: "TB",
    levelDescription: "Trung bình",
    phone: "0978901234",
    requireConfirmInfo: false
  },
  {
    playerNumber: 9,
    name: "Đinh Minh Hải",
    gender: "MALE",
    level: "TB_PLUS",
    levelDescription: "Trung bình mạnh",
    phone: "0989012345",
    requireConfirmInfo: false
  },
  {
    playerNumber: 10,
    name: "Lý Thị Kim",
    gender: "FEMALE",
    level: "Y_MINUS",
    levelDescription: "Yếu hơn mức Y",
    phone: "0990123456",
    requireConfirmInfo: true
  },
  {
    playerNumber: 11,
    name: "Phạm Thành Vinh",
    gender: "MALE",
    level: "K",
    levelDescription: "Khá",
    phone: "0991234567",
    requireConfirmInfo: false
  },
  {
    playerNumber: 12,
    name: "Ngô Thị Vân",
    gender: "FEMALE",
    level: "TBY",
    levelDescription: "Trung bình - Yếu",
    phone: "0992345678",
    requireConfirmInfo: true
  }
];

console.log(`🎯 Session ID: ${sessionId}`);
console.log(`🔢 Total players to create: ${players.length}`);
console.log(`🌐 API URL: http://localhost:${apiPort}/api/sessions/${sessionId}/players/bulk`);

console.log('\n📊 Player Summary:');
players.forEach((player, index) => {
  console.log(`  ${index + 1}. ${player.name} (${player.gender}) - Level: ${player.level}`);
});

console.log('\n🔧 CURL COMMAND TO RUN:');
console.log('======================');
console.log(`curl -X POST 'http://localhost:${apiPort}/api/sessions/${sessionId}/players/bulk' \\`);
console.log(`  -H 'Content-Type: application/json' \\`);
console.log(`  -d '${JSON.stringify(players)}' | jq '.'`);

console.log('\n📋 RAW JSON DATA:');
console.log('================');
console.log(JSON.stringify(players, null, 2));

console.log('\n💡 INSTRUCTIONS:');
console.log('================');
console.log('1. Copy the CURL command above');
console.log('2. Run it in your terminal');
console.log('3. Check the response for success/error messages');
console.log('4. If session ID is wrong, update it in this script and re-run');

console.log('\n🔍 TROUBLESHOOTING:');
console.log('===================');
console.log('- If session not found: Check session ID or create a new session first');
console.log('- If player numbers conflict: Check existing players in the session');
console.log('- If server not running: Start your development server on the correct port');
