# Nairobi Meeting Attendance App - User Guide

## Getting Started

This guide will help you set up and run the Nairobi Meeting Attendance App on your local environment.

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- PostgreSQL database
- npm (usually comes with Node.js)

### Installation Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment Variables**

   The `.env` file is already configured with a default PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/nairobi_meetings?schema=public"
   ```
   
   Adjust this if your PostgreSQL setup is different.

3. **Initialize the Database**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Seed the Database (Optional)**

   ```bash
   npm run seed
   ```

5. **Start the Development Server**

   ```bash
   npm run dev
   ```

6. **Access the Application**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Application

### Home Page
- View all scheduled meetings
- See meeting statistics
- Access quick links to create or manage meetings

### Meeting Details
- View comprehensive information about each meeting
- See the QR code for attendance registration
- View the list of registered attendees

### Attendance Registration
1. Scan the QR code or navigate to the registration page
2. Fill in your name, email, and designation
3. Submit the form to register
4. Receive a confirmation page

### Admin Dashboard
- Access by clicking "Admin" in the navigation menu
- View all meetings with attendance counts
- Options to create, edit, or delete meetings

### Creating a Meeting
1. Navigate to Admin > Create New Meeting
2. Fill in meeting details (title, description, date, location)
3. Submit the form to create the meeting

## Technical Information

The Nairobi Meeting Attendance App is built with:
- Next.js 14 with App Router architecture
- React 18 for UI components
- Tailwind CSS for styling (with Poppins font, weight 300)
- Prisma ORM with PostgreSQL
- TypeScript for type safety
- QR code generation with qrcode.react

## Styling Information

The application is styled to match the Nairobi government website 
- Poppins font with weight 300 as the primary font
- Color scheme based on Nairobi brand colors
- Responsive design for all device sizes
- Clean, modern UI with intuitive navigation

## Support

If you encounter any issues or have questions, please refer to the documentation or open an issue in the repository.
