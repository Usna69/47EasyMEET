const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'Adminmeets@nairobi.go.ke' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists in database');
      return;
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('MEETM@st@123', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'Adminmeets@nairobi.go.ke',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Administration',
        designation: 'System Administrator'
      }
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 