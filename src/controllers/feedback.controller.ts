import { FeedbackModel } from '@/models/feedback.model';
import { NextFunction, Request, Response } from 'express';

export class FeedbackController {
  public saveFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const { type, description } = req.body;
      const newFeedback = new FeedbackModel({
        userId,
        type,
        description,
      });

      await newFeedback.save();

      return res.json({
        message: 'save-feedback',
      });
    } catch (err) {
      next(err);
    }
  };
}
