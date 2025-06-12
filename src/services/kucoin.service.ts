import { Service } from 'typedi';

import { kucoin } from 'ccxt';
import { verbose } from 'winston';
import { OrderModel } from '@/models/orders.model';
import { DepositAndWithdrawalModel } from '@/models/deposits_and_withdrawals.model';

@Service()
export class KucoinService {
  public API: kucoin;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public async initialize(key: string, secret: string, passphrase: string) {
    try {
      this.API = new kucoin({
        apiKey: key,
        secret: secret,
        password: passphrase,
        enableRateLimit: true,
        verbose: false,
      });

      await this.API.loadMarkets();
    } catch (error) {
      console.log('error ==> ', error);
    }
  }

  public async test() {
    // const deposits = await this.getDepositHistories();
    // const filteredDeposits = deposits.filter(item => item.info.currency == 'USDT' && item.info.status == 'SUCCESS');
    // const withdrawals = await this.getWithdrawalHistories();
    // const filtered = withdrawals.filter(item => item.info.currency == 'USDT' && item.info.status == 'SUCCESS');
    // console.log('filtered ==> ', filtered);
    // await this.placeAVAXSellingOrder(1);
    // await this.placeSOLSellingOrder(1);
    // await this.placeBTCSellingOrder();
    // await this.placeETHSellingOrder();
    // await this.placeAVAXBuyingOrder(5);
    // await this.cancelAVAXOrder();
    // await this.placeSOLBuyingOrder(5);
  }

  public async getDepositHistories() {
    const deposits = await this.API.fetchDeposits();
    const filteredDeposits = deposits.filter(item => item.info.currency == 'USDT' && item.info.status == 'SUCCESS');
    return filteredDeposits;
  }

  public async getWithdrawalHistories() {
    const withdrawals = await this.API.fetchWithdrawals();
    const filteredWithdrawals = withdrawals.filter(item => item.info.currency == 'USDT' && item.info.status == 'SUCCESS');
    return filteredWithdrawals;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async getTimestamp(): Promise<void> {}

  public async getAccountSummaryInfoResult(): Promise<void> {
    // const getAccountSummaryInfoResult = await this.API.rest.User.Account.getAccountSummaryInfo();
    // console.log(getAccountSummaryInfoResult, 'getAccountSummaryInfoResult---');
  }

  public async fetchBalance() {
    const balance = await this.API.fetchBalance();
    return balance;
  }

  public async fetchOpenOrders() {
    const openOrders = await this.API.fetchOpenOrders();

    return openOrders;
  }

  public async fetchOrderHistory() {
    const allOrders = await this.API.fetchClosedOrders();
    return allOrders;
  }

  public async placeAVAXBuyingOrder(amountToInvest: number, userId: string, step: number) {
    try {
      const symbol = 'AVAX/USDT'; // Assuming AVAX is traded against USDT
      await this.API.loadMarkets();
      const avaxPrice = await this.API.fetchTicker(symbol);
      const quantity = amountToInvest / avaxPrice['last'];

      const formattedAmount = this.API.amountToPrecision(symbol, quantity);

      const order = await this.API.createOrder(symbol, 'market', 'buy', formattedAmount);

      const orderModel = new OrderModel({
        userId: userId,
        orderId: order.id ?? 'order',
        uniqueId: 6 + step,
        cexType: 'kucoin',
        bitcoinType: symbol,
        buyPrice: avaxPrice['last'],
        sellPrice: 0,
        amount: formattedAmount,
        status: 'buy',
      });
      await orderModel.save();
      console.log('kucoin avax order model successfully saved');
      return true;
    } catch (error) {
      console.log('kucoin error ==> ', error);
      return false;
    }
  }

  public async cancelAVAXOrder() {
    try {
      const status = await this.API.cancelOrder('6625db4b7dd9a00007efbcba', 'AVAX/USDT');
      console.log('cancel status ==> ', status);
    } catch (error) {
      console.log('error ==> ', error);
    }
  }

  public async placeAVAXSellingOrder(userId: string, step: number) {
    try {
      const symbol = 'AVAX/USDT'; // Assuming AVAX is traded against USDT
      await this.API.loadMarkets();
      const avaxPrice = await this.API.fetchTicker(symbol);

      const orders = await OrderModel.find({
        cexType: 'kucoin',
        bitcoinType: symbol,
        uniqueId: 6 + step,
        status: 'buy',
      }).sort({ date: -1 });

      if (orders.length > 0) {
        const avaxBalance = await this.API.fetchBalance();
        const avaxAvailable = avaxBalance['AVAX']['free'];

        const latestOrder = orders[0];
        const sellAmount = Math.min(avaxAvailable, latestOrder.amount);

        if (sellAmount > 0) {
          const order = await this.API.createOrder(symbol, 'market', 'sell', sellAmount);
          const pl = sellAmount * (avaxPrice['last'] - latestOrder.buyPrice);

          const orderModel = new OrderModel({
            userId: userId,
            orderId: order.id ?? 'order',
            uniqueId: 6 + step,
            cexType: 'kucoin',
            bitcoinType: symbol,
            buyPrice: 0,
            sellPrice: avaxPrice['last'],
            amount: sellAmount,
            status: 'sell',
            pl: pl,
          });

          await orderModel.save();
          console.log('Kucoin Sell order placed successfully:');
        } else {
          console.log('No BTC available to sell.');
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  public async placeSOLBuyingOrder(amountToInvest: number, userId: string, step: number) {
    try {
      const symbol = 'SOL/USDT';
      await this.API.loadMarkets();
      const solPrice = await this.API.fetchTicker(symbol);
      const quantity = amountToInvest / solPrice['last'];

      const formattedAmount = this.API.amountToPrecision(symbol, quantity);

      const order = await this.API.createOrder(symbol, 'market', 'buy', formattedAmount);

      const orderModel = new OrderModel({
        userId: userId,
        orderId: order.id ?? 'order',
        uniqueId: 9 + step,
        cexType: 'kucoin',
        bitcoinType: symbol,
        buyPrice: solPrice['last'],
        sellPrice: 0,
        amount: formattedAmount,
        status: 'buy',
      });
      await orderModel.save();

      return true;
    } catch (error) {
      return false;
    }
  }

  public async placeSOLSellingOrder(userId: string, step: number) {
    try {
      const symbol = 'SOL/USDT'; // Assuming SOL is traded against USDT
      await this.API.loadMarkets();
      const solPrice = await this.API.fetchTicker(symbol);

      const orders = await OrderModel.find({
        cexType: 'kucoin',
        bitcoinType: symbol,
        uniqueId: 9 + step,
        status: 'buy',
      }).sort({ date: -1 });

      if (orders.length > 0) {
        const solBalance = await this.API.fetchBalance();
        const solAvailable = solBalance['SOL']['free'];

        const latestOrder = orders[0];
        const sellAmount = Math.min(solAvailable, latestOrder.amount);

        if (sellAmount > 0) {
          const order = await this.API.createOrder(symbol, 'market', 'sell', sellAmount);
          const pl = sellAmount * (solPrice['last'] - latestOrder.buyPrice);

          const orderModel = new OrderModel({
            userId: userId,
            orderId: order.id ?? 'order',
            uniqueId: 9 + step,
            cexType: 'kucoin',
            bitcoinType: symbol,
            buyPrice: 0,
            sellPrice: solPrice['last'],
            amount: sellAmount,
            status: 'sell',
            pl: pl,
          });

          await orderModel.save();
          console.log('Kucoin Sell order placed successfully:', order);
        } else {
          console.log('No BTC available to sell.');
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  public async placeBTCBuyingOrder(amountToInvest: number, userId: string, step: number) {
    try {
      const symbol = 'BTC/USDT';
      await this.API.loadMarkets();
      const btcPrice = await this.API.fetchTicker(symbol);
      const quantity = amountToInvest / btcPrice['last'];

      const formattedAmount = this.API.amountToPrecision(symbol, quantity);

      const order = await this.API.createOrder(symbol, 'market', 'buy', formattedAmount);

      const orderModel = new OrderModel({
        userId: userId,
        orderId: order.id ?? 'order',
        uniqueId: step,
        cexType: 'kucoin',
        bitcoinType: symbol,
        buyPrice: btcPrice['last'],
        sellPrice: 0,
        amount: formattedAmount,
        status: 'buy',
      });
      await orderModel.save();

      return true;
    } catch (error) {
      console.log('placing order error ==>');
      return false;
    }
  }

  public async placeBTCSellingOrder(userId: string, step: number) {
    try {
      const symbol = 'BTC/USDT'; // Assuming BTC is traded against USDT
      await this.API.loadMarkets();
      const btcPrice = await this.API.fetchTicker(symbol);

      const orders = await OrderModel.find({
        cexType: 'kucoin',
        bitcoinType: symbol,
        uniqueId: step,
        status: 'buy',
      }).sort({ date: -1 });

      if (orders.length > 0) {
        const btcBalance = await this.API.fetchBalance();
        const btcAvailable = btcBalance['BTC']['free'];

        const latestOrder = orders[0];
        const sellAmount = Math.min(btcAvailable, latestOrder.amount);

        if (sellAmount > 0) {
          const order = await this.API.createOrder(symbol, 'market', 'sell', sellAmount);
          const pl = sellAmount * (btcPrice['last'] - latestOrder.buyPrice);

          const orderModel = new OrderModel({
            userId: userId,
            orderId: order.id ?? 'order',
            uniqueId: step,
            cexType: 'kucoin',
            bitcoinType: symbol,
            buyPrice: 0,
            sellPrice: btcPrice['last'],
            amount: sellAmount,
            status: 'sell',
            pl: pl,
          });

          await orderModel.save();
          console.log('Sell order placed successfully:', order);
        } else {
          console.log('No BTC available to sell.');
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  public async placeETHBuyingOrder(amountToInvest: number, userId: string, step: number) {
    try {
      const symbol = 'ETH/USDT';
      await this.API.loadMarkets();
      const ethPrice = await this.API.fetchTicker(symbol);
      const quantity = amountToInvest / ethPrice['last'];

      const formattedAmount = this.API.amountToPrecision(symbol, quantity);

      const order = await this.API.createOrder(symbol, 'market', 'buy', formattedAmount);

      const orderModel = new OrderModel({
        userId: userId,
        orderId: order.id ?? 'order',
        uniqueId: 3 + step,
        cexType: 'kucoin',
        bitcoinType: symbol,
        buyPrice: ethPrice['last'],
        sellPrice: 0,
        amount: formattedAmount,
        status: 'buy',
      });
      await orderModel.save();

      return true;
    } catch (error) {
      return false;
    }
  }

  public async placeETHSellingOrder(userId: string, step: number) {
    try {
      const symbol = 'ETH/USDT'; // Assuming ETH is traded against USDT
      await this.API.loadMarkets();
      const ethPrice = await this.API.fetchTicker(symbol);

      const orders = await OrderModel.find({
        cexType: 'kucoin',
        bitcoinType: symbol,
        uniqueId: 3 + step,
        status: 'buy',
      }).sort({ date: -1 });

      if (orders.length > 0) {
        const ethBalance = await this.API.fetchBalance();
        const ethAvailable = ethBalance['ETH']['free'];

        const latestOrder = orders[0];
        const sellAmount = Math.min(ethAvailable, latestOrder.amount);

        if (sellAmount > 0) {
          const order = await this.API.createOrder(symbol, 'market', 'sell', sellAmount);
          const pl = sellAmount * (ethPrice['last'] - latestOrder.buyPrice);

          const orderModel = new OrderModel({
            userId: userId,
            orderId: order.id ?? 'order',
            uniqueId: 3 + step,
            cexType: 'kucoin',
            bitcoinType: symbol,
            buyPrice: 0,
            sellPrice: ethPrice['last'],
            amount: sellAmount,
            status: 'sell',
            pl: pl,
          });

          await orderModel.save();
          console.log('Sell order placed successfully:', order);
        } else {
          console.log('No BTC available to sell.');
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
