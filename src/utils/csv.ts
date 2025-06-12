import fs from 'fs';
import csv from 'csv-parser';
import { AdminPriceModel } from '@/models/admin/price.model';

export const parseCsv = () => {
  const results = [];

  try {
    fs.createReadStream('src/raw/btc-usd-max.csv')
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => {
        AdminPriceModel.insertMany(results)
          .then(docs => {
            console.log('Documents inserted successfully');
          })
          .catch(e => console.log(e));
      });
  } catch (error) {
    console.log('error ==> ', error);
  }

  try {
    fs.createReadStream('src/raw/eth-usd-max.csv')
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => {
        AdminPriceModel.insertMany(results)
          .then(docs => {
            console.log('Documents inserted successfully');
          })
          .catch(e => console.log(e));
      });
  } catch (error) {
    console.log('error ==> ', error);
  }

  try {
    fs.createReadStream('src/raw/avax-usd-max.csv')
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => {
        AdminPriceModel.insertMany(results)
          .then(docs => {
            console.log('Documents inserted successfully');
          })
          .catch(e => console.log(e));
      });
  } catch (error) {
    console.log('error ==> ', error);
  }

  try {
    fs.createReadStream('src/raw/sol-usd-max.csv')
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => {
        AdminPriceModel.insertMany(results)
          .then(docs => {
            console.log('Documents inserted successfully');
          })
          .catch(e => console.log(e));
      });
  } catch (error) {
    console.log('error ==> ', error);
  }
};
