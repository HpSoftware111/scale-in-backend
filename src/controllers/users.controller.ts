import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { IAffiliationTableRowDataType, User } from '@interfaces/users.interface';
import { UserService } from '@services/users.service';
import { UserModel } from '@/models/users.model';
import { getValue } from '@/utils/price';
const { request } = require('undici');
import { EvolutionModel } from '@/models/evolution.model';
import { StripeService } from '@/services/stripe.service';
import { ObjectId } from 'mongodb';
import { HistoryModel } from '@/models/history.model';
import { OrderModel } from '@/models/orders.model';
import { DepositAndWithdrawalModel } from '@/models/deposits_and_withdrawals.model';
import { BinanceService } from '@/services/binance.service';
import { getAffiliationData, saveEvolutionForOneUser, updateDepositsAndWithdrawalsForOneUser, updateHistoriesForOneUser } from '@/utils/users';
import { SHA256 } from 'crypto-js';
import crypto from 'crypto';

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import fetch, { Headers } from 'node-fetch';

import { AffiliateMappingModel } from '@/models/affiliate_mapping';
import { DISCORD_APPLICATION_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URL } from '@/config';
import axios from 'axios';
import { addMemberRoleIdToUser, addMemberToServer, sendMessageToChannel } from '@/utils/discord';
import { fDate, generateRandomCode } from '@/utils/common';
import { ACTIVE_MONTHLY_PLAN_ID, ACTIVE_YEARLY_PLAN_ID } from '@/utils/constants';

const hashUserId = (userId: string, length = 8) => {
  const hash = crypto.createHash('sha256').update(userId).digest('hex');

  const shortHash = hash.substring(0, length);

  return shortHash;
};

export class UserController {
  public User = Container.get(UserService);
  public Stripe = Container.get(StripeService);

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: User[] = await this.User.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const UserId: string = req.params.id;
      const findOneUserData: User = await this.User.findUserById(UserId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const UserData: User = req.body;
      const createUserData: User = await this.User.createUser(UserData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const UserId: string = req.params.id;
      const UserData: User = req.body;
      const updateUserData: User = await this.User.updateUser(UserId, UserData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const UserId: string = req.params.id;
      const deleteUserData: User = await this.User.deleteUser(UserId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateKucoinKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      findOneUserData.bcConnectType = 'kucoin';
      findOneUserData.kucoin = req.body;
      await findOneUserData.save();

      await updateDepositsAndWithdrawalsForOneUser(findOneUserData);
      await updateHistoriesForOneUser(findOneUserData);
      await saveEvolutionForOneUser(findOneUserData, new Date());

      res.status(200).json({ message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateBinanceKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      findOneUserData.bcConnectType = 'binance';
      findOneUserData.binance = req.body;
      await findOneUserData.save();

      await updateDepositsAndWithdrawalsForOneUser(findOneUserData);
      await updateHistoriesForOneUser(findOneUserData);
      await saveEvolutionForOneUser(findOneUserData, new Date());

      res.status(200).json({ message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public unSyncKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      findOneUserData.bcConnectType = '';
      await findOneUserData.save();

      res.status(200).json({ message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getAffiliationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      const affiliation = findOneUserData.affiliation;

      const tableData: IAffiliationTableRowDataType[] = [];

      let totalSales = 0;
      let nextCommissionYouWillEarn = 0;

      const now = new Date();
      const commissionPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      for (let index = 0; index < affiliation.customers.length; index++) {
        const affiliationUser = await UserModel.findOne({ _id: affiliation.customers[index] });
        const userAffiliationData = getAffiliationData(affiliationUser, commissionPaymentDate);
        totalSales += userAffiliationData.amountPaid;
        nextCommissionYouWillEarn += userAffiliationData.commissionAmout;

        tableData.push(userAffiliationData);
      }

      return res.status(200).json({
        affiliation: {
          link: affiliation.link,
          wallet: affiliation.wallet,
          totalClick: affiliation.totalClick,
          totalSales: totalSales,
          activeReferrals: affiliation.customers.length,
          totalCommissionEarned: affiliation.totalCommissionEarned,
          nextCommissionYouWillEarn: nextCommissionYouWillEarn,
          nextCommissionPaymentDate: commissionPaymentDate,
          tableData: tableData,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateWalletAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { address } = req.body;
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      findOneUserData.affiliation.wallet = address;
      await findOneUserData.save();

      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public generateAffiliationLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      if (findOneUserData) {
        let randomCode = '';

        while (true) {
          randomCode = generateRandomCode(5);

          const existedAffiliateCode = await AffiliateMappingModel.findOne({ hashedUserId: randomCode });
          if (!existedAffiliateCode) break;
        }

        const link = `https://www.scale-in.com/invite/${randomCode}`;
        findOneUserData.affiliation.link = link;
        await findOneUserData.save();

        await AffiliateMappingModel.findOneAndUpdate(
          { hashedUserId: randomCode },
          { userId: findOneUserData._id.toString() },
          { upsert: true, new: true }, // Create a new document if not found, and return the updated document
        );

        return res.status(200).json({ status: 'success', link: link });
      }
      return res.status(200).json({ status: 'fail', link: '' });
    } catch (error) {
      next(error);
    }
  };

  public handleInviteCode = async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    try {
      const existedAffiliateCode = await AffiliateMappingModel.findOne({ hashedUserId: code });

      const findOneUserData = await UserModel.findOne({ _id: existedAffiliateCode.userId });
      findOneUserData.affiliation.totalClick += 1;
      await findOneUserData.save();

      return res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getBcConnectType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      res.status(200).json({ type: findOneUserData.bcConnectType });
    } catch (error) {
      next(error);
    }
  };

  public getBcAccountInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      if (findOneUserData.bcConnectType !== '') {
        return res.status(200).json({ type: 'success' });
      }

      return res.status(200).json({ type: 'fail' });
    } catch (error) {
      next(error);
    }
  };

  public getEvolution = async (req: Request, res: Response, next: NextFunction) => {
    const { duration, userId } = req.body;
    const date = this.getDurationDate("All");

    const result = await EvolutionModel.aggregate([
      {
        $match: {
          snapped_at: { $gte: date }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$snapped_at" } },
          total: { $sum: "$total" },
          BTCm: { $sum: "$price.BTCm" },
          ETH: { $sum: "$price.ETH" },
          AVX: { $sum: "$price.AVX" },
          SOL: { $sum: "$price.SOL" },
          snapped_at: { $first: "$snapped_at" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    res.json(result);
  }

  public getDurationDate = (duration: string) => {
    let date = new Date();
    if (duration == "7D") {
      date.setDate(date.getDate() - 1);
    } else if (duration == "1M") {
      date.setMonth(date.getMonth() - 1);
    } else if (duration == "3M") {
      date.setMonth(date.getMonth() - 3);
    } else if (duration == "6M") {
      date.setMonth(date.getMonth() - 6);
    } else if (duration == "1Y") {
      date.setMonth(date.getMonth() - 12);
    } else if (duration == "All") {
      date.setMonth(date.getMonth() - 100000000);
    }
    return date;
  }

  public getYourPortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      if (findOneUserData.bcConnectType !== '') {
        const history = await HistoryModel.findOne({ userId: findOneUserData._id });
        if (history) {
          const balance: any = history.balance;
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

          const evolutions = await EvolutionModel.find({
            userId: findOneUserData._id,
            snapped_at: {
              $gte: oneYearAgo,
            },
          }).sort({ snapped_at: 1 });

          const withdrawals = await DepositAndWithdrawalModel.find({
            userId: findOneUserData._id,
            type: 'withdrawal',
            datetime: {
              // $gte: findOneUserData.logged_in ? findOneUserData.logged_in : oneYearAgo,
              $gte: findOneUserData.email == 'softtscoder@gmail.com' ? oneYearAgo : findOneUserData.logged_in,
            },
          });

          const price = getValue();
          const btcPrice = price.BTC * balance.free['BTC'];
          const ethPrice = price.ETH * balance.free['ETH'];
          const avaxPrice = price.AVAX * balance.free['AVAX'];
          const solPrice = price.SOL * balance.free['SOL'];

          return res.status(200).json({
            invested: findOneUserData.subscription.investAmount,
            capital: balance.free['USDT'] + btcPrice + ethPrice + avaxPrice + solPrice,
            actual: {
              USDT: balance.free['USDT'],
              BTC: btcPrice,
              ETH: ethPrice,
              AVAX: avaxPrice,
              SOL: solPrice,
            },
            evolutions: evolutions,
            withdrawals: withdrawals,
          });
        }
      }

      return res.status(200).json({
        invested: 0,
        capital: 0,
        actual: {
          USDT: 0,
          BTC: 0,
          ETH: 0,
          AVAX: 0,
          SOL: 0,
        },
        evolutions: [],
      });
    } catch (error) {
      next(error);
    }
  };

  public getOpenOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      // if (findOneUserData.bcConnectType !== '') {
      //   const history = await HistoryModel.findOne({ userId: findOneUserData._id });
      //   if (history) {
      //     const orders = history.openOrders;
      //     return res.status(200).json({
      //       ordres: orders,
      //     });
      //   }
      // }

      return res.status(200).json({
        orders: [],
      });
    } catch (error) {
      next(error);
    }
  };

  public discordCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: DISCORD_APPLICATION_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: DISCORD_REDIRECT_URL,
          scope: 'identify',
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const oauthData = await tokenResponseData.body.json();

      const userResponse = await axios.get('https://discord.com/api/users/@me', {
        headers: {
          authorization: `Bearer ${oauthData.access_token}`, // Define the authorization
        },
      });

      const responseData = userResponse.data;

      const discordInfo = {
        username: responseData.username,
        id: responseData.id,
        avatar: responseData.avatar,
        global_name: responseData.global_name,
        locale: responseData.locale,
        status: 'connected',
      };

      findOneUserData.social.discord = discordInfo;
      await findOneUserData.save();

      // sendMessageToChannel(responseData.id, 'waiting-room');
      addMemberToServer(responseData.id, oauthData.access_token).catch(err => console.log(err));

      return res.status(200).json({ info: discordInfo, status: true });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public getDepositAndWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      const datas = await DepositAndWithdrawalModel.find({ userId: findOneUserData._id }).sort({ datetime: -1 });

      // const {skip, limit, range, sort} = getPaginationParameters(req.body);

      // const datas = await DepositAndWithdrawalModel.find({ userId: findOneUserData._id })
      //   .skip(skip)
      //   .limit(limit)
      //   .sort({ datetime: -1 });
      // const totalItems = await DepositAndWithdrawalModel.countDocuments();
      // const filter = { datetime: { $gte: range.start, $lte: range.end } };
      // const searchedItems = await DepositAndWithdrawalModel.countDocuments();

      if (datas) {
        return res.status(200).json({
          datas: datas,
          // total: totalItems,
          // searched: searchedItems,
        });
      }

      return res.status(200).json({
        datas: [],
      });
    } catch (error) {
      next(error);
    }
  };

  public getOrdersHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      const orders = await OrderModel.find({ userId: findOneUserData._id }).sort({ date: -1 });
      if (orders) {
        return res.status(200).json({
          orders: orders,
        });
      }

      return res.status(200).json({
        orders: [],
      });
    } catch (error) {
      next(error);
    }
  };

  public getSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      return res.status(200).json({ status: findOneUserData.subscription });
    } catch (error) {
      next(error);
    }
  };

  public getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      const details = await this.Stripe.getSubscriptionStatusDetails(findOneUserData.stripeCustomerId);
      return res.status(200).json({ status: findOneUserData.subscription, details: details });

      // return res.status(200).json({ type: 'fail' });
    } catch (error) {
      next(error);
    }
  };

  public updatePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentMethodId } = req.body;
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      const details = await this.Stripe.updatePaymentMethod(paymentMethodId, findOneUserData.stripeCustomerId);
      return res.status(200).json({ data: details });

      // return res.status(200).json({ type: 'fail' });
    } catch (error) {
      next(error);
    }
  };

  public getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });

      const data = await this.Stripe.getPaymentHistory(findOneUserData.stripeCustomerId);

      return res.status(200).json({ message: 'get-payment-history', data: data });

      // return res.status(200).json({ type: 'fail' });
    } catch (error) {
      next(error);
    }
  };

  public cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      await this.Stripe.cancelSubscription(findOneUserData.stripeCustomerId, type);

      return res.status(200).json({ message: 'cancel-subscription' });
    } catch (error) {
      next(error);
    }
  };

  public renewSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      await this.Stripe.renewSubscription(findOneUserData.stripeCustomerId, type);

      return res.status(200).json({ message: 'renew-subscription' });
    } catch (error) {
      next(error);
    }
  };

  public downloadInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, type } = req.body;
      const findOneUserData = await UserModel.findOne({ _id: (req as any).user._id });
      const invoices = await this.Stripe.getInvoicesList(findOneUserData.stripeCustomerId, type, startDate, endDate);
      const zipFileName = `invoices_${fDate(new Date(startDate), 'yyyy-MM-dd')}_${fDate(new Date(endDate), 'yyyy-MM-dd')}.zip`;
      const zipFilePath = path.join(__dirname, '../public', zipFileName);
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        res.download(zipFilePath, zipFileName, (err: any) => {
          if (err) {
            console.error('Error downloading zip file:', err);
          }
          console.log('send zip file');
          fs.unlinkSync(zipFilePath); // Clean up the file after download
        });
      });

      archive.on('error', (err: any) => {
        throw err;
      });

      archive.pipe(output);

      // Add each invoice to the zip file
      for (const invoice of invoices) {
        const invoicePdfUrl = invoice.invoice_pdf;
        const response = await axios({
          url: invoicePdfUrl,
          method: 'GET',
          responseType: 'stream',
        });

        archive.append(response.data, { name: `${invoice.id}.pdf` });
      }

      await archive.finalize();

      // return res.status(200).json({ message: 'download-invoices' });
    } catch (error) {
      next(error);
    }
  };
}
