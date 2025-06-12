import { Router } from 'express';
import { CommonController } from '@controllers/common.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class CommonRoute implements Routes {
  public path = '/common';
  public router = Router();
  public Common = new CommonController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/request_qi_performance`, this.Common.requestQIPerformance);
    this.router.post(`${this.path}/request_pc_guide`, this.Common.requestPCGuide);
    this.router.post(`${this.path}/contact`, this.Common.contactRequest);
    this.router.post(`${this.path}/join_telegram`, this.Common.joinTelegram);
  }
}
