# Nairobi Meeting Attendance App

A comprehensive web application built with Next.js that provides a solution for managing meetings and tracking attendee participation, styled to match the Nairobi government website design.

## Tech Stack

- **Framework**: Next.js 14.0.4
- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.1
- **Database**: Prisma ORM with PostgreSQL
- **QR Code Generation**: QRCode.react library

## Features

### Meeting Management
- Create meetings with title, description, date, and location
- View all meetings on the home page
- Access detailed meeting information
- Edit and delete meetings through the admin interface

### Attendance Tracking
- Generate unique QR codes for each meeting
- Register attendees with name, email, and designation
- Display confirmation pages after successful registration
- View attendee lists for each meeting

### User Interface
- Responsive design using Tailwind CSS
- Poppins font with weight 300 to match Nairobi style
- Intuitive navigation with "Back" buttons
- Loading states and comprehensive error handling

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nairobi-meeting-attendance
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
```
DATABASE_URL="postgresql://username:password@localhost:5432/nairobi_meetings?schema=public"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

### Pages and Routes
- **Home Page** (`/`): Displays all meetings
- **Meeting Details** (`/meetings/[id]`): Shows meeting information and QR code
- **Registration** (`/meetings/[id]/register`): Attendee registration form
- **Success** (`/meetings/[id]/register/success`): Registration confirmation
- **Admin Dashboard** (`/admin`): Manage meetings
- **Create Meeting** (`/admin/meetings/new`): Create a new meeting
- **Edit Meeting** (`/admin/meetings/[id]/edit`): Edit an existing meeting

### API Routes
- **Meetings** (`/api/meetings`): GET all meetings, POST new meeting
- **Meeting** (`/api/meetings/[id]`): GET, PUT, DELETE specific meeting
- **Attendees** (`/api/attendees`): POST new attendee

## License

This project is licensed under the MIT License.
