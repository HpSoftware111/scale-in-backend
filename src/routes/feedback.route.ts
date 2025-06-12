import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { CreateFeedbackDto } from '@/dtos/feedback.dto';
import { FeedbackController } from '@/controllers/feedback.controller';

export class FeedbackRoute implements Routes {
  public path = '/feedback';
  public router = Router();

  public Feedback = new FeedbackController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/save`, ValidationMiddleware(CreateFeedbackDto), AuthMiddleware, this.Feedback.saveFeedback);
  }
}
