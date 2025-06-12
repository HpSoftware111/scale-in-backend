import nodemailer from 'nodemailer';
import { nodeMailer } from '@config';
import { Service, Container } from 'typedi';

import { sendOtpText, sendOtpHTML, sendSignupText, sendSignupHTML } from '@/utils/email-templates';

const transport = nodemailer.createTransport(nodeMailer.email.smtp);

transport
  .verify()
  .then((e) => console.log('Connected to email server', e))
  .catch((e) => console.log('Unable to connect to email server. Make sure you have configured the SMTP options in .env', e));


@Service()
export class EmailService {
  /**
   * Send an email
   * @param {string} to
   * @param {string} subject
   * @param {string} text
   * @param {string} html
   * @param {Array<Object>} attachment
   * @returns {Promise}
   */
  public async sendEmail({ to, subject, text, html, attachments }: { to: string; subject: string; text: string; html: string, attachments?: any }): Promise<void> {
    const msg = { from: nodeMailer.email.from, to, subject, text, html, attachments };
    return await transport.sendMail(msg);
  };

  /**
   * Send reset password email
   * @param {string} to
   * @param {string} otpCode
   * @returns {Promise}
   */
  public async sendOtpCode(to, otpCode, userName): Promise<void> {
    const subject = 'Your One Time Code For Scale-in';
    await this.sendEmail({ 
      to: to, 
      subject: subject, 
      text: sendOtpText(otpCode, userName),
      html: sendOtpHTML(otpCode, userName),
    });
  };

  /**
   * Send login email
   * @param {string} to
   * @returns {Promise}
   */
  public async sendSignupCompleted(to, userName): Promise<void> {
    const subject = 'Welcome to Scale-in!';
    await this.sendEmail({ 
      to: to, 
      subject: subject, 
      text: sendSignupText(userName), 
      html: sendSignupHTML(userName),
    });
  };

  /**
   * Send invite email
   * @param {string} to
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} firstNameInvite
   * @param {string} lastNameInvite
   * @returns {Promise}
   */
  public async sendInviteEmail (to, firstName, lastName, firstNameInvite, lastNameInvite): Promise<void> {
    const subject = `Invitation from ${firstName} ${lastName}.`;
    const text = `
      Hello ${firstNameInvite} ${lastNameInvite},
      ${firstNameInvite} ${lastNameInvite} invited you to Scale-in.
      Kind Regards.
      Thanks.
      `;
    await this.sendEmail({ to: to, subject: subject, text: text, html: text });
  };
}