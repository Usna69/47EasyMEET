# EasyMEET User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Public Features](#public-features)
5. [Admin Dashboard](#admin-dashboard)
6. [Meeting Management](#meeting-management)
7. [User Management](#user-management)
8. [Password Reset](#password-reset)
9. [File Conversion Tool](#file-conversion-tool)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

EasyMEET is a comprehensive meeting management system designed to streamline the process of creating, managing, and tracking meetings and attendee registrations. The application provides both public access for meeting registration and an administrative interface for meeting management.

### Key Features
- **Meeting Creation and Management**: Create and manage meetings with detailed information
- **Attendee Registration**: Public registration system for meeting attendees
- **PDF Reports**: Generate attendance and summary reports
- **User Management**: Comprehensive user role management system
- **File Management**: Upload and manage meeting resources
- **Email Notifications**: Password reset and meeting notifications

---

## Getting Started

### Accessing the Application

1. **Public Access**: Visit the main application URL to view available meetings
2. **Admin Access**: Navigate to `/admin/login` to access the administrative dashboard

### First-Time Setup

1. **Admin User Creation**: The system requires an initial admin user to be created
2. **Email Configuration**: Ensure email settings are configured for password reset functionality
3. **Database Setup**: The application uses PostgreSQL with Prisma ORM

---

## User Roles and Permissions

### 1. Public Users
- **Access**: View available meetings
- **Actions**: Register for meetings, download meeting resources
- **Features**: Public meeting registration, resource downloads

### 2. Admin Users
- **Access**: Full administrative dashboard
- **Actions**: Create/manage meetings, manage users, view statistics
- **Features**: Complete system management capabilities

### 3. Creator Users
- **Access**: Limited admin dashboard
- **Actions**: Create and manage their own meetings
- **Features**: Meeting creation and management for assigned meetings

---

## Public Features

### Viewing Meetings

1. **Navigate to Home Page**: Access the main application URL
2. **Browse Meetings**: View all available meetings with details
3. **Filter by Sector**: Use the sector filter to find specific meetings
4. **Meeting Details**: Click on a meeting to view full details

### Meeting Registration

1. **Select Meeting**: Choose a meeting from the available list
2. **Click Register**: Navigate to the registration page
3. **Fill Form**: Complete the registration form with required information:
   - **Name**: Full name of attendee
   - **Email**: Valid email address
   - **Phone Number**: Contact information
   - **Organization**: Company or organization name
   - **Designation**: Job title or position
4. **Submit**: Click "Register" to complete registration
5. **Confirmation**: Receive confirmation of successful registration

### Downloading Resources

1. **Access Meeting**: Navigate to the meeting details page
2. **Find Resources**: Locate the resources section
3. **Enter Password**: If required, enter the meeting password
4. **Download**: Click download to access meeting materials

---

## Admin Dashboard

### Accessing the Dashboard

1. **Login**: Navigate to `/admin/login`
2. **Enter Credentials**: Provide admin email and password
3. **Dashboard**: Access the main administrative interface

### Dashboard Overview

The admin dashboard provides quick access to:
- **Recent Meetings**: Overview of latest meetings
- **Quick Actions**: Create meetings, manage users
- **Statistics**: System usage statistics
- **Navigation**: Access to all administrative features

---

## Meeting Management

### Creating a New Meeting

1. **Navigate**: Go to "Meetings Management" section
2. **Click "Create Meeting"**: Access the meeting creation form
3. **Fill Required Information**:
   - **Title**: Meeting title
   - **Description**: Detailed meeting description
   - **Date and Time**: Meeting schedule
   - **Location**: Physical or virtual meeting location
   - **Meeting Type**: Physical or Online
   - **Sector**: Meeting category/sector
   - **Organization**: Hosting organization
   - **Meeting Category**: Type of meeting
4. **Optional Settings**:
   - **Online Meeting URL**: For virtual meetings
   - **Registration End Date**: Cutoff for registrations
5. **Submit**: Create the meeting

### Managing Existing Meetings

1. **View Meetings**: Access the meetings list
2. **Edit Meeting**: Click edit to modify meeting details
3. **View Attendees**: Access attendee list and management
4. **Generate Reports**: Create PDF attendance reports
5. **Delete Meeting**: Remove meetings (admin only)

### Meeting Details Management

#### Attendee Management
1. **View Attendees**: Access the attendee list
2. **Export Data**: Download attendee information as PDF
3. **Manage Registrations**: View and manage attendee details

#### Resource Management
1. **Upload Resources**: Add meeting materials
2. **Set Passwords**: Configure resource access passwords
3. **Manage Files**: Organize and update meeting resources

### PDF Report Generation

1. **Navigate**: Go to meeting details → Attendees
2. **Generate Report**: Click "Export to PDF"
3. **Choose Type**:
   - **Attendance Report**: Detailed attendee list
   - **Summary Report**: Meeting overview with attendee count
4. **Download**: Save the generated PDF report

---

## User Management

### Accessing User Management

1. **Admin Dashboard**: Navigate to "User Management"
2. **Admin Only**: This feature is restricted to admin users

### Creating New Users

1. **Click "Create User"**: Access the user creation form
2. **Fill Required Fields**:
   - **Name**: Full name of the user
   - **Email**: Unique email address
   - **Password**: Secure password (minimum 6 characters)
   - **Role**: Select appropriate role (Admin/Creator/User)
3. **Optional Information**:
   - **Department**: User's department
   - **Designation**: Job title
4. **Submit**: Create the user account

### Managing Users

1. **View Users**: See all system users in a table format
2. **Edit Users**: Modify user information (if applicable)
3. **Delete Users**: Remove user accounts (with confirmation)
4. **Role Management**: Assign and modify user roles

### User Roles Explained

- **Admin**: Full system access, user management, all meetings
- **Creator**: Can create and manage their own meetings
- **User**: Basic access to view meetings and register

---

## Password Reset

### Forgot Password Process

1. **Login Page**: Navigate to `/admin/login`
2. **Click "Forgot Password"**: Access password reset form
3. **Enter Email**: Provide the email address associated with your account
4. **Submit Request**: Click "Request Password Reset"
5. **Check Email**: Look for the password reset email
6. **Click Reset Link**: Follow the link in the email
7. **Enter New Password**: Create a new secure password
8. **Confirm Password**: Re-enter the new password
9. **Submit**: Complete the password reset process

### Password Requirements

- **Minimum Length**: 6 characters
- **Security**: Use a combination of letters, numbers, and symbols
- **Confirmation**: Must match the confirmation field

---

## File Conversion Tool

### Accessing the Tool

1. **Admin Dashboard**: Navigate to "Convert" section
2. **Purpose**: Convert DOCX files to JPG for letterhead uploads

### Using the Conversion Tool

1. **Select File**: Choose a DOCX file to convert
2. **Click Convert**: Start the conversion process
3. **Download**: Get the converted JPG file
4. **Optional Protection**: Add password protection to the file

### Alternative Conversion Methods

If the built-in converter doesn't work, try these external services:
- **Convertio**: https://convertio.co/docx-jpg/
- **Zamzar**: https://www.zamzar.com/convert/docx-to-jpg/
- **CloudConvert**: https://cloudconvert.com/docx-to-jpg

---

## Troubleshooting

### Common Issues

#### Login Problems
- **Incorrect Credentials**: Double-check email and password
- **Account Locked**: Contact administrator
- **Forgot Password**: Use the password reset feature

#### Meeting Registration Issues
- **Registration Closed**: Check if registration end date has passed
- **Required Fields**: Ensure all required information is provided
- **Email Validation**: Use a valid email address format

#### File Upload Problems
- **File Size**: Check file size limits
- **File Type**: Ensure correct file format
- **Network Issues**: Check internet connection

#### PDF Generation Issues
- **Browser Compatibility**: Use modern browsers
- **Download Blocked**: Check browser download settings
- **File Access**: Ensure proper permissions

### Getting Help

1. **Check Documentation**: Review this manual
2. **Contact Administrator**: Reach out to system administrators
3. **System Logs**: Check application logs for errors
4. **Browser Console**: Use developer tools for debugging

### Best Practices

#### For Administrators
- **Regular Backups**: Maintain system backups
- **User Management**: Regularly review user accounts
- **Meeting Cleanup**: Archive old meetings periodically
- **Security Updates**: Keep the system updated

#### For Users
- **Strong Passwords**: Use secure passwords
- **Regular Updates**: Keep contact information current
- **Meeting Preparation**: Review meeting details before registration
- **Resource Downloads**: Save important meeting materials

---

## System Requirements

### Browser Compatibility
- **Chrome**: Version 80+
- **Firefox**: Version 75+
- **Safari**: Version 13+
- **Edge**: Version 80+

### Device Compatibility
- **Desktop**: Full feature access
- **Tablet**: Responsive design support
- **Mobile**: Limited feature access

### Network Requirements
- **Internet Connection**: Required for all features
- **Email Access**: Required for password reset functionality
- **File Upload**: Stable connection for large files

---

## Security Features

### Authentication
- **Secure Login**: Encrypted password storage
- **Session Management**: Automatic session timeout
- **Role-Based Access**: Restricted feature access

### Data Protection
- **Password Hashing**: Secure password storage
- **Input Validation**: Protection against malicious input
- **File Upload Security**: Safe file handling

### Privacy
- **Data Encryption**: Secure data transmission
- **User Consent**: Clear data usage policies
- **Access Control**: Limited data access based on roles

---

## Support and Contact

### Technical Support
- **System Issues**: Contact system administrators
- **Feature Requests**: Submit through appropriate channels
- **Bug Reports**: Provide detailed error descriptions

### Training and Documentation
- **User Training**: Available for new users
- **Video Tutorials**: Step-by-step guides
- **FAQ Section**: Common questions and answers

---

*This manual covers the current version of EasyMEET. For updates and additional information, please refer to the system documentation or contact your system administrator.* 