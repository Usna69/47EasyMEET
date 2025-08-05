const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser(email) {
  try {
    console.log(`Checking user: ${email}`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  User Level:', user.userLevel);
    console.log('  Department:', user.department);
    console.log('  Has password:', !!user.password);

    // Test password verification
    const testPassword = '$stivyQylNO4';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('\n🔐 Password verification test:');
    console.log('  Test password:', testPassword);
    console.log('  Password valid:', isValid);

    if (!isValid) {
      console.log('❌ Password verification failed');
      console.log('  The password you provided does not match the stored hash');
    } else {
      console.log('✅ Password verification successful');
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check the specific user
checkUser('kbtirop@gmail.com'); 