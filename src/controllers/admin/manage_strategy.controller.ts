import { AdminManageStrategyModel } from '@/models/admin/manage_strategy.model';
import { AdminPriceModel } from '@/models/admin/price.model';
import { getMvrvZscore, setMvrvZscore } from '@/utils/price';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

export class AdminManageStrategyController {
  public getStrategy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buyingStrategy = await AdminManageStrategyModel.find({ type: 'buying' });
      const sellingStrategy = await AdminManageStrategyModel.find({ type: 'selling' });

      res.status(200).json({
        data: {
          buying: buyingStrategy ? buyingStrategy[0] : {},
          selling: sellingStrategy ? sellingStrategy[0] : {},
        },
        message: 'findAll',
      });
    } catch (error) {
      next(error);
    }
  };

  public saveStrategy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('req.body ==> ', req.body);
      const buyingStrategy = await AdminManageStrategyModel.findOne({ type: 'buying' });
      if (buyingStrategy) {
        buyingStrategy.BTC = req.body.buying.BTC;
        buyingStrategy.ETH = req.body.buying.ETH;
        buyingStrategy.AVAX = req.body.buying.AVAX;
        buyingStrategy.SOL = req.body.buying.SOL;
        await buyingStrategy.save();
      } else {
        const newStrategy = new AdminManageStrategyModel({
          type: 'buying',
          BTC: req.body.buying.BTC,
          ETH: req.body.buying.ETH,
          AVAX: req.body.buying.AVAX,
          SOL: req.body.buying.SOL,
        });
        await newStrategy.save();
      }

      const sellingStrategy = await AdminManageStrategyModel.findOne({ type: 'selling' });
      if (sellingStrategy) {
        sellingStrategy.BTC = req.body.selling.BTC;
        sellingStrategy.ETH = req.body.selling.ETH;
        sellingStrategy.AVAX = req.body.selling.AVAX;
        sellingStrategy.SOL = req.body.selling.SOL;
        await sellingStrategy.save();
      } else {
        const newStrategy = new AdminManageStrategyModel({
          type: 'selling',
          BTC: req.body.selling.BTC,
          ETH: req.body.selling.ETH,
          AVAX: req.body.selling.AVAX,
          SOL: req.body.selling.SOL,
        });
        await newStrategy.save();
      }

      res.status(200).json({ message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getMvrvzscore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        data: {
          current_mvrvzscore: getMvrvZscore(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public setMvrvzscore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value } = req.body;
      setMvrvZscore(value, true);
      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public syncMvrvzscore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await axios.get('https://bitcoinition.com/current.json');
      const price_data = response.data.data;

      const mvrvZscore = price_data.current_mvrvzscore;

      setMvrvZscore(mvrvZscore, false);
      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public getHighLowPrices = async (req: any, res: Response, next: NextFunction) => {
    try {
      const today: Date = new Date();

      const priorDate = new Date(new Date().setDate(today.getDate() - 90));

      const prices = await AdminPriceModel.find({
        snapped_at: {
          $gte: priorDate.setHours(0, 0, 0),
        },
      });

      const btcPrices = prices.filter(item => item.type == 'BTC').map(item => item.price);
      const ethPrices = prices.filter(item => item.type == 'ETH').map(item => item.price);
      const avaxPrices = prices.filter(item => item.type == 'AVAX').map(item => item.price);
      const solPrices = prices.filter(item => item.type == 'SOL').map(item => item.price);

      res.status(200).json({
        high: {
          BTC: Math.max(...btcPrices),
          ETH: Math.max(...ethPrices),
          AVAX: Math.max(...avaxPrices),
          SOL: Math.max(...solPrices),
        },
        low: {
          BTC: Math.min(...btcPrices),
          ETH: Math.min(...ethPrices),
          AVAX: Math.min(...avaxPrices),
          SOL: Math.min(...solPrices),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
