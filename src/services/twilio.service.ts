import twilio from 'twilio';
import { twilioConfig } from '@config';

const client: twilio.Twilio = twilio(twilioConfig.sid, twilioConfig.token);

/**
 * Send an sms
 * @param {string} to
 * @param {string} message
 * @returns {Promise}
 */

export const sendSMSAsync = async (to: string, message: any): Promise<void> => {
  if (!twilioConfig.phone) {
    return;
  }

  try {
    await client.messages.create({
      from: twilioConfig.phone,
      to,
      body: message,
    });
  } catch (error) {
    console.error(`TwilioService.sendSMSAsync: ${error.toString()}`);
  }
};

/**
 * Send invite sms
 * @param {string} to
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} firstNameInvite
 * @param {string} lastNameInvite
 * @param {string} referCode
 * @returns {Promise}
 */
export const sendInviteCarerSMS = async (to, firstName, lastName, firstNameInvite, lastNameInvite, referCode): Promise<void> => {
  const text = `Hello ${firstNameInvite} ${lastNameInvite},

${firstName} ${lastName} invited you to Scale-in.
Your referral code is ${referCode}.
You can download AICarer app file in following link:
https://play.google.com/store/apps/AICarer
Please download and create your account as Carer.

Kind Regards.
Thanks.`;
  await sendSMSAsync(to, text);
};

/**
 * Send request sms
 * @param {string} to
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} firstNameInvite
 * @param {string} lastNameInvite
 * @param {string} referCode
 * @returns {Promise}
 */
export const sendInviteUserSMS = async (to, firstName, lastName, firstNameInvite, lastNameInvite, referCode): Promise<void> => {
  const text = `Hello ${firstNameInvite} ${lastNameInvite},

${firstName} ${lastName} requested to become a Carer of you in AICarer platform.
Your referral code is ${referCode}.
You can download AICarer app file in following link:
https://play.google.com/store/apps/AICarer
Please download and create your account as User.

Kind Regards.
Thanks.`;
  await sendSMSAsync(to, text);
};

export const sendAcceptStatusSMS = async (to, firstName, lastName, firstNameInvite, lastNameInvite, status): Promise<void> => {
  const text = `Hello ${firstNameInvite} ${lastNameInvite},

${firstName} ${lastName} ${status} your request in Scale-in.

Kind Regards.
Thanks.`;
  await sendSMSAsync(to, text);
};
