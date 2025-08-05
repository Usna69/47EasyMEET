const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Generate a temporary password
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function createViewOnlyUser() {
  try {
    console.log('Creating VIEW_ONLY user...');
    
    // Check if view-only user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'viewonly@test.com' }
    });

    if (existingUser) {
      console.log('VIEW_ONLY user already exists in database');
      console.log('Email:', existingUser.email);
      console.log('Name:', existingUser.name);
      console.log('Role:', existingUser.role);
      console.log('User Level:', existingUser.userLevel);
      return;
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create VIEW_ONLY user
    const viewOnlyUser = await prisma.user.create({
      data: {
        email: 'viewonly@test.com',
        name: 'View Only User',
        password: hashedPassword,
        role: 'VIEW_ONLY',
        department: 'IDE',
        designation: 'View Only Access',
        userLevel: 'REGULAR',
        customRole: 'View Only Access - Can browse and register for meetings',
        isFirstLogin: true
      }
    });

    console.log('VIEW_ONLY user created successfully:');
    console.log('ID:', viewOnlyUser.id);
    console.log('Email:', viewOnlyUser.email);
    console.log('Name:', viewOnlyUser.name);
    console.log('Role:', viewOnlyUser.role);
    console.log('User Level:', viewOnlyUser.userLevel);
    console.log('Department:', viewOnlyUser.department);
    console.log('Temporary Password:', tempPassword);
    
    console.log('\n📋 Login Credentials:');
    console.log('  Email: viewonly@test.com');
    console.log('  Password:', tempPassword);
    console.log('  Role: VIEW_ONLY');
    console.log('  User Level: REGULAR');
    
  } catch (error) {
    console.error('Error creating VIEW_ONLY user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createViewOnlyUser(); 