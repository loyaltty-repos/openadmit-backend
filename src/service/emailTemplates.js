export const OtpEmailTemplate = (otp) => {
  const subject = 'Your Secure OTP Code - Goupbroad';
  const text = `Your OTP is: ${otp}. It is valid for the next 10 minutes. If you did not request this, please ignore this email.`;

  //const logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iOCIgc3R5bGU9ImZpbGw6I0UxRkY5RTsiLz4KPC9zdmc+'; // (short placeholder ok)

  const html = `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Verify Your OTP - Goupbroad</title>

    <!--[if mso]>
      <style type="text/css">
        * { font-family: Arial, sans-serif !important; }
      </style>
    <![endif]-->

    <style>
      /* Base Resets */
      html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
      * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
      table, td { mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
      img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
      a { text-decoration:none; }
      /* Container width control for desktop */
      .email-container { width:100% !important; max-width:600px !important; margin:0 auto !important; }
      /* Global typography */
      .gup-text { color:#333333; font-family: Segoe UI, Arial, sans-serif; line-height:1.6; }
      .muted { color:#666666; }
      .center { text-align:center; }

      /* Cards & sections */
      .card {
        background-color:#ffffff; border-radius:12px;
        box-shadow:0 4px 12px rgba(0,0,0,0.05);
        overflow:hidden;
      }
      .header {
        background-color:#145044; color:#ffffff; padding:32px 24px;
      }
      .content { background-color:#f9f9f9; padding:32px 24px; }
      .otp-box {
        background:#ffffff; border:1px solid #e6e6e6; border-radius:10px;
        padding:28px; text-align:center; margin:20px 0; box-shadow:0 2px 8px rgba(0,0,0,0.06);
      }
      .otp-label { color:#555555; font-size:15px; margin-bottom:12px; font-weight:500; }
      .otp-code {
        font-size:36px; font-weight:bold; color:#145044; letter-spacing:10px;
        font-family: "Courier New", monospace; margin:16px 0; padding:8px 0;
        background:#f0f8f6; border-radius:6px; display:inline-block; min-width:180px;
      }
      .otp-validity { color:#666666; font-size:14px; margin-top:16px; }
      .notice {
        background:#fff8e6; border-left:4px solid #f4b400; padding:16px; border-radius:8px;
        margin:24px 0; font-size:14px; color:#444444;
      }
      .notice strong { color:#d35400; }
      .info-card { background:#e8f5f3; padding:20px; border-radius:10px; margin:24px 0; text-align:center; }
      .info-card h3 { color:#145044; font-size:17px; margin:0 0 8px; }
      .info-card p { font-size:14px; margin:8px 0 0; color:#444444; }
      .support-card { background:#f0f8f6; padding:24px; border-radius:10px; margin:24px 0; text-align:center; }
      .support-card h3 { color:#145044; font-size:17px; margin:0 0 12px; }
      .support-card p { font-size:14px; margin:6px 0; }
      .support-card a { color:#145044; font-weight:500; }
      .footer { text-align:center; padding:24px; color:#888888; font-size:13px; }
      .footer a { color:#145044; }

      /* Mobile tweaks */
      @media screen and (max-width: 600px) {
        .stack, .stack > tbody > tr > td { display:block !important; width:100% !important; }
        .p-sm { padding-left:16px !important; padding-right:16px !important; }
        .otp-code { font-size:28px !important; letter-spacing:6px !important; min-width:140px !important; }
        .header { padding:24px 16px !important; }
        .content { padding:24px 16px !important; }
      }

      /* Dark mode-friendly (optional) */
      @media (prefers-color-scheme: dark) {
        body, .gup-text { color:#e6e6e6 !important; }
        .card { background:#111418 !important; box-shadow:none !important; }
        .content { background:#0d1214 !important; }
        .footer { color:#bbbbbb !important; }
        .otp-box { background:#0f1716 !important; border-color:#25302e !important; }
        .info-card { background:#12211e !important; }
        .support-card { background:#12221f !important; }
        .notice { background:#221c08 !important; border-left-color:#b8860b !important; }
        a { color:#7fd2c1 !important; }
      }
    </style>
  </head>

  <body class="gup-text" style="background-color:#f4f7fb;">
    <!-- Preheader (hidden) -->
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      Your secure One-Time Password (OTP) has been generated. Valid for 10 minutes.
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f4f7fb;">
      <tr>
        <td align="center" style="padding:20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container">
            <tr>
              <td>
                <!-- Card wrapper -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card">
                  <!-- Header -->
                  <tr>
                    <td class="header center">
                      <!-- Optional logo -->
                      
                      <h1 style="margin:0 0 8px; font-size:24px; font-weight:600;">Verify Your Identity</h1>
                      <p style="margin:0; font-size:15px; opacity:0.9;">Your secure One-Time Password (OTP) has been generated</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td class="content">
                      <!-- OTP Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td>
                            <div class="otp-box">
                              <div class="otp-label">Your OTP Code</div>
                              <div class="otp-code">${otp}</div>
                              <div class="otp-validity">Valid for the next <strong>10 minutes</strong></div>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Security Notice -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td>
                            <div class="notice">
                              <p style="margin:0;">
                                <strong>Security Alert:</strong> Never share this OTP with anyone.
                                The Goupbroad team will <strong>never</strong> ask for your OTP via call, SMS, or email.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Didn't Request -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td>
                            <div class="info-card">
                              <h3>Didn't request this OTP?</h3>
                              <p>You can safely ignore this email. No action is required.</p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Support -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td>
                            <div class="support-card">
                              <h3>Need Help?</h3>
                              <p>Our support team is here 24/7</p>
                              <p><a href="mailto:support@goupbroad.com">support@goupbroad.com</a></p>
                              <p><a href="tel:+14156722765">+1 415 672 2765</a></p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td class="footer" style="background-color:#f4f7fb;">
                      <p style="margin:6px 0;">© 2025 <strong>Goupbroad</strong>. All rights reserved.</p>
                      <p style="margin:6px 0;">This is an automated security email. Please do not reply.</p>
                      <p style="margin:6px 0;">
                        <a href="#">Unsubscribe</a> |
                        <a href="#">Privacy Policy</a> |
                        <a href="#">Terms of Service</a>
                      </p>
                    </td>
                  </tr>
                </table>
                <!-- /card -->
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  return { subject, text, html };
};

export const WelcomeEmailTemplate = (studentName ) => {
  const subject = `Welcome to Goupbroad, ${studentName || 'Student'}!`;
  const text = `Hi ${studentName || 'Student'},\n\nWelcome to Goupbroad! We're thrilled to have you on board.\n\nYour account is now active. Explore your dashboard, complete your first task, and start your learning journey.\n\nNeed help? We're here 24/7.\n\nBest regards,\nGoupbroad Team`;

  const html = `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Welcome to Goupbroad!</title>

    <!--[if mso]>
      <style type="text/css">
        * { font-family: Arial, sans-serif !important; }
      </style>
    <![endif]-->

    <style>
      /* Resets & compatibility */
      html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
      * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
      table, td { mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
      img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
      a { text-decoration:none; }

      /* Container */
      body { background-color:#f4f7fb; color:#333333; }
      .email-container { width:100% !important; max-width:600px !important; margin:0 auto !important; }

      /* Card shell */
      .card {
        background:#ffffff; border-radius:12px; overflow:hidden;
        box-shadow:0 4px 12px rgba(0,0,0,0.05);
      }

      /* Header: keep brand + color theme */
      .header { background:#145044; color:#ffffff; padding:40px 24px; text-align:center; }
      .brand { margin:0 0 12px; font-size:32px; font-weight:700; letter-spacing:0.8px; }
      .greeting { margin:0; font-size:18px; font-weight:500; opacity:0.95; }

      /* Content */
      .content { background:#f9f9f9; padding:32px 24px; }

      .welcome-box {
        background:#ffffff; padding:32px; border-radius:12px; text-align:center; margin:20px 0;
        box-shadow:0 3px 10px rgba(0,0,0,0.06); border:1px solid #e6f0ee;
      }
      .welcome-icon { font-size:48px; line-height:1; color:#145044; margin-bottom:14px; }
      .welcome-title { font-size:24px; font-weight:600; color:#145044; margin:0 0 16px; }
      .welcome-message { font-size:16px; color:#444444; margin:0 0 20px; line-height:1.7; }

      .cta-card { background:#e8f5f3; padding:28px; border-radius:12px; margin:28px 0; text-align:center; }

      /* Features grid (2-col desktop, stacks on mobile) */
      .feature-wrap { margin:28px 0; }
      .feature { background:#f0f8f6; padding:20px; border-radius:10px; text-align:center;
                 box-shadow:0 2px 6px rgba(0,0,0,0.04); }
      .feature-icon { font-size:24px; color:#145044; margin-bottom:8px; }
      .feature-title { margin:0 0 6px; font-size:15px; color:#145044; font-weight:600; }
      .feature-text { margin:0; font-size:13px; color:#555555; }

      .support-card { background:#f0f8f6; padding:24px; border-radius:10px; margin:28px 0; text-align:center; }
      .support-card h3 { color:#145044; margin:0 0 12px; font-size:17px; }
      .support-card p { margin:6px 0; font-size:14px; }
      .support-card a { color:#145044; font-weight:500; }

      .footer { text-align:center; padding:24px; color:#888888; font-size:13px; background:#f4f7fb; }
      .footer a { color:#145044; }

      /* Mobile adjustments */
      @media screen and (max-width:600px) {
        .p-sm { padding-left:16px !important; padding-right:16px !important; }
        .header { padding:24px 16px !important; }
        .content { padding:24px 16px !important; }
        .brand { font-size:26px !important; }
        .welcome-icon { font-size:42px !important; }
        .stack, .stack td { display:block !important; width:100% !important; }
        .col { width:100% !important; max-width:100% !important; }
      }

      /* Optional dark mode */
      @media (prefers-color-scheme: dark) {
        body { background:#0f1214 !important; color:#e6e6e6 !important; }
        .card { background:#111418 !important; box-shadow:none !important; }
        .content { background:#0d1214 !important; }
        .welcome-box { background:#12181a !important; border-color:#243032 !important; }
        .cta-card { background:#0f1f1c !important; }
        .feature { background:#10201d !important; }
        .support-card { background:#10201d !important; }
        .footer { color:#bbbbbb !important; }
        a { color:#7fd2c1 !important; }
      }
    </style>
  </head>

  <body>
    <!-- Preheader (hidden preview text) -->
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      Welcome to Goupbroad—your account is active. Jump into your dashboard and start your journey!
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f7fb;">
      <tr>
        <td align="center" style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-container">
            <tr>
              <td>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="card">
                  <!-- Header -->
                  <tr>
                    <td class="header">
                      <h1 class="brand" style="margin:0 0 12px;">Goupbroad</h1>
                      <p class="greeting" style="margin:0;">Hi ${studentName || 'Student'}, Welcome Aboard!</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td class="content">
                      <!-- Welcome box -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr><td>
                          <div class="welcome-box">
                            <div class="welcome-icon" aria-hidden="true">🎉</div>
                            <h2 class="welcome-title">You're All Set!</h2>
                            <p class="welcome-message">
                              Your Goupbroad account is now active. Get ready to learn, grow, and achieve your goals with personalized tasks and real-time feedback.
                            </p>
                          </div>
                        </td></tr>
                      </table>

                      <!-- CTA card with bulletproof button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr><td>
                          <div class="cta-card">
                            <h3 style="margin:0 0 8px; color:#145044; font-size:18px;">Start Your Journey</h3>
                            <p style="margin:0 0 16px;">Log in now and explore your dashboard</p>

                            <!--[if mso]>
                              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="https://goupbroad.com/dashboard" style="height:44px;v-text-anchor:middle;width:240px;" arcsize="12%" strokecolor="#145044" fillcolor="#145044">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:700;">Go to Dashboard</center>
                              </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-- -->
                              <a href="https://goupbroad.com/dashboard"
                                 style="display:inline-block;background:#145044;color:#ffffff;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(20,80,68,0.2);">
                                 Go to Dashboard
                              </a>
                            <!--<![endif]-->
                          </div>
                        </td></tr>
                      </table>

                      
                      

                      <!-- Support -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr><td>
                          <div class="support-card">
                            <h3>We're Here to Help</h3>
                            <p>Any questions? Reach out anytime.</p>
                            <p><a href="mailto:support@goupbroad.com">support@goupbroad.com</a></p>
                            <p><a href="tel:+14156722765">+1 415 672 2765</a></p>
                          </div>
                        </td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td class="footer">
                      <p style="margin:6px 0;">© 2025 <strong>Goupbroad</strong>. All rights reserved.</p>
                      <p style="margin:6px 0;">You're receiving this email because you signed up at Goupbroad.</p>
                      <p style="margin:6px 0;">
                        <a href="#">Unsubscribe</a> |
                        <a href="#">Privacy Policy</a> |
                        <a href="#">Contact Us</a>
                      </p>
                    </td>
                  </tr>
                </table>
                <!-- /card -->
              </td>
            </tr>
          </table>
          <!-- /email-container -->
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  return { subject, text, html };
};

export const AdminQuestionnaireSubmissionTemplate = (studentEmail, studentName, taskTitle, subtaskTitle, questionnaireTitle) => {
    const subject = `New Submission: ${questionnaireTitle} by ${studentName}`;
    const text = `A new questionnaire has been submitted.\n\nStudent: ${studentName} (${studentEmail})\nQuestionnaire: ${questionnaireTitle}\nSubtask: ${subtaskTitle}\nTask: ${taskTitle}\n\nPlease review in the admin dashboard.`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Submission Alert - Goupbroad Admin</title>
        <style>
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
            }

            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }

            .header {
                background-color: #d35400;
                color: #ffffff;
                padding: 36px 24px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }
            .header .brand {
                margin: 0 0 8px;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            .header p {
                margin: 0;
                font-size: 15px;
                opacity: 0.9;
            }

            .content {
                background-color: #f9f9f9;
                padding: 32px 24px;
                border-radius: 0 0 12px 12px;
            }

            .alert-box {
                background-color: #ffffff;
                padding: 28px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                border: 1px solid #e6e6e6;
            }
            .alert-icon {
                font-size: 48px;
                color: #d35400;
                margin-bottom: 16px;
            }
            .alert-title {
                font-size: 22px;
                font-weight: 600;
                color: #d35400;
                margin: 0 0 12px;
            }

            .submission-summary {
                background-color: #fef5e7;
                padding: 18px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 14px;
                line-height: 1.8;
                border-left: 4px solid #d35400;
            }
            .submission-summary strong {
                color: #d35400;
            }

            .action-card {
                background-color: #fff8e6;
                padding: 20px;
                border-radius: 10px;
                margin: 24px 0;
                text-align: center;
            }
            .action-card h3 {
                color: #d35400;
                margin: 0 0 12px;
                font-size: 17px;
            }
            .action-card .btn {
                display: inline-block;
                background-color: #d35400;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                margin-top: 8px;
            }

            .footer {
                text-align: center;
                padding: 24px;
                color: #888888;
                font-size: 13px;
                background-color: #f4f7fb;
            }
            .footer p {
                margin: 6px 0;
            }
            .footer a {
                color: #d35400;
                text-decoration: none;
            }

            @media only screen and (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 10px;
                }
                .header, .content {
                    padding: 24px 16px;
                }
                .header .brand {
                    font-size: 24px;
                }
                .alert-icon {
                    font-size: 36px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1 class="brand">Goupbroad</h1>
                <p>New Questionnaire Submission</p>
            </div>

            <!-- Main Content -->
            <div class="content">
                <!-- Alert -->
                <div class="alert-box">
                    <div class="alert-icon">Alert</div>
                    <h2 class="alert-title">Submission Received</h2>
                    <p>A student has completed and submitted a questionnaire.</p>
                </div>

                <!-- Submission Summary -->
                <div class="submission-summary">
                    <p><strong>Student:</strong> ${studentName}</p>
                    <p><strong>Email:</strong> ${studentEmail}</p>
                    <p><strong>Questionnaire:</strong> ${questionnaireTitle}</p>
                    <p><strong>Subtask:</strong> ${subtaskTitle}</p>
                    <p><strong>Task:</strong> ${taskTitle}</p>
                    <p><strong>Submitted On:</strong> ${new Date().toLocaleString()}</p>
                </div>

                <!-- Action -->
                <div class="action-card">
                    <h3>Review Now</h3>
                    <p>Check the admin dashboard to view responses and provide feedback.</p>
                    <a href="https://admin.goupbroad.com/submissions" class="btn">Go to Dashboard</a>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>© 2025 <strong>Goupbroad</strong>. All rights reserved.</p>
                <p>This is an automated admin alert.</p>
                <p>
                    <a href="#">Unsubscribe</a> | 
                    <a href="#">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return { subject, text, html };
};

export const QuestionnaireSubmissionTemplate = (taskTitle, subtaskTitle, questionnaireTitle) => {
    const subject = `Submission Received: ${questionnaireTitle} - Goupbroad`;
    const text = `Hi there,\n\nYour responses for "${questionnaireTitle}" under "${subtaskTitle}" in "${taskTitle}" have been successfully submitted.\n\nThank you for your participation!\n\nBest regards,\nGoupbroad Team`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Submission Confirmed - Goupbroad</title>
        <style>
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
            }

            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }

            .header {
                background-color: #145044;
                color: #ffffff;
                padding: 36px 24px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }
            .header .brand {
                margin: 0 0 8px;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            .header p {
                margin: 0;
                font-size: 15px;
                opacity: 0.9;
            }

            .content {
                background-color: #f9f9f9;
                padding: 32px 24px;
                border-radius: 0 0 12px 12px;
            }

            .success-box {
                background-color: #ffffff;
                padding: 28px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                border: 1px solid #e6e6e6;
            }
            .success-icon {
                font-size: 48px;
                color: #145044;
                margin-bottom: 16px;
            }
            .success-title {
                font-size: 22px;
                font-weight: 600;
                color: #145044;
                margin: 0 0 12px;
            }
            .submission-details {
                background-color: #f0f8f6;
                padding: 16px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 14px;
                line-height: 1.7;
            }
            .submission-details strong {
                color: #145044;
            }

            .info-card {
                background-color: #e8f5f3;
                padding: 20px;
                border-radius: 10px;
                margin: 24px 0;
                text-align: center;
            }
            .info-card h3 {
                color: #145044;
                margin: 0 0 8px;
                font-size: 17px;
            }
            .info-card p {
                margin: 8px 0 0;
                font-size: 14px;
                color: #444444;
            }

            .support-card {
                background-color: #f0f8f6;
                padding: 24px;
                border-radius: 10px;
                margin: 24px 0;
                text-align: center;
            }
            .support-card h3 {
                color: #145044;
                margin: 0 0 12px;
                font-size: 17px;
            }
            .support-card p {
                margin: 6px 0;
                font-size: 14px;
            }
            .support-card a {
                color: #145044;
                text-decoration: none;
                font-weight: 500;
            }

            .footer {
                text-align: center;
                padding: 24px;
                color: #888888;
                font-size: 13px;
                background-color: #f4f7fb;
            }
            .footer p {
                margin: 6px 0;
            }
            .footer a {
                color: #145044;
                text-decoration: none;
            }

            @media only screen and (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 10px;
                }
                .header, .content {
                    padding: 24px 16px;
                }
                .header .brand {
                    font-size: 24px;
                }
                .success-icon {
                    font-size: 36px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1 class="brand">Goupbroad</h1>
                <p>Questionnaire Submission Confirmed</p>
            </div>

            <!-- Main Content -->
            <div class="content">
                <!-- Success Message -->
                <div class="success-box">
                    <div class="success-icon">Checkmark</div>
                    <h2 class="success-title">Thank You!</h2>
                    <p>Your responses have been successfully submitted.</p>
                </div>

                <!-- Submission Details -->
                <div class="submission-details">
                    <p><strong>Questionnaire:</strong> ${questionnaireTitle}</p>
                    <p><strong>Subtask:</strong> ${subtaskTitle}</p>
                    <p><strong>Task:</strong> ${taskTitle}</p>
                </div>

                <!-- Next Steps -->
                <div class="info-card">
                    <h3>What Happens Next?</h3>
                    <p>Your submission will be reviewed. You’ll receive feedback or further instructions via email.</p>
                </div>

                <!-- Support -->
                <div class="support-card">
                    <h3>Need Assistance?</h3>
                    <p>Our support team is here 24/7</p>
                    <p><a href="mailto:support@goupbroad.com">support@goupbroad.com</a></p>
                    <p><a href="tel:+14156722765">+1 415 672 2765</a></p>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>© 2025 <strong>Goupbroad</strong>. All rights reserved.</p>
                <p>This is an automated confirmation email. Please do not reply.</p>
                <p>
                    <a href="#">Unsubscribe</a> | 
                    <a href="#">Privacy Policy</a> | 
                    <a href="#">Terms of Service</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return { subject, text, html };
};

export const TaskAssignedTemplate = (studentName, taskTitle) => {
    const subject = `New Task Assigned: ${taskTitle} - Goupbroad`;
    const text = `Hi ${studentName},\n\nA new task has been assigned to you!\n\nTask: ${taskTitle}\n\nHead over to your dashboard to view details and get started.\n\nBest regards,\nGoupbroad Team`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Task Assigned - Goupbroad</title>
        <style>
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
            }

            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }

            .header {
                background: linear-gradient(135deg, #145044 0%, #1a6b57 100%);
                color: #ffffff;
                padding: 40px 24px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }
            .header .brand {
                margin: 0 0 12px;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 0.8px;
            }
            .header .greeting {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
                opacity: 0.95;
            }

            .content {
                background-color: #f9f9f9;
                padding: 32px 24px;
                border-radius: 0 0 12px 12px;
            }

            .task-box {
                background-color: #ffffff;
                padding: 32px;
                border-radius: 12px;
                text-align: center;
                margin: 20px 0;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
                border: 1px solid #e6f0ee;
            }
            .task-icon {
                font-size: 56px;
                color: #145044;
                margin-bottom: 16px;
            }
            .task-title {
                font-size: 24px;
                font-weight: 600;
                color: #145044;
                margin: 0 0 16px;
            }
            .task-message {
                font-size: 16px;
                color: #444444;
                margin: 0 0 20px;
                line-height: 1.7;
            }

            .task-details {
                background-color: #f0f8f6;
                padding: 18px;
                border-radius: 10px;
                margin: 24px 0;
                text-align: left;
                font-size: 15px;
                border-left: 4px solid #145044;
            }
            .task-details strong {
                color: #145044;
            }

            .cta-card {
                background-color: #e8f5f3;
                padding: 28px;
                border-radius: 12px;
                margin: 28px 0;
                text-align: center;
            }
            .cta-card h3 {
                color: #145044;
                margin: 0 0 12px;
                font-size: 18px;
            }
            .cta-btn {
                display: inline-block;
                background-color: #145044;
                color: #ffffff;
                padding: 14px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
                margin-top: 12px;
                box-shadow: 0 4px 12px rgba(20, 80, 68, 0.2);
                transition: background-color 0.2s;
            }

            .support-card {
                background-color: #f0f8f6;
                padding: 24px;
                border-radius: 10px;
                margin: 28px 0;
                text-align: center;
            }
            .support-card h3 {
                color: #145044;
                margin: 0 0 12px;
                font-size: 17px;
            }
            .support-card p {
                margin: 6px 0;
                font-size: 14px;
            }
            .support-card a {
                color: #145044;
                text-decoration: none;
                font-weight: 500;
            }

            .footer {
                text-align: center;
                padding: 24px;
                color: #888888;
                font-size: 13px;
                background-color: #f4f7fb;
            }
            .footer p {
                margin: 6px 0;
            }
            .footer a {
                color: #145044;
                text-decoration: none;
            }

            @media only screen and (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 10px;
                }
                .header, .content {
                    padding: 24px 16px;
                }
                .header .brand {
                    font-size: 26px;
                }
                .task-icon {
                    font-size: 42px;
                }
                .cta-btn {
                    padding: 12px 24px;
                    font-size: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1 class="brand">Goupbroad</h1>
                <p class="greeting">Hi ${studentName},</p>
            </div>

            <!-- Main Content -->
            <div class="content">
                <!-- Task Alert -->
                <div class="task-box">
                    <div class="task-icon">Clipboard</div>
                    <h2 class="task-title">New Task Assigned!</h2>
                    <p class="task-message">
                        Great news! Your admin has just assigned a new task to help you grow.
                    </p>
                </div>

                <!-- Task Details -->
                <div class="task-details">
                    <p><strong>Task Title:</strong> ${taskTitle}</p>
                    <p><strong>Assigned On:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <!-- CTA -->
                <div class="cta-card">
                    <h3>Ready to Start?</h3>
                    <p>View task details, submit responses, and track your progress</p>
                    <a href="https://goupbroad.com/dashboard" class="cta-btn">Go to Dashboard</a>
                </div>

                <!-- Support -->
                <div class="support-card">
                    <h3>Need Help?</h3>
                    <p>We're here 24/7 to assist you</p>
                    <p><a href="mailto:support@goupbroad.com">support@goupbroad.com</a></p>
                    <p><a href="tel:+14156722765">+1 415 672 2765</a></p>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>© 2025 <strong>Goupbroad</strong>. All rights reserved.</p>
                <p>This is an automated task assignment email.</p>
                <p>
                    <a href="#">Unsubscribe</a> | 
                    <a href="#">Privacy Policy</a> | 
                    <a href="#">Contact Us</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return { subject, text, html };
};


export const PaymentConfirmationEmailTemplate = (data) => {
  const {
    studentName,
    studentEmail,
    planName,
    planPrice,
    orderId,
    paymentId,
    features = [],
    category,
  } = data;

  const subject = 'Payment Confirmation - UpBroad';
  const text = `Hi ${studentName},

Thank you for your payment!

Plan: ${planName}
Category: ${category}
Amount: ₹${planPrice}
Order ID: ${orderId}
Payment ID: ${paymentId}

Your plan is now active. Welcome to UpBroad!
`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation - UpBroad</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #145044; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }
          .success-icon { width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 32px; }
          .order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .order-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .order-row:last-child { border-bottom: none; }
          .features-list { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .feature-item:last-child { border-bottom: none; }
          .next-steps { background-color: #e8f5f3; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .step { margin: 15px 0; padding: 15px; background-color: white; border-radius: 5px; }
          .step-number { display: inline-block; width: 25px; height: 25px; background-color: #145044; color: white; border-radius: 50%; text-align: center; line-height: 25px; margin-right: 10px; font-size: 12px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .price { font-size: 24px; font-weight: bold; color: #145044; }
          .badge { background-color: #145044; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
      </style>
  </head>
  <body>
      <div class="header">
          <div class="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p>Thank you for choosing UpBroad. Your journey to success starts now!</p>
      </div>
      
      <div class="content">
          <div class="order-details">
              <h2 style="color: #145044; margin-top: 0;">Order Summary</h2>
              <div style="margin-bottom: 20px;">
                  <h3 style="margin: 0;">${planName}</h3>
                  <span class="badge">${category
                    .charAt(0)
                    .toUpperCase() + category.slice(1)}</span>
              </div>
              <div class="price">₹${planPrice.toLocaleString('en-IN')}</div>
              <div style="color: #666; margin-top: 5px;">Paid</div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                  <div class="order-row">
                      <span>Order ID:</span>
                      <span style="font-family: monospace; font-weight: bold;">${orderId}</span>
                  </div>
                  <div class="order-row">
                      <span>Payment ID:</span>
                      <span style="font-family: monospace; font-weight: bold;">${paymentId}</span>
                  </div>
                  <div class="order-row">
                      <span>Date:</span>
                      <span>${new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                  <div class="order-row">
                      <span>Customer:</span>
                      <span>${studentName} (${studentEmail})</span>
                  </div>
              </div>
          </div>
          
          <div class="features-list">
              <h3 style="color: #145044; margin-top: 0;">What's Included in Your Plan</h3>
              ${
                features && features.length
                  ? features
                      .map(
                        (feature) =>
                          `<div class="feature-item">✓ ${feature}</div>`
                      )
                      .join('')
                  : '<div class="feature-item">✓ Access to your selected plan</div>'
              }
          </div>
          
          <div class="next-steps">
              <h3 style="color: #145044; margin-top: 0;">What Happens Next?</h3>
              <div class="step">
                  <span class="step-number">1</span>
                  <strong>Confirmation Email</strong><br>
                  <small>You're reading it! Keep this email for your records.</small>
              </div>
              <div class="step">
                  <span class="step-number">2</span>
                  <strong>Counselor Assignment</strong><br>
                  <small>Our team will assign a dedicated counselor to your case within 24-48 hours.</small>
              </div>
              <div class="step">
                  <span class="step-number">3</span>
                  <strong>Initial Consultation</strong><br>
                  <small>Your counselor will schedule an initial consultation call to understand your goals.</small>
              </div>
              <div class="step">
                  <span class="step-number">4</span>
                  <strong>Get Started</strong><br>
                  <small>Begin your journey with expert guidance every step of the way!</small>
              </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0f8f6; border-radius: 8px;">
              <h3 style="color: #145044; margin-top: 0;">Need Help?</h3>
              <p style="margin: 10px 0;">Our support team is here to assist you</p>
              <p style="margin: 5px 0;">📧 support@upbroad.com</p>
              <p style="margin: 5px 0;">📞 +1 415 672 2765</p>
          </div>
      </div>
      
      <div class="footer">
          <p>© 2024 UpBroad. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this email.</p>
      </div>
  </body>
  </html>
  `;

  return { subject, text, html };
};

export const PaymentInitiationAdminEmailTemplate = (data) => {
  const {
    studentName,
    studentEmail,
    planName,
    planPrice,
    orderId,
    category,
  } = data;

  const subject = 'New Payment Initiated - UpBroad';
  const text = `New payment initiated on UpBroad:

Student: ${studentName} (${studentEmail})
Plan: ${planName}
Category: ${category}
Amount: ₹${planPrice}
Order ID: ${orderId}
Date: ${new Date().toLocaleString('en-IN')}

This is an initiation notification. Final status depends on verification and capture.`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Payment Initiated - UpBroad</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #145044; color: white; padding: 24px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background-color: #f9f9f9; padding: 24px 20px; border-radius: 0 0 10px 10px; }
          .order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .order-row:last-child { border-bottom: none; }
          .badge { background-color: #145044; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
          .price { font-size: 20px; font-weight: bold; color: #145044; }
          .footer { text-align: center; padding: 16px; color: #666; font-size: 13px; }
      </style>
  </head>
  <body>
      <div class="header">
          <h2>New Payment Initiated</h2>
          <p>A student has initiated a payment on UpBroad.</p>
      </div>
      <div class="content">
          <div class="order-details">
              <h3 style="margin-top:0;color:#145044;">Payment Details</h3>
              <div class="order-row">
                  <span>Student:</span>
                  <span>${studentName} (${studentEmail})</span>
              </div>
              <div class="order-row">
                  <span>Plan:</span>
                  <span>${planName}</span>
              </div>
              <div class="order-row">
                  <span>Category:</span>
                  <span class="badge">${category
                    .charAt(0)
                    .toUpperCase() + category.slice(1)}</span>
              </div>
              <div class="order-row">
                  <span>Order ID:</span>
                  <span style="font-family: monospace;">${orderId}</span>
              </div>
              <div class="order-row">
                  <span>Amount:</span>
                  <span class="price">₹${planPrice.toLocaleString('en-IN')}</span>
              </div>
              <div class="order-row">
                  <span>Date:</span>
                  <span>${new Date().toLocaleDateString('en-IN')}</span>
              </div>
          </div>
          <p>This is just an initiation notification. Final status will depend on the payment verification and capture.</p>
      </div>
      <div class="footer">
          <p>© 2024 UpBroad. Internal notification email.</p>
      </div>
  </body>
  </html>
  `;

  return { subject, text, html };
};
