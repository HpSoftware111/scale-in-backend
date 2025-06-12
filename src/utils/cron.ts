import cron from 'node-cron';
// import { getMvrvZscore, getValue } from './price';
import { AdminPriceModel } from '@/models/admin/price.model';
import { checkSubscriptionAndSendDM, saveEvolution, updateDepositsAndWithdrawals } from './users';

export const cronInitialize = () => {
  cron.schedule(
    '0 0 * * *',
    async () => {
      try {
        // const price = getValue();
        // const date = new Date();

        const mvrvZscore = getMvrvZscore();

        // await AdminPriceModel.insertMany([
        //   {
        //     snapped_at: date,
        //     type: 'BTC',
        //     price: price.BTC,
        //   },
        //   {
        //     snapped_at: date,
        //     type: 'ETH',
        //     price: price.ETH,
        //   },
        //   {
        //     snapped_at: date,
        //     type: 'AVAX',
        //     price: price.AVAX,
        //   },
        //   {
        //     snapped_at: date,
        //     type: 'SOL',
        //     price: price.SOL,
        //   },
        //   {
        //     snapped_at: date,
        //     type: 'MVRVZscore',
        //     price: mvrvZscore,
        //   },
        // ]);

        // await saveEvolution(date);
        // await updateDepositsAndWithdrawals();
        // await checkSubscriptionAndSendDM();
      } catch (error) {}
    },
    {
      scheduled: true,
      timezone: 'Etc/UTC',
    },
  );
};
