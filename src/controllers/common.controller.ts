import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';

import { nodeMailer } from '@config';
import { EmailService } from '@services/email.service';
import { ContactModel } from '@/models/contacts.model';
import { EmailSupportsModel } from '@/models/email_supports.model';
import { UserModel } from '@models/users.model';

import { QIPerformanceText, QIPerformanceHTML, PCGuideText, PCGuideHTML, ContactRequestText, ContactRequestHTML, joinTelegramText, joinTelegramHtml } from '@/utils/email-templates';

const REQUEST_LIMIT = 5;

export class CommonController {
  public email = Container.get(EmailService);

  public requestQIPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip;
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const requestCount = await EmailSupportsModel.where({
        ip: ipAddress,
        createdAt: {
          $gte: oneMinuteAgo,
        }
      }).countDocuments();
      
      if (requestCount > REQUEST_LIMIT) {
        res.status(403).json({ message: 'Request limit exceed!' });
        return;
      }
      
      const info = await this.email.sendEmail({
        to: req.body.email, 
        subject: 'Scale-in Quant Invest Performance', 
        text: QIPerformanceText(),
        html: QIPerformanceHTML(),
      });

      await EmailSupportsModel.create({
        ip: ipAddress,
        email: req.body.email,
        type: 'qi_performance',
        meta: '',
      });

      res.status(200).json({ message: 'Message sent' });
    } catch (error) {
      next(error);
    }
  };

  public requestPCGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip;
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const requestCount = await EmailSupportsModel.where({
        ip: ipAddress,
        createdAt: {
          $gte: oneMinuteAgo,
        }
      }).countDocuments();

      if (requestCount > REQUEST_LIMIT) {
        res.status(403).json({ message: 'Request limit exceed!' });
        return;
      }
      
      const info = await this.email.sendEmail({
        to: req.body.email, 
        subject: 'Scale-in Private Club Guide', 
        text: PCGuideText(),
        html: PCGuideHTML(),
      });

      await EmailSupportsModel.create({
        ip: ipAddress,
        email: req.body.email,
        type: 'pc_guide',
        meta: '',
      });

      res.status(200).json({ data: info, message: 'Message sent' });
    } catch (error) {
      next(error);
    }
  };

  public contactRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip;
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const requestCount = await ContactModel.where({
        ip: ipAddress,
        createdAt: {
          $gte: oneMinuteAgo,
        }
      }).countDocuments();

      if (requestCount > REQUEST_LIMIT) {
        res.status(403).json({ message: 'Request limit exceed!' });
        return;
      }

      const subject: string = req.body.subject;
      const username: string = req.body.username;
      const email: string = req.body.email;
      const content: string = req.body.content;

      await ContactModel.create({
        ip: ipAddress,
        email: email,
        fullName: username,
        subject: subject,
        message: content,
        status: 'request',
      });

      const receiver = (subject == "Technical support" || subject == "Sales support") ? nodeMailer.email.supportReceiver : nodeMailer.email.contactReceiver;

      const info = await this.email.sendEmail({
        to: receiver,
        subject: '[Scale-in] New contact form submission', 
        text: ContactRequestText(username, email, subject, content),
        html: ContactRequestHTML(username, email, subject, content),
      });

      res.status(200).json({ data: info, message: 'Message sent' });
    } catch (error) {
      next(error);
    }
  };

  public joinTelegram = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip;
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const requestCount = await EmailSupportsModel.where({
        ip: ipAddress,
        createdAt: {
          $gte: oneMinuteAgo,
        }
      }).countDocuments();

      if (requestCount > REQUEST_LIMIT) {
        res.status(403).json({ message: 'Request limit exceed!' });
        return;
      }

      const findUser = await UserModel.findOne({email: req.body.email});
      let userName = "dear";
      if (findUser) {
        userName = findUser.firstName + ' ' + findUser.lastName;
      }

      const info = await this.email.sendEmail({
        to: req.body.email, 
        subject: 'Scale-in Join telegram', 
        text: joinTelegramText('https://t.me/scale_in', userName),
        html: joinTelegramHtml("https://t.me/scale_in", userName),
      });

      await EmailSupportsModel.create({
        ip: ipAddress,
        email: req.body.email,
        type: 'telegram_join',
        meta: '',
      });

      res.status(200).json({ data: info, message: 'Message sent' });
    } catch (error) {
      next(error);
    }
  };
}
