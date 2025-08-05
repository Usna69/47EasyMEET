const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.attendee.deleteMany();
    await prisma.meetingResource.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log('👥 Creating test users...');
    
    const adminUser = await prisma.user.create({
      data: {
        name: "System Administrator",
        email: "adminmeets@nairobi.go.ke",
        password: await bcrypt.hash("XSMxK11GY0#O", 10),
        role: "ADMIN",
        department: "Administration",
        userLevel: "REGULAR",
        customRole: "System Administrator - Full system access",
        isFirstLogin: false,
        userLetterhead: "defaultlh.jpg",
        swgLetterhead: "swg.jpg"
      }
    });

    const boardMember = await prisma.user.create({
      data: {
        name: "Dr. Sarah Mwangi",
        email: "sarah.mwangi@nairobi.go.ke",
        password: await bcrypt.hash("Board2025!", 10),
        role: "VIEW_ONLY",
        department: "Board of Directors",
        userLevel: "BOARD_MEMBER",
        customRole: "Board Member - High-level governance and decision-making role",
        isFirstLogin: false,
        userLetterhead: "defaultlh.jpg",
        swgLetterhead: "swg.jpg"
      }
    });

    const governorOffice = await prisma.user.create({
      data: {
        name: "Brian Kiprono",
        email: "brian.kiprono.n@gmail.com",
        password: await bcrypt.hash("Governor2025!", 10),
        role: "VIEW_ONLY",
        department: "Office of the Governor",
        userLevel: "GOVERNOR_OFFICE",
        customRole: "Office of the Governor - Executive and gubernatorial functions",
        isFirstLogin: false,
        userLetterhead: "defaultlh.jpg",
        swgLetterhead: "swg.jpg"
      }
    });

    console.log('✅ Users created successfully');

    // Create meetings
    console.log('📅 Creating test meetings...');
    
    const meetings = await Promise.all([
      prisma.meeting.create({
        data: {
          title: "Board Meeting - Q1 Review",
          description: "Quarterly board meeting to review Q1 performance, discuss strategic initiatives, and approve budget allocations for the upcoming quarter.",
          date: new Date("2025-01-15T10:00:00Z"),
          location: "Conference Room A, Governor's Office",
          creatorEmail: adminUser.email,
          sector: "BOARD",
          creatorType: "ADMIN",
          meetingType: "PHYSICAL",
          registrationEnd: new Date("2025-01-14T18:00:00Z"),
          meetingLevel: "BOARD",
          restrictedAccess: true,
          meetingCategory: "BOARD_MEETING",
          organization: "Nairobi County Government"
        }
      }),
      
      prisma.meeting.create({
        data: {
          title: "Governor's Cabinet Session",
          description: "Monthly cabinet session to discuss policy implementation, review departmental reports, and address key governance issues.",
          date: new Date("2025-01-20T14:00:00Z"),
          location: "Executive Boardroom, County Hall",
          creatorEmail: adminUser.email,
          sector: "GOVERNOR",
          creatorType: "ADMIN",
          meetingType: "PHYSICAL",
          registrationEnd: new Date("2025-01-19T18:00:00Z"),
          meetingLevel: "GOVERNOR",
          restrictedAccess: true,
          meetingCategory: "CABINET_SESSION",
          organization: "Nairobi County Government"
        }
      }),
      
      prisma.meeting.create({
        data: {
          title: "Infrastructure Development Committee",
          description: "Committee meeting to review ongoing infrastructure projects, discuss new proposals, and allocate resources for development initiatives.",
          date: new Date("2025-01-25T09:00:00Z"),
          location: "Committee Room 3, County Hall",
          creatorEmail: adminUser.email,
          sector: "INFRASTRUCTURE",
          creatorType: "ADMIN",
          meetingType: "PHYSICAL",
          registrationEnd: new Date("2025-01-24T18:00:00Z"),
          meetingLevel: "REGULAR",
          restrictedAccess: false,
          meetingCategory: "COMMITTEE_MEETING",
          organization: "Nairobi County Government"
        }
      }),
      
      prisma.meeting.create({
        data: {
          title: "Healthcare Policy Review",
          description: "Policy review session to discuss healthcare reforms, review medical facility upgrades, and address public health concerns.",
          date: new Date("2025-02-01T11:00:00Z"),
          location: "Health Department Conference Room",
          creatorEmail: adminUser.email,
          sector: "HEALTH",
          creatorType: "ADMIN",
          meetingType: "PHYSICAL",
          registrationEnd: new Date("2025-01-31T18:00:00Z"),
          meetingLevel: "REGULAR",
          restrictedAccess: false,
          meetingCategory: "POLICY_REVIEW",
          organization: "Nairobi County Government"
        }
      }),
      
      prisma.meeting.create({
        data: {
          title: "Emergency Response Coordination",
          description: "Emergency response coordination meeting to discuss disaster preparedness, review emergency protocols, and coordinate response teams.",
          date: new Date("2025-02-05T15:00:00Z"),
          location: "Emergency Operations Center",
          creatorEmail: adminUser.email,
          sector: "EMERGENCY",
          creatorType: "ADMIN",
          meetingType: "PHYSICAL",
          registrationEnd: new Date("2025-02-04T18:00:00Z"),
          meetingLevel: "REGULAR",
          restrictedAccess: false,
          meetingCategory: "EMERGENCY_COORDINATION",
          organization: "Nairobi County Government"
        }
      })
    ]);

    console.log('✅ Meetings created successfully');

    // Create registrations/attendees
    console.log('📝 Creating meeting registrations...');
    
    const registrations = await Promise.all([
      // Board Member registrations
      prisma.attendee.create({
        data: {
          name: boardMember.name,
          email: boardMember.email,
          phoneNumber: "+254700123456",
          organization: "Nairobi County Government",
          designation: "Board Member",
          meetingId: meetings[0].id // Board Meeting
        }
      }),
      
      prisma.attendee.create({
        data: {
          name: boardMember.name,
          email: boardMember.email,
          phoneNumber: "+254700123456",
          organization: "Nairobi County Government",
          designation: "Board Member",
          meetingId: meetings[1].id // Governor's Cabinet Session
        }
      }),
      
      // Governor Office registrations
      prisma.attendee.create({
        data: {
          name: governorOffice.name,
          email: governorOffice.email,
          phoneNumber: "+254700789012",
          organization: "Nairobi County Government",
          designation: "Governor's Office",
          meetingId: meetings[1].id // Governor's Cabinet Session
        }
      }),
      
      prisma.attendee.create({
        data: {
          name: governorOffice.name,
          email: governorOffice.email,
          phoneNumber: "+254700789012",
          organization: "Nairobi County Government",
          designation: "Governor's Office",
          meetingId: meetings[2].id // Infrastructure Development Committee
        }
      }),
      
      prisma.attendee.create({
        data: {
          name: governorOffice.name,
          email: governorOffice.email,
          phoneNumber: "+254700789012",
          organization: "Nairobi County Government",
          designation: "Governor's Office",
          meetingId: meetings[3].id // Healthcare Policy Review
        }
      }),
      
      // Admin registrations (for all meetings)
      prisma.attendee.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          phoneNumber: "+254700345678",
          organization: "Nairobi County Government",
          designation: "System Administrator",
          meetingId: meetings[0].id // Board Meeting
        }
      }),
      
      prisma.attendee.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          phoneNumber: "+254700345678",
          organization: "Nairobi County Government",
          designation: "System Administrator",
          meetingId: meetings[1].id // Governor's Cabinet Session
        }
      }),
      
      prisma.attendee.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          phoneNumber: "+254700345678",
          organization: "Nairobi County Government",
          designation: "System Administrator",
          meetingId: meetings[2].id // Infrastructure Development Committee
        }
      }),
      
      prisma.attendee.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          phoneNumber: "+254700345678",
          organization: "Nairobi County Government",
          designation: "System Administrator",
          meetingId: meetings[3].id // Healthcare Policy Review
        }
      }),
      
      prisma.attendee.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          phoneNumber: "+254700345678",
          organization: "Nairobi County Government",
          designation: "System Administrator",
          meetingId: meetings[4].id // Emergency Response Coordination
        }
      })
    ]);

    console.log('✅ Registrations created successfully');

    // Create some meeting resources
    console.log('📎 Creating meeting resources...');
    
    await Promise.all([
      prisma.meetingResource.create({
        data: {
          fileName: "Q1_Board_Agenda.pdf",
          fileType: "pdf",
          fileSize: 2048576,
          fileUrl: "/uploads/Q1_Board_Agenda.pdf",
          description: "Q1 Board Meeting Agenda and supporting documents",
          meetingId: meetings[0].id
        }
      }),
      
      prisma.meetingResource.create({
        data: {
          fileName: "Cabinet_Session_Minutes.docx",
          fileType: "docx",
          fileSize: 1048576,
          fileUrl: "/uploads/Cabinet_Session_Minutes.docx",
          description: "Previous cabinet session minutes for reference",
          meetingId: meetings[1].id
        }
      }),
      
      prisma.meetingResource.create({
        data: {
          fileName: "Infrastructure_Projects_Overview.pptx",
          fileType: "pptx",
          fileSize: 5242880,
          fileUrl: "/uploads/Infrastructure_Projects_Overview.pptx",
          description: "Overview of ongoing infrastructure development projects",
          meetingId: meetings[2].id
        }
      })
    ]);

    console.log('✅ Resources created successfully');

    console.log('\n🎉 Test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${3} (Admin, Board Member, Governor Office)`);
    console.log(`   📅 Meetings: ${5} (Board, Cabinet, Infrastructure, Healthcare, Emergency)`);
    console.log(`   📝 Registrations: ${registrations.length}`);
    console.log(`   📎 Resources: ${3}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: adminmeets@nairobi.go.ke / XSMxK11GY0#O');
    console.log('   Board Member: sarah.mwangi@nairobi.go.ke / Board2025!');
    console.log('   Governor Office: brian.kiprono.n@gmail.com / Governor2025!');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedTestData }; 