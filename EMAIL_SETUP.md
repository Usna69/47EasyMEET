# Email Setup for Password Reset Functionality

## Overview
The EasyMEET system now includes SMTP email functionality for password reset and welcome emails. Users can request a password reset and receive a secure link via email. **All users, including admin users, are now stored in the database and can use the password reset functionality.**

## Configuration

### 1. Gmail App Password Setup
To use Gmail for sending emails, you need to create an App Password:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Create an App Password for "Mail"
4. Use this App Password in your environment variables

### 2. Environment Variables
Create a `.env` file in your project root with the following variables:

```env
# Email Configuration
EMAIL_USER=brian.kiprono.n@gmail.com
EMAIL_PASS=your_gmail_app_password_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="your_database_url_here"
```

### 3. Email Features
- **Sender Name**: All emails are sent from "EASYMEETNCCG" 
- **Reply Blocking**: All emails have reply-to set to "noreply@easymeetnccg.go.ke" to prevent replies
- **Welcome Emails**: New users receive welcome emails with their login credentials
- **Password Reset**: Users can request password reset via email
- **First Login**: Users must change their password on first login

### 4. Security Notes
- Never commit the `.env` file to version control
- The app password should be kept secure
- All emails are sent from "EASYMEETNCCG" as requested
- **Admin credentials are now stored in the database instead of being hardcoded**
- **Reply blocking is implemented on all emails**

## How It Works

### Welcome Email Flow:
1. Admin creates new user account
2. System generates temporary password
3. Welcome email sent with credentials
4. User logs in with temporary password
5. User redirected to password reset page
6. User sets new password
7. User gains access to system

### Password Reset Flow:
1. User clicks "Forgot Password?" on login page
2. User enters their email address
3. System generates a secure reset token
4. Email is sent via SMTP with reset link
5. User clicks link in email
6. User enters new password on reset page
7. Password is updated in database

### Security Features:
- Reset tokens expire after 1 hour
- Tokens are cryptographically secure (32 bytes)
- Passwords are hashed using bcrypt
- Email links are single-use (token is cleared after use)
- **All users, including admin, can reset their passwords**
- **Reply blocking prevents users from replying to system emails**

The admin user can now:
- Login using the database credentials
- Request password reset via email
- Use all admin functionality
- Have their password reset like any other user

## Testing

You can test the email functionality using the test endpoint:
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Or test password reset:
```bash
curl -X POST http://localhost:3000/api/users/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "adminmeets@nairobi.go.ke"}'
```

## Troubleshooting

### Common Issues:
1. **Email not sending**: Check Gmail app password and 2FA settings
2. **Database errors**: Ensure Prisma schema is up to date
3. **Token expired**: Reset tokens expire after 1 hour

### Logs:
Check the console logs for email sending status and any errors.

## Database Schema Changes

The following fields were added to the User model:
- `passwordResetToken`: Secure token for password reset
- `passwordResetTokenExpiry`: Token expiration timestamp

These fields are automatically managed by the system and should not be manually modified.
