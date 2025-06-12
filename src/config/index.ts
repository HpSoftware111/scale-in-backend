import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

console.log('================>?', process.env.NODE_ENV);
export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;
export const { DB_HOST, DB_PORT, DB_DATABASE } = process.env;
export const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  EMAIL_FROM,
  EMAIL_CONTACT_EMAIL_RECEIVER,
  EMAIL_SUPPORT_EMAIL_RECEIVER,
  GOOGLE_CLIENT_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_APPLICATION_ID,
  DISCORD_SERVER_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URL,
  BLOCKPASS_CLIENT_ID,
  BLOCKPASS_API_KEY,
  DISCORD_TOKEN
} = process.env;
export const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_PHONE_NUMBER } = process.env;
export const nodeMailer = {
  email: {
    smtp: {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
    },
    from: EMAIL_FROM,
    contactReceiver: EMAIL_CONTACT_EMAIL_RECEIVER,
    supportReceiver: EMAIL_SUPPORT_EMAIL_RECEIVER,
  },
};

export const twilioConfig = {
  sid: TWILIO_ACCOUNT_SID,
  token: TWILIO_AUTH_TOKEN,
  phone: TWILIO_FROM_PHONE_NUMBER,
};

export const { 
  SUBSCRIPTION_PRIVATE_CLUB_1MONTHLY_PLAN, 
  SUBSCRIPTION_PRIVATE_CLUB_1YEAR_PLAN, 
  SUBSCRIPTION_PRIVATE_CLUB_2MONTHLY_PLAN,
  SUBSCRIPTION_PRIVATE_CLUB_2YEAR_PLAN,
} = process.env;

export const SUBSCRIPTION_PRIVATE_CLUB = {
  "1year": SUBSCRIPTION_PRIVATE_CLUB_1YEAR_PLAN,
  "1month": SUBSCRIPTION_PRIVATE_CLUB_1MONTHLY_PLAN,
  "2year": SUBSCRIPTION_PRIVATE_CLUB_2YEAR_PLAN,
  "2month": SUBSCRIPTION_PRIVATE_CLUB_2MONTHLY_PLAN,
};