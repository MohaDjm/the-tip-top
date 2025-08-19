import { Request, Response } from 'express';
import { CodeService } from '../services/code.service';
import { GainService } from '../services/gain.service';
import { HTTP_STATUS } from '../config/constants';
import { logger } from '../utils/logger';
import prisma from '../config/database';

export class AdminController {
  private codeService: CodeService;
  private gainService: GainService;

  constructor() {
    this.codeService = new CodeService();
    this.gainService = new GainService();
  }

  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.getSystemStats();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Get dashboard stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve dashboard stats'
      });
    }
  };

  getAllParticipations = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, status, gainId } = req.query;

      const participations = await prisma.participation.findMany({
        where: {
          ...(status && { isClaimed: status === 'claimed' }),
          ...(gainId && { gainId: gainId as string })
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          gain: true,
          code: true
        },
        orderBy: { participationDate: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string)
      });

      const total = await prisma.participation.count({
        where: {
          ...(status && { isClaimed: status === 'claimed' }),
          ...(gainId && { gainId: gainId as string })
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Participations retrieved successfully',
        data: {
          participations,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      logger.error('Get all participations error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve participations'
      });
    }
  };

  generateCodes = async (req: Request, res: Response) => {
    try {
      const { gainId, quantity } = req.body;

      const codes = await this.codeService.generateCodes(gainId, quantity);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: `${quantity} codes generated successfully`,
        data: { codes: codes.length }
      });
    } catch (error: any) {
      logger.error('Generate codes error:', error);
      res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to generate codes'
      });
    }
  };

  createGain = async (req: Request, res: Response) => {
    try {
      const gainData = req.body;
      const gain = await this.gainService.createGain(gainData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Gain created successfully',
        data: gain
      });
    } catch (error: any) {
      logger.error('Create gain error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create gain'
      });
    }
  };

  updateGain = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const gain = await this.gainService.updateGain(id, updateData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Gain updated successfully',
        data: gain
      });
    } catch (error: any) {
      logger.error('Update gain error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update gain'
      });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, role } = req.query;

      const users = await prisma.user.findMany({
        where: {
          ...(role && { role: role as any })
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              participations: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string)
      });

      const total = await prisma.user.count({
        where: {
          ...(role && { role: role as any })
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      logger.error('Get all users error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve users'
      });
    }
  };

  private async getSystemStats() {
    const [
      totalUsers,
      totalParticipations,
      totalCodes,
      usedCodes,
      claimedPrizes,
      totalGains
    ] = await Promise.all([
      prisma.user.count(),
      prisma.participation.count(),
      prisma.code.count(),
      prisma.code.count({ where: { isUsed: true } }),
      prisma.participation.count({ where: { isClaimed: true } }),
      prisma.gain.count()
    ]);

    return {
      totalUsers,
      totalParticipations,
      totalCodes,
      usedCodes,
      availableCodes: totalCodes - usedCodes,
      claimedPrizes,
      unclaimedPrizes: totalParticipations - claimedPrizes,
      totalGains
    };
  }
}
