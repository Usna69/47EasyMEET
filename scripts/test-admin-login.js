const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('Testing admin login credentials...');
    
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'Adminmeets@nairobi.go.ke' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      return;
    }

    console.log('✅ Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    });

    // Test password verification
    const testPassword = 'MEETM@st@123';
    const isValidPassword = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log('Password verification:', {
      testPassword: testPassword,
      isValid: isValidPassword,
      hashedPasswordLength: adminUser.password.length
    });

    if (isValidPassword) {
      console.log('✅ Admin password is correct');
    } else {
      console.log('❌ Admin password is incorrect');
    }

  } catch (error) {
    console.error('Error testing admin login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin(); 