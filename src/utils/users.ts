import { EvolutionModel } from '@/models/evolution.model';
import { UserModel } from '@/models/users.model';
import { KucoinService } from '@/services/kucoin.service';
import { StripeService } from '@/services/stripe.service';
import { getValue } from './price';
import { IAffiliationTableRowDataType, User } from '@/interfaces/users.interface';
import { HistoryModel } from '@/models/history.model';
import { BinanceService } from '@/services/binance.service';
import { OrderModel } from '@/models/orders.model';
import { DepositAndWithdrawalModel } from '@/models/deposits_and_withdrawals.model';
import { addMemberRoleIdToUser, removeMemberRoleIdToUser, sendDMMessage } from './discord';
import { getDiffDays } from './custom-util';
import { priceForPassInvest } from './common';

const ratios = [0.34, 0.33, 0.33];
const keys = ['first', 'second', 'third'];
const stripe = new StripeService();

export const saveEvolutionForOneUser = async (user: User, date: Date) => {
  let API = null;
  if (user.bcConnectType == 'kucoin') {
    API = new KucoinService();
    await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
  } else if (user.bcConnectType == 'binance') {
    API = new BinanceService();
    await API.initialize(user.binance.key, user.binance.secret);
  }

  if (API != null) {
    const balance = await API.fetchBalance();
    const price = getValue();
    const btcPrice = price.BTC * balance.free['BTC'];
    const ethPrice = price.ETH * balance.free['ETH'];
    const avaxPrice = price.AVAX * balance.free['AVAX'];
    const solPrice = price.SOL * balance.free['SOL'];

    const evolution = new EvolutionModel({
      userId: user._id,
      total: balance.free['USDT'] + btcPrice + ethPrice + avaxPrice + solPrice,
      actual: {
        USDT: balance.free['USDT'],
        BTC: btcPrice,
        ETH: ethPrice,
        AVAX: avaxPrice,
        SOL: solPrice,
      },
      price: price,
      snapped_at: date,
    });

    await evolution.save();
  }
};
export const saveEvolution = async (date: Date) => {
  const users = await UserModel.find();
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    await saveEvolutionForOneUser(user, date);
  }
};

export const totalPaidFromUser = (customerData: User) => {
  let total = 0;
  const subscription = customerData.subscription;

  if (subscription.passInvest) total += priceForPassInvest(subscription.investAmount);

  if (subscription.actInvest) total += subscription.isMonthly ? 2000 : 2000;

  return total;
};

export const getOfferSubscribedName = (customerData: User) => {
  if (customerData.subscription.actInvest && customerData.subscription.passInvest) return 'Private Club & Quant Invest';
  if (customerData.subscription.actInvest) return 'Private Club';
  return 'Quant Invest';
};

export const getCommissionRate = (affiliateSettings: any, isClient: boolean, boosted: boolean) => {
  if (boosted) return affiliateSettings.commissionFeeForClientsBoosted;
  else return affiliateSettings.commissionFeeForClients;
};

export const getAffiliationData = (customerData: User, commissionPaymentDate: Date): IAffiliationTableRowDataType => {
  const totalPaid = totalPaidFromUser(customerData);
  return {
    referralName: customerData.firstName,
    offerSubscribed: (customerData.subscription.actInvest ? 'Private Club & ' : '') + (customerData.subscription.passInvest ? 'Quant Invest' : ''),
    amountPaid: totalPaidFromUser(customerData),
    commissionRate: 15,
    commissionAmout: totalPaid * 0.15,
    commissionPaymentDate: commissionPaymentDate,
    commissionPaid: 'NO',
    txID: '#',
  };
};

export const checkSubscriptionAndSendDM = async () => {
  const users = await UserModel.find();
  const passiveUsers = [];

  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    if (user.stripeCustomerId != '') {
      if (user.social.discord.id != '') {
        const status = await stripe.checkSubscriptionStatus(user.stripeCustomerId);
        console.log('status ==> ', status);
        const activeSubscriptionEndDate: Date | null = status.activeSubscriptionEndDate;
        const now = new Date();

        let activeInvestDiffDay = -1000;
        if (activeSubscriptionEndDate != null) {
          activeInvestDiffDay = getDiffDays(now, activeSubscriptionEndDate);
        }

        let message = '';
        if (activeInvestDiffDay != -1000 && Math.abs(activeInvestDiffDay) < 15) {
          message += 'Check Active Invest subscription status';
        }
        if (message != '') await sendDMMessage(user.social.discord.id, message);

        if (activeInvestDiffDay != -1000 && activeInvestDiffDay < -15) removeMemberRoleIdToUser(user.social.discord.id);
      }
    }
  }
};

const test = async () => {
  // const API = new KucoinService();
  // await API.initialize('65fad9be8f1f250001f5aba0', '9c78479f-ee8a-4a8b-b7da-f0b689b3fd63', 'CxP6hfAoiQtQb6TNFEyMmvYSwBAUzHAH');
  // await API.test();
  // const users = await UserModel.find();
  // for (let idx = 0; idx < users.length; idx++) {
  //   const user = users[idx];
  //   console.log('bought Status', user.strategy.buying.BTC[keys[1]]);
  //   user.strategy.buying.BTC[keys[0]] = true;
  //   await user.save();
  // }
  // await updateHistories();
  // await avaxSellingOrders(3);
  // await avaxBuyingOrders(3);
  // await saveEvolution(new Date());
  // await updateDepositsAndWithdrawals();
  // await checkSubscriptionAndSendDM();
};

setTimeout(() => {
  test();
}, 3000);

const getPassiveUsers = async () => {
  const users = await UserModel.find();
  const passiveUsers = [];

  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    if (user.stripeCustomerId != '') {
      // const status = await stripe.checkSubscriptionStatus(user.stripeCustomerId);
      // if (status.passiveStatus) passiveUsers.push(user);
      passiveUsers.push(user);
    }
  }
  return passiveUsers;
};

// step: 1, first price, 2, second price, 3, third price
export const btcBuyingOrders = async (step: number) => {
  const users = await getPassiveUsers();
  const pro = 0.55 * ratios[step - 1];
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    const btcStatus = user.strategy.buying.BTC;
    const boughtStatus = btcStatus[keys[step - 1]];

    if (boughtStatus == false) {
      let API = null;
      if (user.bcConnectType == 'kucoin') {
        API = new KucoinService();
        await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
      } else if (user.bcConnectType == 'binance') {
        API = new BinanceService();
        await API.initialize(user.binance.key, user.binance.secret);
      }

      if (API != null) {
        const status = await API.placeBTCBuyingOrder(user.subscription.investAmount * pro, user._id, step);
        if (status) {
          user.strategy.buying.BTC[keys[step - 1]] = true;
          await user.save();
        }
      }
    }
  }
};

// step: 1, first price, 2, second price, 3, third price
export const ethBuyingOrders = async (step: number) => {
  const users = await getPassiveUsers();
  const pro = 0.35 * ratios[step - 1];
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    const ethStatus = user.strategy.buying.ETH;
    const boughtStatus = ethStatus[keys[step - 1]];

    if (boughtStatus == false) {
      let API = null;
      if (user.bcConnectType == 'kucoin') {
        API = new KucoinService();
        await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
      } else if (user.bcConnectType == 'binance') {
        API = new BinanceService();
        await API.initialize(user.binance.key, user.binance.secret);
      }

      if (API != null) {
        const status = await API.placeETHBuyingOrder(user.subscription.investAmount * pro, user._id, step);
        if (status) {
          user.strategy.buying.ETH[keys[step - 1]] = true;
          await user.save();
        }
      }
    }
  }
};

// step: 1, first price, 2, second price, 3, third price
export const avaxBuyingOrders = async (step: number) => {
  const users = await getPassiveUsers();
  const pro = 0.05 * ratios[step - 1];
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    const avaxStatus = user.strategy.buying.AVAX;
    const boughtStatus = avaxStatus[keys[step - 1]];

    if (boughtStatus == false) {
      let API = null;
      if (user.bcConnectType == 'kucoin') {
        API = new KucoinService();
        await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
      } else if (user.bcConnectType == 'binance') {
        API = new BinanceService();
        await API.initialize(user.binance.key, user.binance.secret);
      }

      if (API != null) {
        const status = await API.placeAVAXBuyingOrder(user.subscription.investAmount * pro, user._id, step);
        if (status) {
          user.strategy.buying.AVAX[keys[step - 1]] = true;
          await user.save();
        }
      }
    }
  }
};

// step: 1, first price, 2, second price, 3, third price
export const solBuyingOrders = async (step: number) => {
  const users = await getPassiveUsers();
  const pro = 0.05 * ratios[step - 1];
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];
    const solStatus = user.strategy.buying.SOL;
    const boughtStatus = solStatus[keys[step - 1]];

    if (boughtStatus == false) {
      let API = null;
      if (user.bcConnectType == 'kucoin') {
        API = new KucoinService();
        await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
      } else if (user.bcConnectType == 'binance') {
        API = new BinanceService();
        await API.initialize(user.binance.key, user.binance.secret);
      }
      if (API != null) {
        const status = await API.placeSOLBuyingOrder(user.subscription.investAmount * pro, user._id, step);
        if (status) {
          user.strategy.buying.SOL[keys[step - 1]] = true;
          await user.save();
        }
      }
    }
  }
};

// step: 1, first price, 2, second price, 3, third price
export const btcSellingOrders = async (step: number) => {
  const users = await getPassiveUsers();
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    const btcStatus = user.strategy.buying.BTC;
    const boughtStatus = btcStatus[keys[step - 1]];

    if (boughtStatus) {
      let API = null;
      if (user.bcConnectType == 'kucoin') {
        API = new KucoinService();
        await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
      } else if (user.bcConnectType == 'binance') {
        API = new BinanceService();
        await API.initialize(user.binance.key, user.binance.secret);
      }

      if (API != null) {
        const status = await API.placeBTCSellingOrder(user._id, step);
        if (status) {
          user.strategy.buying.BTC[keys[step - 1]] = false;
          await user.save();
        }
      }
    }
  }
};

// step: 1, first price, 2, second price, 3, third price
export const ethSellingOrders = async (step: number) => {
  const users = await getPassiveUsers();
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    const ethStatus = user.strategy.buying.ETH;
    const boughtStatus = ethStatus[keys[step - 1]];

    if (boughtStatus) {
      let API = null;
      if (user.bcConnectType == 'kucoin') {
        API = new KucoinService();
        await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
      } else if (user.bcConnectType == 'binance') {
        API = new BinanceService();
        await API.initialize(user.binance.key, user.binance.secret);
      }

      if (API != null) {
        const status = await API.placeETHSellingOrder(user._id, step);
        if (status) {
          user.strategy.buying.ETH[keys[step - 1]] = false;
          await user.save();
        }
      }
    }
  }
};

// step: 1, first price, 2, second price, 3, third price
export const avaxSellingOrders = async (step: number) => {
  const users = await getPassiveUsers();
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];
    const avaxStatus = user.strategy.buying.AVAX;
    const boughtStatus = avaxStatus[keys[step - 1]];

    if (boughtStatus) {
      let API = null;
      if (user.bcConnectType == 'kucoin') {
        API = new KucoinService();
        await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
      } else if (user.bcConnectType == 'binance') {
        API = new BinanceService();
        await API.initialize(user.binance.key, user.binance.secret);
      }

      if (API != null) {
        const status = await API.placeAVAXSellingOrder(user._id, step);

        if (status) {
          user.strategy.buying.AVAX[keys[step - 1]] = false;
          await user.save();
        }
      }
    }
  }
};

// step: 1, first price, 2, second price, 3, third price
export const solSellingOrders = async (step: number) => {
  const users = await getPassiveUsers();
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];

    const solStatus = user.strategy.buying.SOL;
    const boughtStatus = solStatus[keys[step - 1]];

    if (boughtStatus) {
      let API = null;
      if (user.bcConnectType == 'kucoin') {
        API = new KucoinService();
        await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
      } else if (user.bcConnectType == 'binance') {
        API = new BinanceService();
        await API.initialize(user.binance.key, user.binance.secret);
      }

      if (API != null) {
        const status = await API.placeSOLSellingOrder(user._id, step);
        if (status) {
          user.strategy.buying.SOL[keys[step - 1]] = false;
          await user.save();
        }
      }
    }
  }
};

export const updateDepositsAndWithdrawalsForOneUser = async (user: User) => {
  let API = null;
  try {
    if (user.bcConnectType == 'kucoin') {
      API = new KucoinService();
      await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
    } else if (user.bcConnectType == 'binance') {
      API = new BinanceService();
      await API.initialize(user.binance.key, user.binance.secret);
    }

    if (API != null) {
      await DepositAndWithdrawalModel.deleteMany({
        userId: user._id,
      });
      const deposits = await API.getDepositHistories();

      const depositModels = deposits.map((item: any) => ({
        userId: user._id,
        orderId: item.info.walletTxId,
        datetime: item.datetime,
        amount: item.amount,
        chain: item.info.chain,
        network: item.network,
        type: item.type,
        exchange: user.bcConnectType,
      }));

      await DepositAndWithdrawalModel.insertMany(depositModels);

      const withdrawals = await API.getWithdrawalHistories();

      const withdrawalModels = withdrawals.map((item: any) => ({
        userId: user._id,
        orderId: item.info.walletTxId,
        datetime: item.datetime,
        amount: item.amount,
        chain: item.info.chain,
        network: item.network,
        type: item.type,
        exchange: user.bcConnectType,
      }));

      await DepositAndWithdrawalModel.insertMany(withdrawalModels);
    }
  } catch (error) {}
};

export const updateDepositsAndWithdrawals = async () => {
  const users = await getPassiveUsers();

  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];
    await updateDepositsAndWithdrawalsForOneUser(user);
  }
};

export const updateHistoriesForOneUser = async (user: User) => {
  let API = null;
  try {
    if (user.bcConnectType == 'kucoin') {
      API = new KucoinService();
      await API.initialize(user.kucoin.key, user.kucoin.secret, user.kucoin.passphrase);
    } else if (user.bcConnectType == 'binance') {
      API = new BinanceService();
      await API.initialize(user.binance.key, user.binance.secret);
    }

    if (API != null) {
      try {
        const balance = await API.fetchBalance();
        const price = getValue();

        // const openOrders = await API.fetchOpenOrders();
        // const ordersHistory = await API.fetchOrderHistory();
        const openOrders = {};
        const ordersHistory = {};

        const historyModel = await HistoryModel.findOne({ userId: user._id });
        if (historyModel) {
          historyModel.balance = balance;
          historyModel.price = price;
          historyModel.openOrders = openOrders;
          historyModel.ordersHistory = ordersHistory;
          await historyModel.save();
        } else {
          const newHistoryModel = new HistoryModel({
            userId: user._id,
            balance: balance,
            price: price,
            openOrders: openOrders,
            ordersHistory: ordersHistory,
          });
          await newHistoryModel.save();
        }
      } catch (error) {
        console.log('error ==> ', error);
      }
    }
  } catch (error) {}
};

export const updateHistories = async () => {
  const users = await getPassiveUsers();

  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];
    await updateHistoriesForOneUser(user);
  }
};
