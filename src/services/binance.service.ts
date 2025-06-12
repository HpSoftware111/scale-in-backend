import { Service } from 'typedi';

import { binance } from 'ccxt';
import { verbose } from 'winston';
import { OrderModel } from '@/models/orders.model';

@Service()
export class BinanceService {
  public API: binance;

  constructor() {}

  public async initialize(key: string, secret: string) {
    try {
      this.API = new binance({
        apiKey: key,
        secret: secret,
        verbose: false,
      });

      await this.API.loadMarkets();
    } catch (error) {
      console.log('error ==> ', error);
    }
  }

  public async test() {
    // await this.placeBTCSellingOrder();
    // await this.placeETHSellingOrder();
    // await this.placeAVAXBuyingOrder(5);
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
    // const openOrders = await this.API.fetchOpenOrders();

    return {};
  }

  public async fetchOrderHistory() {
    // const allOrders = await this.API.fetchClosedOrders();
    return {};
  }

  public async placeAVAXBuyingOrder(amountToInvest: number, userId: string, step: number) {
    try {
      const symbol = 'AVAX/USDT'; // Assuming AVAX is traded against USDT
      await this.API.loadMarkets();
      const avaxPrice = await this.API.fetchTicker(symbol);
      const quantity = amountToInvest / avaxPrice['last'];

      // console.log('amountToInvest ==> ', amountToInvest);
      // console.log('avaxPrice ==> ', avaxPrice);
      // console.log('balance ==> ', balance);

      const formattedAmount = this.API.amountToPrecision(symbol, quantity);

      const order = await this.API.createOrder(symbol, 'market', 'buy', formattedAmount, avaxPrice['last'], {});

      const orderModel = new OrderModel({
        userId: userId,
        orderId: order.id ?? 'order',
        uniqueId: 6 + step,
        cexType: 'binance',
        bitcoinType: symbol,
        buyPrice: avaxPrice['last'],
        sellPrice: 0,
        amount: formattedAmount,
        status: 'buy',
      });
      await orderModel.save();

      console.log('binance order model successfully saved');

      return true;
    } catch (error) {
      console.log('binace error ==> ', JSON.stringify(error), error);
      return false;
    }
  }

  public async placeAVAXSellingOrder(userId: string, step: number) {
    try {
      const symbol = 'AVAX/USDT'; // Assuming AVAX is traded against USDT
      await this.API.loadMarkets();
      const avaxPrice = await this.API.fetchTicker(symbol);

      const orders = await OrderModel.find({
        cexType: 'binance',
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
            cexType: 'binance',
            bitcoinType: symbol,
            buyPrice: 0,
            sellPrice: avaxPrice['last'],
            amount: sellAmount,
            status: 'sell',
            pl: pl,
          });

          await orderModel.save();
          console.log('Binance Sell order placed successfully:');
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
        cexType: 'binance',
        bitcoinType: 'SOL/USDT',
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
        cexType: 'binance',
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
            cexType: 'binance',
            bitcoinType: symbol,
            buyPrice: 0,
            sellPrice: solPrice['last'],
            amount: sellAmount,
            status: 'sell',
            pl: pl,
          });

          await orderModel.save();
          console.log('Binance Sell order placed successfully:', order);
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
        cexType: 'binance',
        bitcoinType: 'BTC/USDT',
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
        cexType: 'binance',
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
            cexType: 'binance',
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
        uniqueId: step,
        cexType: 'binance',
        bitcoinType: 'ETH/USDT',
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
        cexType: 'binance',
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
            cexType: 'binance',
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
