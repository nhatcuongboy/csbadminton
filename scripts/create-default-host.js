// Script tạo user làm host mặc định
const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

async function main() {
  try {
    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'nhatcuongboy@gmail.com',
      },
    })

    if (existingUser) {
      console.log('User đã tồn tại:', existingUser)
      return existingUser
    }

    // Tạo user mới với role HOST
    const newUser = await prisma.user.create({
      data: {
        email: 'nhatcuongboy@gmail.com',
        name: 'Nhat Cuong',
        role: 'HOST',
      },
    })

    console.log('Đã tạo user mới:', newUser)
    return newUser
  } catch (error) {
    console.error('Lỗi khi tạo user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(async (user) => {
    console.log(`Host ID của bạn là: ${user.id}`)
    console.log('Hãy sử dụng ID này cho tất cả các session')
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
