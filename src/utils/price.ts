// import { getPythClusterApiUrl, getPythProgramKeyForCluster, PythCluster, PriceStatus, PythConnection, PythHttpClient } from '@pythnetwork/client';
// import { Connection } from '@solana/web3.js';
// import axios from 'axios';
// import fs from 'fs';
// import { getIO } from './socket';
// import { StrategyPriceModel } from '@/models/strategy_price.model';
// import {
//   avaxBuyingOrders,
//   avaxSellingOrders,
//   btcBuyingOrders,
//   btcSellingOrders,
//   ethBuyingOrders,
//   ethSellingOrders,
//   solBuyingOrders,
//   solSellingOrders,
//   updateHistories,
// } from './users';

// const PYTHNET_CLUSTER_NAME: PythCluster = 'pythnet';
// const connection = new Connection(getPythClusterApiUrl(PYTHNET_CLUSTER_NAME));
// const pythPublicKey = getPythProgramKeyForCluster(PYTHNET_CLUSTER_NAME);

// let isLoading = true;
// let isRunning = false;

// let mvrvZscore = 2.5;
// let manualMvrvZscore = 2.5;
// let setManualMvrvZscoreEnabled = false;
// let highestBTCPrice = -1000;
// let highestETHPrice = -1000;
// let highestAVAXPrice = -1000;
// let highestSOLPrice = -1000;

// let btcPrice = -1000;
// let ethPrice = -1000;
// let avaxPrice = -1000;
// let solPrice = -1000;

// let btcStaticBuyingPrice = -1000;
// let ethStaticBuyingPrice = -1000;
// let avaxStaticBuyingPrice = -1000;
// let solStaticBuyingPrice = -1000;

// let btcStaticSellingPrice = -1000;
// let ethStaticSellingPrice = -1000;
// let avaxStaticSellingPrice = -1000;
// let solStaticSellingPrice = -1000;

// let btcFirstPriceBoughtStatus = false;
// let btcSecondPriceBoughtStatus = false;
// let btcThirdPriceBoughtStatus = false;

// let ethFirstPriceBoughtStatus = false;
// let ethSecondPriceBoughtStatus = false;
// let ethThirdPriceBoughtStatus = false;

// let avaxFirstPriceBoughtStatus = false;
// let avaxSecondPriceBoughtStatus = false;
// let avaxThirdPriceBoughtStatus = false;

// let solFirstPriceBoughtStatus = false;
// let solSecondPriceBoughtStatus = false;
// let solThirdPriceBoughtStatus = false;

// let lowTrend = false;
// let highTrend = false;

// let updatedBuyingDate = '';
// let updatedSellingDate = '';

// const saveData = async () => {
//   const data = {
//     mvrvZscore,
//     setManualMvrvZscoreEnabled,

//     btcStaticBuyingPrice,
//     ethStaticBuyingPrice,
//     avaxStaticBuyingPrice,
//     solStaticBuyingPrice,

//     btcStaticSellingPrice,
//     ethStaticSellingPrice,
//     avaxStaticSellingPrice,
//     solStaticSellingPrice,

//     btcFirstPriceBoughtStatus,
//     btcSecondPriceBoughtStatus,
//     btcThirdPriceBoughtStatus,

//     ethFirstPriceBoughtStatus,
//     ethSecondPriceBoughtStatus,
//     ethThirdPriceBoughtStatus,

//     avaxFirstPriceBoughtStatus,
//     avaxSecondPriceBoughtStatus,
//     avaxThirdPriceBoughtStatus,

//     solFirstPriceBoughtStatus,
//     solSecondPriceBoughtStatus,
//     solThirdPriceBoughtStatus,

//     lowTrend,
//     highTrend,

//     updatedBuyingDate,
//     updatedSellingDate,
//   };

//   fs.writeFileSync('db.json', JSON.stringify(data), 'utf-8');
// };
// const loadData = async () => {
//   const data = fs.readFileSync('db.json', 'utf-8');
//   const jsonData = JSON.parse(data);

//   mvrvZscore = jsonData.mvrvZscore;
//   manualMvrvZscore = mvrvZscore;

//   setManualMvrvZscoreEnabled = jsonData.setManualMvrvZscoreEnabled ?? false;

//   btcStaticBuyingPrice = jsonData.btcStaticBuyingPrice;
//   ethStaticBuyingPrice = jsonData.ethStaticBuyingPrice;
//   avaxStaticBuyingPrice = jsonData.avaxStaticBuyingPrice;
//   solStaticBuyingPrice = jsonData.solStaticBuyingPrice;

//   btcStaticSellingPrice = jsonData.btcStaticSellingPrice;
//   ethStaticSellingPrice = jsonData.ethStaticSellingPrice;
//   avaxStaticSellingPrice = jsonData.avaxStaticSellingPrice;
//   solStaticSellingPrice = jsonData.solStaticSellingPrice;

//   btcFirstPriceBoughtStatus = jsonData.btcFirstPriceBoughtStatus;
//   btcSecondPriceBoughtStatus = jsonData.btcSecondPriceBoughtStatus;
//   btcThirdPriceBoughtStatus = jsonData.btcThirdPriceBoughtStatus;

//   ethFirstPriceBoughtStatus = jsonData.ethFirstPriceBoughtStatus;
//   ethSecondPriceBoughtStatus = jsonData.ethSecondPriceBoughtStatus;
//   ethThirdPriceBoughtStatus = jsonData.ethThirdPriceBoughtStatus;

//   avaxFirstPriceBoughtStatus = jsonData.avaxFirstPriceBoughtStatus;
//   avaxSecondPriceBoughtStatus = jsonData.avaxSecondPriceBoughtStatus;
//   avaxThirdPriceBoughtStatus = jsonData.avaxThirdPriceBoughtStatus;

//   solFirstPriceBoughtStatus = jsonData.solFirstPriceBoughtStatus;
//   solSecondPriceBoughtStatus = jsonData.solSecondPriceBoughtStatus;
//   solThirdPriceBoughtStatus = jsonData.solThirdPriceBoughtStatus;

//   lowTrend = jsonData.lowTrend;
//   highTrend = jsonData.highTrend;

//   updatedBuyingDate = jsonData.updatedBuyingDate ?? '';
//   updatedSellingDate = jsonData.updatedSellingDate ?? '';

//   isLoading = false;
// };

// const testFunction = () => {
//   isRunning = false;
// };

// // loadData();

// export const getRealTimePriceData = async () => {
//   const pythClient = new PythHttpClient(connection, pythPublicKey);

//   const data = await pythClient.getData();

//   for (const symbol of data.symbols) {
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const price = data.productPrice.get(symbol)!;
//     // Sample output:
//     // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
//     if (price.price && price.confidence) {
//       // tslint:disable-next-line:no-console
//       if (symbol === 'Crypto.BTC/USD') {
//         btcPrice = price.price;
//         if (highestBTCPrice < price.price) highestBTCPrice = price.price;
//       } else if (symbol === 'Crypto.ETH/USD') {
//         ethPrice = price.price;
//         if (highestETHPrice < price.price) highestETHPrice = price.price;
//       } else if (symbol === 'Crypto.AVAX/USD') {
//         avaxPrice = price.price;
//         if (highestAVAXPrice < price.price) highestAVAXPrice = price.price;
//       } else if (symbol === 'Crypto.SOL/USD') {
//         solPrice = price.price;
//         if (highestSOLPrice < price.price) highestSOLPrice = price.price;
//       }
//     } else {
//       // tslint:disable-next-line:no-console
//     }
//   }
// };

// setInterval(async () => {
//   getRealTimePriceData();
// }, 1000);

// export const startConnection = () => {
//   console.log('start connection');
//   const pythConnection = new PythConnection(connection, pythPublicKey);
//   pythConnection.onPriceChangeVerbose((productAccount, priceAccount) => {
//     // The arguments to the callback include solana account information / the update slot if you need it.
//     const product = productAccount.accountInfo.data.product;
//     const price = priceAccount.accountInfo.data;
//     // sample output:
//     // SOL/USD: $14.627930000000001 ±$0.01551797
//     if (price.price && price.confidence) {
//       // tslint:disable-next-line:no-console
//       if (product.symbol === 'Crypto.BTC/USD') {
//         btcPrice = price.price;
//         console.log('real btc price ==> ', btcPrice);
//         if (highestBTCPrice < price.price) highestBTCPrice = price.price;
//       } else if (product.symbol === 'Crypto.ETH/USD') {
//         ethPrice = price.price;
//         if (highestETHPrice < price.price) highestETHPrice = price.price;
//       } else if (product.symbol === 'Crypto.AVAX/USD') {
//         avaxPrice = price.price;
//         if (highestAVAXPrice < price.price) highestAVAXPrice = price.price;
//       } else if (product.symbol === 'Crypto.SOL/USD') {
//         solPrice = price.price;
//         if (highestSOLPrice < price.price) highestSOLPrice = price.price;
//       }
//     } else {
//       // tslint:disable-next-line:no-console
//     }
//   });
//   pythConnection.start();
// };

// export const reInitialize = () => {
//   highestBTCPrice = -1000;
//   highestETHPrice = -1000;
//   highestAVAXPrice = -1000;
//   highestSOLPrice = -1000;
// };

// export const getValue = () => {
//   return {
//     BTC: 0,
//     ETH: 0,
//     AVAX: 0,
//     SOL: 0,
//   };
//   return {
//     BTC: highestBTCPrice,
//     ETH: highestETHPrice,
//     AVAX: highestAVAXPrice,
//     SOL: highestSOLPrice,
//   };
// };

// export const getMvrvZscore = () => {
//   return mvrvZscore;
// };

// const checkBTCStatus = (mvrvZscore: number) => {
//   const firstPrice = (highestBTCPrice * (100 - 55)) / 100;
//   const secondPrice = (highestBTCPrice * (100 - 65)) / 100;
//   const thirdPrice = (highestBTCPrice * (100 - 75)) / 100;

//   const isBuyFirstPrice = btcPrice < firstPrice && mvrvZscore < -0.1;
//   const isBuySecondPrice = btcPrice < secondPrice && mvrvZscore < -0.1;
//   const isBuyThirdPrice = btcPrice < thirdPrice && mvrvZscore < -0.1;

//   return {
//     first: isBuyFirstPrice,
//     second: isBuySecondPrice,
//     third: isBuyThirdPrice,
//   };
// };

// const checkETHStatus = (mvrvZscore: number) => {
//   const firstPrice = (highestETHPrice * (100 - 55)) / 100;
//   const secondPrice = (highestETHPrice * (100 - 65)) / 100;
//   const thirdPrice = (highestETHPrice * (100 - 75)) / 100;

//   const isBuyFirstPrice = ethPrice < firstPrice && mvrvZscore < -0.1;
//   const isBuySecondPrice = ethPrice < secondPrice && mvrvZscore < -0.1;
//   const isBuyThirdPrice = ethPrice < thirdPrice && mvrvZscore < -0.1;

//   return {
//     first: isBuyFirstPrice,
//     second: isBuySecondPrice,
//     third: isBuyThirdPrice,
//   };
// };

// const checkAVAXStatus = (mvrvZscore: number) => {
//   const firstPrice = (highestAVAXPrice * (100 - 65)) / 100;
//   const secondPrice = (highestAVAXPrice * (100 - 75)) / 100;
//   const thirdPrice = (highestAVAXPrice * (100 - 85)) / 100;

//   const isBuyFirstPrice = avaxPrice < firstPrice && mvrvZscore < -0.1;
//   const isBuySecondPrice = avaxPrice < secondPrice && mvrvZscore < -0.1;
//   const isBuyThirdPrice = avaxPrice < thirdPrice && mvrvZscore < -0.1;

//   return {
//     first: isBuyFirstPrice,
//     second: isBuySecondPrice,
//     third: isBuyThirdPrice,
//   };
// };

// const checkSOLStatus = (mvrvZscore: number) => {
//   const firstPrice = (highestSOLPrice * (100 - 65)) / 100;
//   const secondPrice = (highestSOLPrice * (100 - 75)) / 100;
//   const thirdPrice = (highestSOLPrice * (100 - 85)) / 100;

//   const isBuyFirstPrice = solPrice < firstPrice && mvrvZscore < -0.1;
//   const isBuySecondPrice = solPrice < secondPrice && mvrvZscore < -0.1;
//   const isBuyThirdPrice = solPrice < thirdPrice && mvrvZscore < -0.1;

//   return {
//     first: isBuyFirstPrice,
//     second: isBuySecondPrice,
//     third: isBuyThirdPrice,
//   };
// };

// // setInterval(async () => {
// //   const io = getIO();
// //   const response = await axios.get('https://bitcoinition.com/current.json');
// //   const price_data = response.data.data;

// //   const mvrvZscore = price_data.current_mvrvzscore;
// //   io.emit('mvrvZscore', mvrvZscore);

// //   if (btcPrice != -1000) {
// //     io.emit('btcStatus', JSON.stringify(checkBTCStatus(mvrvZscore)));
// //   }

// //   if (ethPrice != -1000) {
// //     io.emit('ethStatus', JSON.stringify(checkETHStatus(mvrvZscore)));
// //   }

// //   if (avaxPrice != -1000) {
// //     io.emit('avaxStatus', JSON.stringify(checkAVAXStatus(mvrvZscore)));
// //   }

// //   if (solPrice != -1000) {
// //     io.emit('solStatus', JSON.stringify(checkSOLStatus(mvrvZscore)));
// //   }
// // }, 10000);

// setInterval(async () => {
//   if (setManualMvrvZscoreEnabled) mvrvZscore = manualMvrvZscore;
//   else {
//     const response = await axios.get('https://bitcoinition.com/current.json');
//     const price_data = response.data.data;

//     mvrvZscore = price_data.current_mvrvzscore;
//   }
// }, 2000);

// // Buying Stretegy
// const runBTCBuyingStrategy = async () => {
//   if (btcPrice < btcStaticBuyingPrice * 0.9) {
//     await btcBuyingOrders(1);
//   }

//   // Second Price
//   if (btcPrice < btcStaticBuyingPrice * 0.85) {
//     await btcBuyingOrders(2);
//   }

//   // Third Price
//   if (btcPrice < btcStaticBuyingPrice * 0.8) {
//     await btcBuyingOrders(3);
//   }
// };

// const runETHBuyingStrategy = async () => {
//   if (ethPrice < ethStaticBuyingPrice * 0.9) {
//     await ethBuyingOrders(1);
//   }

//   // Second Price
//   if (ethPrice < ethStaticBuyingPrice * 0.85) {
//     await ethBuyingOrders(2);
//   }

//   // Third Price
//   if (ethPrice < ethStaticBuyingPrice * 0.8) {
//     await ethBuyingOrders(3);
//   }
// };

// const runAVAXBuyingStrategy = async () => {
//   if (avaxPrice < avaxStaticBuyingPrice * 0.9) {
//     await avaxBuyingOrders(1);
//   }

//   // Second Price
//   if (avaxPrice < avaxStaticBuyingPrice * 0.8) {
//     await avaxBuyingOrders(2);
//   }

//   // Third Price
//   if (avaxPrice < avaxStaticBuyingPrice * 0.7) {
//     await avaxBuyingOrders(3);
//   }
// };

// const runSOLBuyingStrategy = async () => {
//   if (solPrice < solStaticBuyingPrice * 0.9) {
//     await solBuyingOrders(1);
//   }

//   // Second Price
//   if (solPrice < solStaticBuyingPrice * 0.8) {
//     await solBuyingOrders(2);
//   }

//   // Third Price
//   if (solPrice < solStaticBuyingPrice * 0.7) {
//     await solBuyingOrders(3);
//   }
// };

// // Selling Stretegy
// const runBTCSellingStrategy = async () => {
//   if (btcPrice > btcStaticSellingPrice * 1.05) {
//     await btcSellingOrders(1);
//   }

//   // Second Price
//   if (btcPrice > btcStaticSellingPrice * 1.1) {
//     await btcSellingOrders(2);
//   }

//   // Third Price
//   if (btcPrice > btcStaticSellingPrice * 1.15) {
//     await btcSellingOrders(3);
//   }
// };

// const runETHSellingStrategy = async () => {
//   // First Price
//   if (ethPrice > ethStaticSellingPrice * 1.8) {
//     await ethSellingOrders(1);
//   }

//   // Second Price
//   if (ethPrice > ethStaticSellingPrice * 2.0) {
//     await ethSellingOrders(2);
//   }

//   // Third Price
//   if (ethPrice > ethStaticSellingPrice * 2.2) {
//     await ethSellingOrders(3);
//   }
// };

// const runAVAXSellingStrategy = async () => {
//   if (avaxPrice > avaxStaticSellingPrice * 2.6) {
//     await avaxSellingOrders(1);
//   }

//   // Second Price
//   if (avaxPrice > avaxStaticSellingPrice * 3.0) {
//     await avaxSellingOrders(2);
//   }

//   // Third Price
//   if (avaxPrice > avaxStaticSellingPrice * 3.4) {
//     await avaxSellingOrders(3);
//   }
// };

// const runSOLSellingStrategy = async () => {
//   if (solPrice > solStaticSellingPrice * 2.6) {
//     await solSellingOrders(1);
//   }

//   // Second Price
//   if (solPrice > solStaticSellingPrice * 3.0) {
//     await solSellingOrders(2);
//   }

//   // Third Price
//   if (solPrice > solStaticSellingPrice * 3.4) {
//     await solSellingOrders(3);
//   }
// };

// const sendBuyingPrice = (stable: boolean) => {
//   const io = getIO();

//   if (stable) {
//     const price = {
//       BTC: {
//         first: (btcStaticBuyingPrice * 0.9).toFixed(2),
//         second: (btcStaticBuyingPrice * 0.85).toFixed(2),
//         third: (btcStaticBuyingPrice * 0.8).toFixed(2),
//       },
//       ETH: {
//         first: (ethStaticBuyingPrice * 0.9).toFixed(2),
//         second: (ethStaticBuyingPrice * 0.85).toFixed(2),
//         third: (ethStaticBuyingPrice * 0.8).toFixed(2),
//       },
//       AVAX: {
//         first: (avaxStaticBuyingPrice * 0.9).toFixed(2),
//         second: (avaxStaticBuyingPrice * 0.8).toFixed(2),
//         third: (avaxStaticBuyingPrice * 0.7).toFixed(2),
//       },
//       SOL: {
//         first: (solStaticBuyingPrice * 0.9).toFixed(2),
//         second: (solStaticBuyingPrice * 0.8).toFixed(2),
//         third: (solStaticBuyingPrice * 0.7).toFixed(2),
//       },
//     };

//     io.emit('buyingPrice', JSON.stringify(price));
//   } else {
//     const price = {
//       BTC: {
//         first: 'X',
//         second: 'X',
//         third: 'X',
//       },
//       ETH: {
//         first: 'X',
//         second: 'X',
//         third: 'X',
//       },
//       AVAX: {
//         first: 'X',
//         second: 'X',
//         third: 'X',
//       },
//       SOL: {
//         first: 'X',
//         second: 'X',
//         third: 'X',
//       },
//     };
//     io.emit('buyingPrice', JSON.stringify(price));
//   }
// };

// const sendSellingPrice = (stable: boolean) => {
//   const io = getIO();

//   if (stable) {
//     const price = {
//       BTC: {
//         first: (btcStaticSellingPrice * 1.05).toFixed(2),
//         second: (btcStaticSellingPrice * 1.1).toFixed(2),
//         third: (btcStaticSellingPrice * 1.15).toFixed(2),
//       },
//       ETH: {
//         first: (ethStaticSellingPrice * 1.8).toFixed(2),
//         second: (ethStaticSellingPrice * 2.0).toFixed(2),
//         third: (ethStaticSellingPrice * 2.2).toFixed(2),
//       },
//       AVAX: {
//         first: (avaxStaticSellingPrice * 2.6).toFixed(2),
//         second: (avaxStaticSellingPrice * 3.0).toFixed(2),
//         third: (avaxStaticSellingPrice * 3.4).toFixed(2),
//       },
//       SOL: {
//         first: (solStaticSellingPrice * 2.6).toFixed(2),
//         second: (solStaticSellingPrice * 3.0).toFixed(2),
//         third: (solStaticSellingPrice * 3.4).toFixed(2),
//       },
//     };
//     io.emit('sellingPrice', JSON.stringify(price));
//   } else {
//     const price = {
//       BTC: {
//         first: 'X',
//         second: 'X',
//         third: 'X',
//       },
//       ETH: {
//         first: 'X',
//         second: 'X',
//         third: 'X',
//       },
//       AVAX: {
//         first: 'X',
//         second: 'X',
//         third: 'X',
//       },
//       SOL: {
//         first: 'X',
//         second: 'X',
//         third: 'X',
//       },
//     };
//     io.emit('sellingPrice', JSON.stringify(price));
//   }
// };

// const runStrategies = async () => {
//   try {
//     if (btcPrice == -1000 || ethPrice == -1000 || avaxPrice == -1000 || solPrice == -1000) {
//       return;
//     }

//     const fixedBtcPrice = btcPrice;
//     const fixedEthPrice = ethPrice;
//     const fixedAvaxPrice = avaxPrice;
//     const fixedSolPrice = solPrice;

//     const io = getIO();

//     const realPrice = {
//       BTC: fixedBtcPrice.toFixed(2),
//       ETH: fixedEthPrice.toFixed(2),
//       AVAX: fixedAvaxPrice.toFixed(2),
//       SOL: fixedSolPrice.toFixed(2),
//     };

//     io.emit('mvrvZscore', mvrvZscore);
//     io.emit('realPrice', JSON.stringify(realPrice));

//     if (mvrvZscore <= -0.1) {
//       highTrend = false;

//       if (lowTrend == false) {
//         btcStaticBuyingPrice = fixedBtcPrice;
//         ethStaticBuyingPrice = fixedEthPrice;
//         avaxStaticBuyingPrice = fixedAvaxPrice;
//         solStaticBuyingPrice = fixedSolPrice;

//         updatedBuyingDate = new Date().toUTCString();

//         lowTrend = true;
//       }

//       sendBuyingPrice(true);
//       sendSellingPrice(false);

//       io.emit(
//         'referencePrice',
//         JSON.stringify({
//           buying: {
//             updatedDate: updatedBuyingDate,
//             BTC: btcStaticBuyingPrice.toFixed(2),
//             ETH: ethStaticBuyingPrice.toFixed(2),
//             AVAX: avaxStaticBuyingPrice.toFixed(2),
//             SOL: solStaticBuyingPrice.toFixed(2),
//           },
//           selling: {
//             updatedDate: 'X',
//             BTC: 'X',
//             ETH: 'X',
//             AVAX: 'X',
//             SOL: 'X',
//           },
//         }),
//       );

//       io.emit('realPrice', JSON.stringify(realPrice));

//       await runBTCBuyingStrategy();
//       await runETHBuyingStrategy();
//       await runAVAXBuyingStrategy();
//       await runSOLBuyingStrategy();

//       await updateHistories();
//     }

//     if (mvrvZscore >= 6.9) {
//       lowTrend = false;

//       if (highTrend == false) {
//         btcStaticSellingPrice = fixedBtcPrice;
//         ethStaticSellingPrice = fixedEthPrice;
//         avaxStaticSellingPrice = fixedAvaxPrice;
//         solStaticSellingPrice = fixedSolPrice;

//         updatedSellingDate = new Date().toUTCString();

//         highTrend = true;
//       }

//       sendSellingPrice(true);
//       sendBuyingPrice(false);

//       io.emit(
//         'referencePrice',
//         JSON.stringify({
//           buying: {
//             updatedDate: 'X',
//             BTC: 'X',
//             ETH: 'X',
//             AVAX: 'X',
//             SOL: 'X',
//           },
//           selling: {
//             updatedDate: updatedSellingDate,
//             BTC: btcStaticSellingPrice.toFixed(2),
//             ETH: ethStaticSellingPrice.toFixed(2),
//             AVAX: avaxStaticSellingPrice.toFixed(2),
//             SOL: solStaticSellingPrice.toFixed(2),
//           },
//         }),
//       );

//       io.emit('realPrice', JSON.stringify(realPrice));

//       await runBTCSellingStrategy();
//       await runETHSellingStrategy();
//       await runAVAXSellingStrategy();
//       await runSOLSellingStrategy();

//       await updateHistories();
//     }

//     await saveData();
//   } catch (error) {
//     console.log('error ==> ', error);
//   }
// };

// export const setMvrvZscore = (val: string, isEnabled: boolean) => {
//   manualMvrvZscore = parseFloat(val);
//   mvrvZscore = manualMvrvZscore;
//   setManualMvrvZscoreEnabled = isEnabled;

//   runStrategies();
// };

// setInterval(async () => {
//   if (isLoading) return;
//   if (isRunning) return;
//   isRunning = true;

//   await runStrategies();

//   isRunning = false;
// }, 10000);
