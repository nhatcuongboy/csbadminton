// Script to update user password - JavaScript version
const { PrismaClient } = require('./src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateUserPassword(email, newPassword) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      console.log('Creating new user instead...')
      
      // Create new user if not exists
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      const newUser = await prisma.user.create({
        data: {
          email: email,
          name: 'Nhật Cường',
          role: 'HOST',
          password: hashedPassword,
        },
      })
      
      console.log(`✅ New user created successfully!`)
      console.log(`User ID: ${newUser.id}`)
      console.log(`Email: ${newUser.email}`)
      console.log(`Name: ${newUser.name}`)
      console.log(`Role: ${newUser.role}`)
      return newUser
    }

    console.log(`✅ User found: ${user.name} (${user.email})`)
    
    // Hash new password
    console.log('🔐 Hashing new password...')
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    console.log('💾 Updating password in database...')
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    console.log(`✅ Password updated successfully for user: ${email}`)
    console.log(`User ID: ${user.id}`)
    console.log(`User Name: ${user.name}`)
    console.log(`User Role: ${user.role}`)
    
    return user
  } catch (error) {
    console.error('❌ Error updating password:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  }
}

// Run the function
updateUserPassword('nhatcuongboy@gmail.com', 'Rambolun@69')
  .then((user) => {
    console.log('\n🎉 Operation completed successfully!')
    if (user) {
      console.log('You can now sign in with:')
      console.log(`Email: ${user.email}`)
      console.log(`Password: Rambolun@69`)
    }
  })
  .catch((error) => {
    console.error('\n💥 Operation failed:', error.message)
    process.exit(1)
  })
