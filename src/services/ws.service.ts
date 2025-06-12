import http from 'http';
import { Server } from 'socket.io';
import { getPythClusterApiUrl, getPythProgramKeyForCluster, PythCluster, PriceStatus, PythConnection } from '@pythnetwork/client';
import { Connection } from '@solana/web3.js';
import cron from 'node-cron';
import { AdminPriceModel } from '@/models/admin/price.model';

const PYTHNET_CLUSTER_NAME: PythCluster = 'pythnet';
const connection = new Connection(getPythClusterApiUrl(PYTHNET_CLUSTER_NAME));
const pythPublicKey = getPythProgramKeyForCluster(PYTHNET_CLUSTER_NAME);

let highestBTCPrice = -1000;
let highestETHPrice = -1000;
let highestAVAXPrice = -1000;
let highestSOLPrice = -1000;

export class WS {
  public io: Server;

  public clients: {};

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
      },
    });
    this.initialize();
    this.startPythConnection();
    this.cronInitialize();
  }

  public initialize() {
    this.io.on('connection', function handleNewConnection(connection) {
      console.log('Received a new connection');

      // this.clients[userId] = connection;

      connection.on('close', () => this.handleClientDisconnection());
    });
  }

  public handleClientDisconnection() {
    // console.log(`${userId} disconnected.`);
    // delete this.clients[userId];
  }

  public startPythConnection = () => {
    console.log('start connection');
    const pythConnection = new PythConnection(connection, pythPublicKey);
    pythConnection.onPriceChangeVerbose((productAccount, priceAccount) => {
      // The arguments to the callback include solana account information / the update slot if you need it.
      const product = productAccount.accountInfo.data.product;
      const price = priceAccount.accountInfo.data;
      // sample output:
      // SOL/USD: $14.627930000000001 ±$0.01551797
      if (price.price && price.confidence) {
        // tslint:disable-next-line:no-console
        if (product.symbol === 'Crypto.BTC/USD') {
          if (highestBTCPrice < price.price) highestBTCPrice = price.price;
        } else if (product.symbol === 'Crypto.ETH/USD') {
          if (highestETHPrice < price.price) highestETHPrice = price.price;
        } else if (product.symbol === 'Crypto.AVAX/USD') {
          if (highestAVAXPrice < price.price) highestAVAXPrice = price.price;
        } else if (product.symbol === 'Crypto.SOL/USD') {
          if (highestSOLPrice < price.price) highestSOLPrice = price.price;
        }
      } else {
        // tslint:disable-next-line:no-console
      }
    });
    pythConnection.start();
  };

  public reInitialize = () => {
    highestBTCPrice = -1000;
    highestETHPrice = -1000;
    highestAVAXPrice = -1000;
    highestSOLPrice = -1000;
  };

  public getValue = () => {
    return {
      BTC: highestBTCPrice,
      ETH: highestETHPrice,
      AVAX: highestAVAXPrice,
      SOL: highestSOLPrice,
    };
  };

  public cronInitialize = () => {
    cron.schedule(
      '0 0 * * *',
      () => {
        const price = this.getValue();
        const date = new Date();

        AdminPriceModel.insertMany([
          {
            snapped_at: date,
            type: 'BTC',
            price: price.BTC,
          },
          {
            snapped_at: date,
            type: 'ETH',
            price: price.ETH,
          },
          {
            snapped_at: date,
            type: 'AVAX',
            price: price.AVAX,
          },
          {
            snapped_at: date,
            type: 'SOL',
            price: price.SOL,
          },
        ])
          .then(docs => {
            console.log('Documents inserted successfully');
            this.reInitialize();
          })
          .catch(e => console.log(e));

        console.log('Running a job at 00:00 at UTC timezone');
      },
      {
        scheduled: true,
        timezone: 'Etc/UTC',
      },
    );
  };
}
