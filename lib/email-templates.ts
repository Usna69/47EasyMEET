// Email template styles
const styles = {
  container: "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;",
  header: "background-color: #014a2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;",
  headerTitle: "margin: 0; font-size: 24px;",
  headerSubtitle: "margin: 10px 0 0 0; font-size: 14px;",
  content: "background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;",
  title: "color: #014a2f; margin-bottom: 20px;",
  paragraph: "color: #333; line-height: 1.6; margin-bottom: 20px;",
  buttonContainer: "text-align: center; margin: 30px 0;",
  button: "background-color: #014a2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;",
  footer: "border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;",
  footerText: "color: #666; font-size: 12px; margin: 0;",
  footerLink: "color: #014a2f;",
  disclaimer: "text-align: center; margin-top: 20px; color: #666; font-size: 12px;"
};

export function generatePasswordResetEmailTemplate(
  userName: string,
  resetUrl: string
): string {
  return `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">
          <span style="color: #fbbf24;">Easy</span>MEET
        </h1>
        <p style="${styles.headerSubtitle}">NCCG Authorized User Access</p>
      </div>
      
      <div style="${styles.content}">
        <h2 style="${styles.title}">Password Reset Request</h2>
        
        <p style="${styles.paragraph}">
          Hello ${userName},
        </p>
        
        <p style="${styles.paragraph}">
          We received a request to reset your password for the EasyMEET system. 
          If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="${styles.buttonContainer}">
          <a href="${resetUrl}" style="${styles.button}">
            Reset Password
          </a>
        </div>
        
        <p style="${styles.paragraph}">
          This link will expire in 1 hour for security reasons. If you need to reset your password after the link expires, please request a new password reset.
        </p>
        
        <div style="${styles.footer}">
          <p style="${styles.footerText}">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="${styles.footerLink}">${resetUrl}</a>
          </p>
        </div>
      </div>
      
      <div style="${styles.disclaimer}">
        <p>This is an automated message from the EasyMEET system.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </div>
  `;
}

export function generateWelcomeEmailTemplate(
  userName: string,
  userEmail: string,
  userPassword: string,
  userRole: string,
  appUrl: string = 'http://localhost:3000'
): string {
  const loginUrl = `${appUrl}/admin/login`;
  
  return `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">
          <span style="color: #fbbf24;">Easy</span>MEET
        </h1>
        <p style="${styles.headerSubtitle}">NCCG Authorized User Access</p>
      </div>
      
      <div style="${styles.content}">
        <h2 style="${styles.title}">Welcome to EasyMEET System</h2>
        
        <p style="${styles.paragraph}">
          Hello ${userName},
        </p>
        
        <p style="${styles.paragraph}">
          Welcome to the EasyMEET system! Your account has been successfully created. 
          Below are your login credentials for your first access to the system.
        </p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #0c4a6e; margin-top: 0;">Your Login Credentials</h3>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin: 10px 0;"><strong>Password:</strong> ${userPassword}</p>
          <p style="margin: 10px 0;"><strong>Role:</strong> ${userRole}</p>
        </div>
        
        <p style="${styles.paragraph}">
          <strong>Important:</strong> For security reasons, you will be required to change your password on your first login.
        </p>
        
        <div style="${styles.buttonContainer}">
          <a href="${loginUrl}" style="${styles.button}">
            Login to EasyMEET
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">First Login Instructions</h4>
          <ol style="color: #92400e; margin: 10px 0; padding-left: 20px;">
            <li>Click the "Login to EasyMEET" button above</li>
            <li>Enter your email and temporary password</li>
            <li>You will be redirected to set a new password</li>
            <li>Create a strong password (minimum 6 characters)</li>
            <li>Confirm your new password</li>
            <li>You will then have access to the system</li>
          </ol>
        </div>
        
        <div style="${styles.footer}">
          <p style="${styles.footerText}">
            If you have any issues accessing your account, please contact your system administrator.
          </p>
        </div>
      </div>
      
      <div style="${styles.disclaimer}">
        <p>This is an automated message from the EasyMEET system.</p>
        <p>Please do not reply to this email.</p>
        <p>Keep your login credentials secure and do not share them with others.</p>
      </div>
    </div>
  `;
} 