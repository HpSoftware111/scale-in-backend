import { Settings } from '@/interfaces/settings.interface';
import { SettingsModel } from '@/models/settings.model';
import { hash } from 'bcrypt';
import { Service } from 'typedi';

const defaultSettings = {
  affiliate: {
    commissionFeeForClients: 15,
    commissionFeeForNonClients: 10,
    commissionFeeForClientsBoosted: 20,
    commissionFeeForNonClientsBoosted: 15,
    numberOfActiveReferralsToBoost: 50,
  },
  private_club: {
    pricePerMonth: 135,
    priceForOneYear: 2000,
    priceForTwoYear: 3400,
    numberOfPlaces: 100,
  },
};

@Service()
export class SettingsService {
  public getSettingsByKey = async (key: string) => {
    const settings: Settings | null = await SettingsModel.findOne({ key });

    if (settings) return settings.value;

    return defaultSettings[key];
  };
}
