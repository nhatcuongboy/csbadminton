// Script to create users with custom credentials
const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser(userData) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    })

    if (existingUser) {
      console.log(`❌ User with email ${userData.email} already exists:`)
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Name: ${existingUser.name}`)
      console.log(`   Role: ${existingUser.role}`)
      return existingUser
    }

    // Hash password if provided
    const hashedPassword = userData.password 
      ? await bcrypt.hash(userData.password, 12)
      : null

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role || 'PLAYER',
        password: hashedPassword,
      },
    })

    console.log('✅ Successfully created new user:')
    console.log(`   ID: ${newUser.id}`)
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Name: ${newUser.name}`)
    console.log(`   Role: ${newUser.role}`)
    console.log(`   Password: ${userData.password ? 'Set' : 'Not set'}`)
    
    return newUser
  } catch (error) {
    console.error('❌ Error creating user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get user data from command line arguments or use default
const args = process.argv.slice(2)
let userData

if (args.length >= 3) {
  // Command line usage: node create-user.js "email" "name" "role" "password"
  userData = {
    email: args[0],
    name: args[1],
    role: args[2],
    password: args[3] || null
  }
} else {
  // Default user data
  userData = {
    email: 'nhatcuongboy@gmail.com',
    name: 'Nhật Cường',
    role: 'HOST',
    password: 'Rambolun@69'
  }
}

// Create the user
createUser(userData)
  .then((user) => {
    console.log('\n🎉 User creation completed!')
    if (user.role === 'HOST') {
      console.log(`\n📋 Use this Host ID for sessions: ${user.id}`)
    }
  })
  .catch((error) => {
    console.error('\n💥 User creation failed:', error.message)
    process.exit(1)
  })
