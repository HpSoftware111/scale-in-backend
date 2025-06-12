import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public User = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.User.getUsers);
    this.router.get(`${this.path}/:id`, this.User.getUserById);
    this.router.post(`${this.path}`, ValidationMiddleware(CreateUserDto), this.User.createUser);
    this.router.put(`${this.path}/:id`, ValidationMiddleware(CreateUserDto, true), this.User.updateUser);
    this.router.delete(`${this.path}/:id`, this.User.deleteUser);

    this.router.post(`${this.path}/affiliation`, AuthMiddleware, this.User.getAffiliationStatus);
    this.router.post(`${this.path}/update-wallet-address`, AuthMiddleware, this.User.updateWalletAddress);
    this.router.post(`${this.path}/generate-affiliation-link`, AuthMiddleware, this.User.generateAffiliationLink);
    this.router.post(`${this.path}/send-invite-code`, this.User.handleInviteCode);

    this.router.post(`${this.path}/update-kucoin-key`, AuthMiddleware, this.User.updateKucoinKey);
    this.router.post(`${this.path}/update-binance-key`, AuthMiddleware, this.User.updateBinanceKey);
    this.router.post(`${this.path}/unsync-key`, AuthMiddleware, this.User.unSyncKey);

    this.router.post(`${this.path}/bc-connect-type`, AuthMiddleware, this.User.getBcConnectType);
    this.router.post(`${this.path}/bc-account-info`, AuthMiddleware, this.User.getBcAccountInfo);
    this.router.post(`${this.path}/your-portfolio`, AuthMiddleware, this.User.getYourPortfolio);
    this.router.post(`${this.path}/get-evolution`, AuthMiddleware, this.User.getEvolution);
    this.router.post(`${this.path}/open-orders`, AuthMiddleware, this.User.getOpenOrders);

    this.router.post(`${this.path}/discord/callback`, AuthMiddleware, this.User.discordCallback);

    this.router.post(`${this.path}/deposit-and-withdrawal`, AuthMiddleware, this.User.getDepositAndWithdrawal);
    this.router.post(`${this.path}/order-history`, AuthMiddleware, this.User.getOrdersHistory);
    this.router.post(`${this.path}/subscription`, AuthMiddleware, this.User.getSubscription);
    this.router.post(`${this.path}/cancel-subscription`, AuthMiddleware, this.User.cancelSubscription);
    this.router.post(`${this.path}/renew-subscription`, AuthMiddleware, this.User.renewSubscription);
    this.router.post(`${this.path}/subscription-status`, AuthMiddleware, this.User.getSubscriptionStatus);
    this.router.post(`${this.path}/update-payment-method`, AuthMiddleware, this.User.updatePaymentMethod);
    this.router.post(`${this.path}/payment-history`, AuthMiddleware, this.User.getPaymentHistory);

    this.router.post(`${this.path}/download-invoices`, AuthMiddleware, this.User.downloadInvoices);
  }
}
