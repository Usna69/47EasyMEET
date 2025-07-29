const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log('=== DEBUGGING LOGIN PROCESS ===');
    
    // Step 1: Check if admin user exists
    console.log('\n1. Checking admin user in database...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'Adminmeets@nairobi.go.ke' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    });

    // Step 2: Test password verification
    console.log('\n2. Testing password verification...');
    const testPassword = 'MEETM@st@123';
    const isValidPassword = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log('Password test:', {
      inputPassword: testPassword,
      isValid: isValidPassword,
      hashedPasswordLength: adminUser.password.length
    });

    // Step 3: Simulate the login API logic
    console.log('\n3. Simulating login API logic...');
    
    // This is exactly what the login API does
    const user = await prisma.user.findUnique({ 
      where: { email: 'Adminmeets@nairobi.go.ke' } 
    });
    
    if (!user) {
      console.log('❌ User not found in API simulation');
      return;
    }

    console.log('✅ User found in API simulation');

    const validPassword = await bcrypt.compare(testPassword, user.password);
    if (!validPassword) {
      console.log('❌ Password invalid in API simulation');
      return;
    }

    console.log('✅ Password valid in API simulation');

    // Step 4: Show what the API would return
    const { password: _, ...userWithoutPassword } = user;
    console.log('\n4. API would return:', {
      success: true,
      user: userWithoutPassword
    });

    console.log('\n✅ All login checks passed!');

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin(); 