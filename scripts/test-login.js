const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'adminmeets@nairobi.go.ke' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('  Email:', adminUser.email);
    console.log('  Name:', adminUser.name);
    console.log('  Role:', adminUser.role);
    console.log('  Has password:', !!adminUser.password);

    // Test password verification
    const testPassword = 'hYpYLJBAA0zc';
    const isValid = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log('🔐 Password verification test:');
    console.log('  Test password:', testPassword);
    console.log('  Password valid:', isValid);

    if (!isValid) {
      console.log('❌ Password verification failed. Resetting password...');
      
      // Reset password
      const newPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { email: 'adminmeets@nairobi.go.ke' },
        data: { 
          password: hashedPassword,
          isFirstLogin: true
        }
      });

      console.log('✅ Password reset successful');
      console.log('  New password:', newPassword);
      console.log('  Please try logging in with:');
      console.log('    Email: adminmeets@nairobi.go.ke');
      console.log('    Password: admin123');
    } else {
      console.log('✅ Password verification successful');
      console.log('  Please try logging in with:');
      console.log('    Email: adminmeets@nairobi.go.ke');
      console.log('    Password: hYpYLJBAA0zc');
    }

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin(); 