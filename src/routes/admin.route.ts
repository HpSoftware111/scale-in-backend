import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AdminAuthMiddleware } from '@/middlewares/auth.middleware';
import { AdminManageStrategyController } from '@/controllers/admin/manage_strategy.controller';
import { SettingsController } from '@/controllers/settings.controller';
import { AffiliateRoute } from './admin/affiliate.route';

export class AdminRoute implements Routes {
  public path = '/admin';
  public router = Router();
  public AdminManageStrategy = new AdminManageStrategyController();
  public Settings = new SettingsController();
  public affilateRouter = new AffiliateRoute();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/manage_strategy`, AdminAuthMiddleware, this.AdminManageStrategy.getStrategy);
    this.router.post(`${this.path}/manage_strategy`, AdminAuthMiddleware, this.AdminManageStrategy.saveStrategy);

    this.router.get(`${this.path}/highLowPrices`, AdminAuthMiddleware, this.AdminManageStrategy.getHighLowPrices);

    this.router.get(`${this.path}/mvrvzscore`, AdminAuthMiddleware, this.AdminManageStrategy.getMvrvzscore);

    this.router.post(`${this.path}/set_mvrvzscore`, AdminAuthMiddleware, this.AdminManageStrategy.setMvrvzscore);
    this.router.post(`${this.path}/sync_mvrvzscore`, AdminAuthMiddleware, this.AdminManageStrategy.syncMvrvzscore);

    // this.router.post(`${this.path}/get-settings`, AdminAuthMiddleware, this.Settings.getSettings);
    // this.router.post(`${this.path}/update-settings`, AdminAuthMiddleware, this.Settings.updateSetting);

    this.router.use(`${this.path}`, this.affilateRouter.router);
  }
}
