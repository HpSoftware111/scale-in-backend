import { Settings } from '@/interfaces/settings.interface';
import { SettingsModel } from '@/models/settings.model';
import { SettingsService } from '@/services/settings.service';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';

export class SettingsController {
  public settings = Container.get(SettingsService);

  public getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key: string = req.params.key;
      const settings = await this.settings.getSettingsByKey(key);
      return res.json({
        settings,
        message: 'get-settings',
      });
    } catch (err) {
      next(err);
    }
  };

  public updateSetting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { key, value } = req.body;
    try {
      let setting: Settings | null = await SettingsModel.findOne({ key });
      if (setting) {
        setting.value = value;
        await setting.save();
      } else {
        setting = new SettingsModel({ key, value });
        await setting.save();
      }
      res.json(setting);
    } catch (err) {
      next(err);
    }
  };
}
