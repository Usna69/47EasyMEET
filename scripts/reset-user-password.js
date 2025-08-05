const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetUserPassword(email, newPassword) {
  try {
    console.log(`Resetting password for user: ${email}`);
    
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    await prisma.user.update({
      where: { email: email },
      data: { 
        password: hashedPassword,
        isFirstLogin: true
      }
    });

    console.log('\n✅ Password reset successful');
    console.log('  New password:', newPassword);
    console.log('\n📋 Updated Login Credentials:');
    console.log('  Email:', email);
    console.log('  Password:', newPassword);
    console.log('  Role:', user.role);
    console.log('  User Level:', user.userLevel);

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Reset password for the specific user
resetUserPassword('kbtirop@gmail.com', '$stivyQylNO4'); 