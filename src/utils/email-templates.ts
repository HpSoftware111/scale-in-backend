// <link href='https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap' rel='stylesheet'>
const htmlHeader = `
<!DOCTYPE html>
<html>
<head>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400&display=swap');
  </style>
  <style>
  body {
    font-family: 'Poppins';
    font-size: 16px;
    color: white;
  }
  p {
    display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    unicode-bidi: isolate;
  }
</style>
</head>
<body>
      <div style="font-family: 'Poppins', Arial, sans-serif; width: 620px">
`;

const htmlFooter = `
      </div>
</body>
</html>
`;

const scaleInMarkIcon = 'data:image/png;base64,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';
const scaleInMarkLabel = 'data:image/png;base64,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';

const templateHeader = `
      <div style="border-radius: 20px; border-width: 1px; border-style: solid; border-color: #575C70; background-image: linear-gradient(180deg, #2F344D, #1E243F); padding: 20px; text-align: center;">
        <a href="https://scale-in.com" target="_blank">
          <img src="https://scale-in.com/assets/logo.png" width="172px" height="44px" alt="Scale-in Logo" />
        </a>
      </div>
`


export const sendSignupText = (userName: string) => {
  return `
Hi ${userName},

Your account is successfully created, please join and enjoy our platform.
https://scale-in.com

If you need further assistance, feel free to contact our support team at support@scale-in.com.

Scale-in team.
`
}

export const sendSignupHTML = (userName: string) => {
  return `${htmlHeader}
  <div style="background-color: #141A36; border-radius: 20px; padding: 20px; color: white; width: 620px; box-sizing: border-box;">
    ${templateHeader}
    <div style="padding: 0 20px 20px 20px; margin-top: 20px; border-radius: 20px; border: 1px solid #FFFFFF1A; text-align: center;">
      <p style="font-size: 24px; font-weight: 600; line-height: 36px; color: white;">Welcome to Scale-in!</p>
      <div style="margin-top: 20px; margin-bottom: 20px; border-top: 1px solid #FFFFFF1A;"></div>
      <p style="color: white;">Dear <b>${userName}</b>,</p>
      <p style="font-size: 14px; color: white;">Your account is successfully created, please join and enjoy our platform.</p>
      <p style="font-size: 14px; color: white; margin-bottom: 0; ">If you need further assistance, feel free to contact our support team at <a href="mailto:support@scale-in.com" style="color: #0075FF!important;">support@scale-in.com</a>.</p>
    </div>
    <div style="text-align: center; color: #A1A3AF; font-size: 12px; margin-top: 20px;">Copyright © 2017 - 2025 Scale-in - All Rights Reserved</div>
  </div>
${htmlFooter}
`
};

export const sendOtpText = (otpCode: string, userName: string) => {
  return `
Hi ${userName},
We received a request to reset the password for your account. To proceed, please use following One Time Code.

${otpCode}

If you did not request a password reset, please ignore this email or let us know if you have any concerns.
For security reasons, this code will expire in 2 days. If you need further assistance, feel free to contact our support team at support@scale-in.com.

Scale-in team.
`
}

export const sendOtpHTML = (otpCode: string, userName: string) => {
  return `${htmlHeader}
  <div style="background-color: #141A36; border-radius: 20px; padding: 20px; color: white; width: 620px; box-sizing: border-box;">
    ${templateHeader}
    <div style="padding: 0 20px 20px 20px; margin-top: 20px; border-radius: 20px; border: 1px solid #FFFFFF1A; text-align: center;">
      <p style="font-size: 24px; font-weight: 600; line-height: 36px; color: white;">Reset your password</p>
      <div style="margin-top: 20px; margin-bottom: 20px; border-top: 1px solid #FFFFFF1A;"></div>
      <p style="color: white;">Dear <b>${userName}</b>,</p>
      <p style="font-size: 14px;">We received a request to reset the password for your account. To proceed, please use following One Time Code.</p>
      <p style="font-size: 24px; font-weight: 600; line-height: 36px; letter-spacing: 20px; color: white;">${otpCode}</p>
      <p style="font-size: 14px; color: white;">If you did not request a password reset, please ignore this email or let us know if you have any concerns.</p>
      <p style="font-size: 14px; color: white; margin-bottom: 0;">For security reasons, this code will expire in 2 days. If you need further assistance, feel free to contact our support team at <a href="mailto:support@scale-in.com" style="color: #0075FF!important;">support@scale-in.com</a>.</p>
    </div>
    <div style="text-align: center; color: #A1A3AF; font-size: 12px; margin-top: 20px;">Copyright © 2017 - 2025 Scale-in - All Rights Reserved</div>
  </div>
${htmlFooter}
`
};

export const joinTelegramText = (telegramLink: string, username: string) => {
  return `
Hi ${username},
Stay ahead in your investment journey with comprehensive market analysis and expert insights delivered directly to your device.

${telegramLink}

If you don’t recognize this request, please make sure to change your password to secure your account.
If you need further assistance, feel free to contact our support team at support@scale-in.com.

Scale-in team.
`
}

export const joinTelegramHtml = (telegramLink: string, username: string) => {
  return `${htmlHeader}
  <div style="font-family: 'Poppins', Arial, sans-serif; background-color: #141A36; border-radius: 20px; padding: 20px; color: white; width: 620px; box-sizing: border-box;">
    ${templateHeader}
    <div style="padding: 0 20px 20px 20px; margin-top: 20px; border-radius: 20px; border: 1px solid #FFFFFF1A; text-align: center;">
      <p style="font-size: 24px; font-weight: 600; line-height: 36px; color: white;">Join our telegram for daily updates!</p>
      <div style="margin-top: 20px; margin-bottom: 20px; border-top: 1px solid #FFFFFF1A;"></div>
      <p style="color: white; font-size: 16px;">Hi <b>${username}</b>,</p>
      <p style="font-size: 14px; color: white;">Stay ahead in your investment journey with comprehensive market analysis and expert insights delivered directly to your device.</p>
      <a href="${telegramLink}" target="_blank" style="display: block; background-color: #039BE5; border-radius: 5px; padding: 15px 20px; text-decoration: none; color: white; text-align: center;">
        <span style="display: inline-block; vertical-align: middle;">
          <img src="https://scale-in.com/assets/icons/telegram.png" width="18px" height="16px" alt="telegram_logo" style="vertical-align: middle;" />
        </span>
        <span style="display: inline-block; vertical-align: middle; margin-left: 10px; font-size: 16px; font-weight: 600;">
          Join now
        </span>
      </a>
      <p style="margin-top: 20px; font-size: 14px; color: white;">If you don’t recognize this request, please make sure to change your password to secure your account.</p>
      <div style="margin-top: 20px; margin-bottom: 20px; border-top: 1px solid #FFFFFF1A;"></div>
      <p style="font-size: 14px; color: white; margin-bottom: 0;">If you need further assistance, feel free to contact our support team at <a href="mailto:support@scale-in.com" style="color: #0075FF!important;">support@scale-in.com</a></p>
    </div>
    <div style="text-align: center; color: #A1A3AF; font-size: 12px; margin-top: 20px;">Copyright © 2017 - 2025 Scale-in - All Rights Reserved</div>
  </div>
${htmlFooter}
`
};

export const QIPerformanceText = () => {
  return `We are sending Quant invest performance information.`;
};

export const QIPerformanceHTML = () => {
  return `${htmlHeader}
<div style="background-color: #141A36; border-radius: 20px; padding: 20px; color: white; width: 620px; box-sizing: border-box;">
  ${templateHeader}
  <div style="padding: 0 20px 20px 20px; margin-top: 20px; border-radius: 20px; border: 1px solid #FFFFFF1A; text-align: center;">
    <p style="font-size: 24px; font-weight: 600; line-height: 36px; color: white;">Quant Invest prformance</p>
    <div style="margin-top: 20px; margin-bottom: 20px; border-top: 1px solid #FFFFFF1A;"></div>
    <p style="font-size: 14px; color: white; margin-bottom: 0;">We are sending Quant invest performance information.</p>
  </div>
  <div style="text-align: center; color: #A1A3AF; font-size: 12px; margin-top: 20px;">Copyright © 2017 - 2025 Scale-in - All Rights Reserved</div>
</div>
${htmlFooter}
`
};

export const PCGuideText = () => {
  return `We are sending Private club instruction guide`;
};

export const PCGuideHTML = () => {
  return `${htmlHeader}
<div style="background-color: #141A36; border-radius: 20px; padding: 20px; color: white; width: 620px; box-sizing: border-box;">
  ${templateHeader}
  <div style="padding: 0 20px 20px 20px; margin-top: 20px; border-radius: 20px; border: 1px solid #FFFFFF1A; text-align: center;">
    <p style="font-size: 24px; font-weight: 600; line-height: 36px; color: white;">Private Club instruction guide</p>
    <div style="margin-top: 20px; margin-bottom: 20px; border-top: 1px solid #FFFFFF1A;"></div>
    <p style="font-size: 14px; color: white; margin-bottom: 0;">We are sending Private Club instruction guide.</p>
  </div>
  <div style="text-align: center; color: #A1A3AF; font-size: 12px; margin-top: 20px;">Copyright © 2017 - 2025 Scale-in - All Rights Reserved</div>
</div>
${htmlFooter}
`
};

export const ContactRequestText = (username: string, email: string, subject: string, content: string) => {
  return `Name: ${username}
Email: ${email}
Subject: ${subject}
Message: ${content}`;
};

export const ContactRequestHTML = (username: string, email: string, subject: string, content: string) => {
  return `<p><b>Name:</b> ${username}</p>
<p><b>Email:</b> ${email}</p>
<p><b>Subject:</b> ${subject}</p>
<p><b>Message:</b></p>
<p>${content}</p>
`;
};