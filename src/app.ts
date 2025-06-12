import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NextFunction, Request, Response } from 'express';

import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@database';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { parseCsv } from './utils/csv';
// import { startConnection } from './utils/price';
import { cronInitialize } from './utils/cron';

import http from 'http';
import { Server } from 'socket.io';
import { connection, sio } from './utils/socket';
import { initialzeDiscordBot } from './utils/discord';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public server: http.Server;
  public io: Server;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    logger.info(`=================================`);

    this.connectToDatabase();
    this.initializeWS();
    this.initializeMiddlewares();
    this.configureCommonRoutes();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();

    // startConnection();
    cronInitialize();

    initialzeDiscordBot();

    // no require
    // parseCsv();
  }

  public listen() {
    this.server.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public initializeWS() {
    this.server = http.createServer(this.app);
    // this.ws = new WS(this.server);

    this.io = sio(this.server);
    connection(this.io);
  }

  private async connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection.url, err => {
      if (err) console.log(err);
      else console.log('Connected to MongoDB');
    });
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private configureCommonRoutes() {
    this.app.get('/api/v1/.well-known/walletconnect.txt', (req, res) => {
      res.sendFile(__dirname + '/public/walletconnect.txt');
    });
  }

  public socketIOMiddleware = (req: any, res: Response, next: NextFunction) => {
    req.io = this.io;
    next();
  };

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/api/v1', this.socketIOMiddleware, route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
