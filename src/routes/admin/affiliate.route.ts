import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AdminAffiliateController } from '@/controllers/admin/affiliate.controller';
import { AdminAuthMiddleware } from '@/middlewares/auth.middleware';

export class AffiliateRoute implements Routes {
  public path = '/affiliate';
  public router = Router();
  public affilateController = new AdminAffiliateController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/analytics`, AdminAuthMiddleware, this.affilateController.getAnalytics);
    this.router.get(`${this.path}/affiliate-data`, AdminAuthMiddleware, this.affilateController.getAffiliateData);
    this.router.get(`${this.path}/affiliate-commission-data`, AdminAuthMiddleware, this.affilateController.getAffiliateCommissionData);
  }
}
