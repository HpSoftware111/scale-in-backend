import { IAdminAffiliate, IAdminAffiliateCommission } from '@/interfaces/admin/affiliate.interface';
import { UserModel } from '@/models/users.model';
import { SettingsService } from '@/services/settings.service';
import { getCommissionRate, getOfferSubscribedName, totalPaidFromUser } from '@/utils/users';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';

export class AdminAffiliateController {
  public settings = Container.get(SettingsService);

  getCommissionsPaidData = async () => {
    const years: number[] = [2020, 2021, 2022, 2023, 2024];
    const datas = years.map((year: number) => {
      return {
        year: year.toString(),
        data: [
          {
            name: 'Total',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
        ],
      };
    });
    return datas;
  };

  public getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commissionsPaidData = await this.getCommissionsPaidData();
      const commissionsWillbePaid = '0 $';

      const years = [2020, 2021, 2022, 2023, 2024];

      const referrals = await UserModel.aggregate([
        { $unwind: '$affiliation.customers' }, // Unwind the customers array
        {
          $match: {
            $expr: {
              $in: [{ $year: '$affiliation.customers.date' }, years],
            },
          },
        }, // Match documents where the customer date year is in the specified years
        {
          $group: {
            _id: {
              year: { $year: '$affiliation.customers.date' },
              month: { $month: '$affiliation.customers.date' },
            }, // Group by year and month
            totalReferrals: { $sum: 1 }, // Sum the number of referrals
          },
        },
        {
          $project: {
            year: '$_id.year',
            month: '$_id.month',
            totalReferrals: 1,
            _id: 0,
          },
        },
        { $sort: { year: 1, month: 1 } }, // Sort by year and month
      ]);

      const referralsData = Array.from({ length: 5 }, () => Array(12).fill(0));

      referrals.forEach(entry => {
        const year = entry.year;
        const month = entry.month;
        const totalReferrals = entry.totalReferrals;

        // Calculate the index for the year (2020 is index 0, 2024 is index 4)
        const yearIndex = year - 2020;
        // Calculate the index for the month (January is index 0, December is index 11)
        const monthIndex = month - 1;

        // Update the referrals array
        referralsData[yearIndex][monthIndex] = totalReferrals;
      });

      const newReferralData = years.map((year: number) => {
        return {
          year: year.toString(),
          data: [
            {
              name: 'Total',
              data: referralsData[year - 2020],
            },
          ],
        };
      });

      const totalReferralsData = years.map((year: number) => {
        const originalArray = referralsData[year - 2020];
        const cumulativeArray = [];

        let sum = 0;
        for (let i = 0; i < originalArray.length; i++) {
          sum += originalArray[i];
          cumulativeArray.push(sum);
        }
        return {
          year: year.toString(),
          data: [
            {
              name: 'Total',
              data: cumulativeArray,
            },
          ],
        };
      });

      const privateClubReferralsData = await UserModel.aggregate([
        { $unwind: '$affiliation.customers' }, // Unwind the customers array
        {
          $lookup: {
            from: 'users', // The collection to join
            localField: 'affiliation.customers.userId', // The field from the input documents
            foreignField: '_id', // The field from the documents of the "from" collection
            as: 'customerDetails', // The name of the new array field to add to the input documents
          },
        },
        { $unwind: '$customerDetails' }, // Unwind the customerDetails array
        {
          $match: {
            'customerDetails.subscription.actInvest': true, // Match documents where isPrivateClub is true
          },
        },
        {
          $group: {
            _id: null, // Group all matching documents together
            totalPrivateClubReferrals: { $sum: 1 }, // Sum the number of private club referrals
          },
        },
        {
          $project: {
            _id: 0,
            totalPrivateClubReferrals: 1,
          },
        },
      ]);

      const totalPrivateClubReferrals = privateClubReferralsData.length > 0 ? privateClubReferralsData[0].totalPrivateClubReferrals : 0;

      const privateClubReferrals = totalPrivateClubReferrals.toString();

      const quantInvestReferralsData = await UserModel.aggregate([
        { $unwind: '$affiliation.customers' }, // Unwind the customers array
        {
          $lookup: {
            from: 'users', // The collection to join
            localField: 'affiliation.customers.userId', // The field from the input documents
            foreignField: '_id', // The field from the documents of the "from" collection
            as: 'customerDetails', // The name of the new array field to add to the input documents
          },
        },
        { $unwind: '$customerDetails' }, // Unwind the customerDetails array
        {
          $match: {
            'customerDetails.subscription.passInvest': true,
          },
        },
        {
          $group: {
            _id: null, // Group all matching documents together
            totalQuantInvestReferrals: { $sum: 1 }, // Sum the number of private club referrals
          },
        },
        {
          $project: {
            _id: 0,
            totalQuantInvestReferrals: 1,
          },
        },
      ]);

      const totalQuantInvestReferrals = quantInvestReferralsData.length > 0 ? quantInvestReferralsData[0].totalQuantInvestReferrals : 0;
      const quantInvestReferrals = totalQuantInvestReferrals.toString();

      const totalClicksData = await UserModel.aggregate([
        {
          $group: {
            _id: null, // Group all documents together
            totalClicks: { $sum: '$affiliation.totalClick' }, // Sum the totalClick field
          },
        },
        {
          $project: {
            _id: 0,
            totalClicks: 1,
          },
        },
      ]);

      const totalClicks = totalClicksData.length > 0 ? totalClicksData[0].totalClicks : 0;
      const affiliateLinkClicks = totalClicks.toString();

      res.status(200).json({
        data: {
          totalReferralsData,
          newReferralData,
          commissionsPaidData,

          privateClubReferrals,
          quantInvestReferrals,
          affiliateLinkClicks,
          commissionsWillbePaid,
        },
        message: 'analytics',
      });
    } catch (error) {
      next(error);
    }
  };

  public getAffiliateData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await UserModel.find().populate('affiliation.customers.userId');
      const affiliateSettings = await this.settings.getSettingsByKey('affiliate');

      const data: IAdminAffiliate[] = [];

      const now = new Date();
      const commissionPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        if (user.affiliation.customers.length > 0) {
          const customers = user.affiliation.customers;
          let totalAmount = 0;
          let activeAffiliates = 0;

          const isClient: boolean = user.subscription.actInvest || user.subscription.passInvest;
          const boosted: boolean = customers.length > affiliateSettings.numberOfActiveReferralsToBoost;
          const commissionRate = getCommissionRate(affiliateSettings, isClient, boosted);

          customers.forEach((customer: any) => {
            if (customer.userId.subscription.actInvest || customer.userId.subscription.passInvest) {
              totalAmount += totalPaidFromUser(customer.userId);
              activeAffiliates += 1;
            }
          });

          data.push({
            name: user.firstName + ' ' + user.lastName,
            isClient: user.subscription.actInvest || user.subscription.passInvest,
            activeAffiliates: activeAffiliates,
            commissionRate: commissionRate,
            totalCommissionReceived: 0,
            dateOfLastReferral: commissionPaymentDate,
            nextCommissionAmount: (totalAmount * commissionRate) / 100,
          });
        }
      }

      return res.status(200).json({
        data: data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAffiliateCommissionData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await UserModel.find().populate('affiliation.customers.userId');
      const affiliateSettings = await this.settings.getSettingsByKey('affiliate');

      const data: IAdminAffiliateCommission[] = [];

      const now = new Date();
      const commissionPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        if (user.affiliation.customers.length > 0) {
          const customers = user.affiliation.customers;

          const isClient: boolean = user.subscription.actInvest || user.subscription.passInvest;
          const boosted: boolean = customers.length > affiliateSettings.numberOfActiveReferralsToBoost;
          const commissionRate = getCommissionRate(affiliateSettings, isClient, boosted);
          customers.forEach((customer: any) => {
            if (customer.userId.subscription.actInvest || customer.userId.subscription.passInvest)
              data.push({
                clientName: user.firstName + ' ' + user.lastName,
                affiliateName: customer.userId.firstName + ' ' + customer.userId.lastName,
                offerSubscribed: getOfferSubscribedName(customer.userId),
                amountPaid: 0,
                commissionRate: commissionRate,
                commissionAmount: commissionRate * totalPaidFromUser(customer.userId),
                commissionPaymentDate: commissionPaymentDate,
                commissionPaid: false,
                txID: '',
              });
          });
        }
      }

      return res.status(200).json({
        data: data,
      });
    } catch (error) {
      next(error);
    }
  };
}
