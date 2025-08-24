import { Request, Response } from 'express';
import { CodeService } from '../services/code.service';
import { HTTP_STATUS } from '../config/constants';
import { logger } from '../utils/logger';

export class ParticipationController {
  private codeService: CodeService;

  constructor() {
    this.codeService = new CodeService();
  }

  participate = async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const userId = req.user?.id;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent') || '';

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const result = await this.codeService.participateWithCode(
        userId,
        code,
        ipAddress || '',
        userAgent || ''
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Participation successful',
        data: result
      });
    } catch (error: any) {
      logger.error('Participation error:', error);
      res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Participation failed'
      });
    }
  };

  getMyParticipations = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const result = await this.codeService.getUserParticipations(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Participations retrieved successfully',
        data: result
      });
    } catch (error: any) {
      logger.error('Get participations error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve participations'
      });
    }
  };

  getParticipationStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const stats = await this.codeService.getUserParticipationStats(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Participation stats retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Get participation stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve participation stats'
      });
    }
  };
}
