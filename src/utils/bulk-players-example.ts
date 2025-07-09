import { PlayerService, BulkPlayerData, Level } from "@/lib/api";

// Ví dụ về cách sử dụng Bulk Players API

export async function createExampleBulkPlayers(sessionId: string) {
  try {
    // Đầu tiên, lấy thông tin session để biết có bao nhiêu slot trống
    const bulkInfo = await PlayerService.getBulkPlayersInfo(sessionId);
    
    console.log("Session info:", {
      sessionName: bulkInfo.sessionName,
      maxPlayers: bulkInfo.maxPlayers,
      currentPlayers: bulkInfo.currentPlayersCount,
      availableSlots: bulkInfo.availableSlots,
      availableNumbers: bulkInfo.availablePlayerNumbers,
    });

    // Tạo dữ liệu mẫu cho players
    const samplePlayers: BulkPlayerData[] = [
      {
        playerNumber: bulkInfo.availablePlayerNumbers[0] || 1,
        name: "Nguyễn Văn A",
        gender: "MALE",
        level: Level.TB,
        levelDescription: "Đánh TB, smash tốt",
        phone: "0123456789",
      },
      {
        playerNumber: bulkInfo.availablePlayerNumbers[1] || 2,
        name: "Trần Thị B",
        gender: "FEMALE",
        level: Level.TB_PLUS,
        levelDescription: "Đánh giải B",
        phone: "0987654321",
      },
      {
        playerNumber: bulkInfo.availablePlayerNumbers[2] || 3,
        // Chỉ có playerNumber, các field khác optional
      },
      {
        playerNumber: bulkInfo.availablePlayerNumbers[3] || 4,
        name: "Lê Văn C",
        level: Level.Y,
      },
    ];

    // Tạo bulk players
    const result = await PlayerService.createBulkPlayers(sessionId, samplePlayers);
    
    console.log("Bulk players created:", {
      createdCount: result.createdPlayers.length,
      players: result.createdPlayers,
      message: result.message,
    });

    return result;
  } catch (error) {
    console.error("Error creating bulk players:", error);
    throw error;
  }
}

// Function để tạo players từ CSV data
export function parseCSVToBulkPlayers(csvData: string): BulkPlayerData[] {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const player: BulkPlayerData = {
      playerNumber: parseInt(values[0]) || (index + 1),
    };

    // Map CSV columns to player fields
    headers.forEach((header, i) => {
      const value = values[i];
      if (!value) return;

      switch (header.toLowerCase()) {
        case 'name':
          player.name = value;
          break;
        case 'gender':
          player.gender = value.toUpperCase() as "MALE" | "FEMALE";
          break;
        case 'level':
          player.level = value.toUpperCase() as any;
          break;
        case 'leveldescription':
        case 'level description':
          player.levelDescription = value;
          break;
        case 'requireconfirminfo':
        case 'require confirm info':
          player.requireConfirmInfo = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
          break;
        case 'phone':
          player.phone = value;
          break;
      }
    });

    return player;
  });
}

// Function để validate bulk player data
export function validateBulkPlayerData(
  playersData: BulkPlayerData[],
  availableNumbers: number[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  playersData.forEach((player, index) => {
    // Check required playerNumber
    if (!player.playerNumber) {
      errors.push(`Player ${index + 1}: playerNumber is required`);
    }

    // Check if playerNumber is available
    if (player.playerNumber && !availableNumbers.includes(player.playerNumber)) {
      errors.push(`Player ${index + 1}: playerNumber ${player.playerNumber} is not available`);
    }

    // Check duplicate playerNumbers in the data
    const duplicates = playersData.filter(p => p.playerNumber === player.playerNumber);
    if (duplicates.length > 1) {
      errors.push(`Player ${index + 1}: duplicate playerNumber ${player.playerNumber}`);
    }

    // Validate gender if provided
    if (player.gender && !["MALE", "FEMALE"].includes(player.gender)) {
      errors.push(`Player ${index + 1}: invalid gender "${player.gender}"`);
    }

    // Validate level if provided
    if (player.level && !["Y_MINUS", "Y", "Y_PLUS", "TBY", "TB_MINUS", "TB", "TB_PLUS", "K"].includes(player.level)) {
      errors.push(`Player ${index + 1}: invalid level "${player.level}"`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Example CSV format
export const EXAMPLE_CSV = `playerNumber,name,gender,level,levelDescription,requireConfirmInfo,phone
1,Nguyễn Văn A,MALE,TB,"Đánh TB, smash tốt",true,0123456789
2,Trần Thị B,FEMALE,TB_PLUS,"Đánh giải B, 5 năm kinh nghiệm",false,0987654321
3,Lê Văn C,MALE,Y,"Mới chơi, đánh tự học",true,0111222333
4,Phạm Thị D,FEMALE,TBY,"Có năng khiếu, đánh nhanh",false,0444555666`;
