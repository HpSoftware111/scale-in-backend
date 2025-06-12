import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { SettingsController } from '@/controllers/settings.controller';

export class SettingsRoute implements Routes {
  public path = '/settings';
  public router = Router();
  public Settings = new SettingsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:key`, AuthMiddleware, this.Settings.getSettings);
    this.router.post(`${this.path}`, this.Settings.updateSetting);
  }
}
