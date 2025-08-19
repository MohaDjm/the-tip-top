import { Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { logger } from '../utils/logger';
import prisma from '../config/database';

export class EmployeeController {
  claimPrize = async (req: Request, res: Response) => {
    try {
      const { participationId } = req.params;
      const employeeId = req.user?.id;

      if (!employeeId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Employee not authenticated'
        });
      }

      const participation = await prisma.participation.findUnique({
        where: { id: participationId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          gain: true
        }
      });

      if (!participation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Participation not found'
        });
      }

      if (participation.isClaimed) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Prize already claimed'
        });
      }

      const updatedParticipation = await prisma.participation.update({
        where: { id: participationId },
        data: {
          isClaimed: true,
          claimedAt: new Date(),
          claimedByEmployeeId: employeeId
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
          gain: true
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Prize claimed successfully',
        data: updatedParticipation
      });
    } catch (error: any) {
      logger.error('Claim prize error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to claim prize'
      });
    }
  };

  getUnclaimedPrizes = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, gainId } = req.query;

      const participations = await prisma.participation.findMany({
        where: {
          isClaimed: false,
          ...(gainId && { gainId: gainId as string })
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          gain: true,
          code: {
            select: {
              code: true
            }
          }
        },
        orderBy: { participationDate: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string)
      });

      const total = await prisma.participation.count({
        where: {
          isClaimed: false,
          ...(gainId && { gainId: gainId as string })
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Unclaimed prizes retrieved successfully',
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
      logger.error('Get unclaimed prizes error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve unclaimed prizes'
      });
    }
  };

  getClaimedPrizes = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, gainId } = req.query;
      const employeeId = req.user?.id;

      const participations = await prisma.participation.findMany({
        where: {
          isClaimed: true,
          ...(gainId && { gainId: gainId as string }),
          ...(employeeId && { claimedByEmployeeId: employeeId })
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          gain: true,
          code: {
            select: {
              code: true
            }
          }
        },
        orderBy: { claimedAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string)
      });

      const total = await prisma.participation.count({
        where: {
          isClaimed: true,
          ...(gainId && { gainId: gainId as string }),
          ...(employeeId && { claimedByEmployeeId: employeeId })
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Claimed prizes retrieved successfully',
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
      logger.error('Get claimed prizes error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve claimed prizes'
      });
    }
  };

  getEmployeeStats = async (req: Request, res: Response) => {
    try {
      const employeeId = req.user?.id;

      if (!employeeId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Employee not authenticated'
        });
      }

      const [totalClaimed, todayClaimed, thisWeekClaimed] = await Promise.all([
        prisma.participation.count({
          where: {
            claimedByEmployeeId: employeeId,
            isClaimed: true
          }
        }),
        prisma.participation.count({
          where: {
            claimedByEmployeeId: employeeId,
            isClaimed: true,
            claimedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.participation.count({
          where: {
            claimedByEmployeeId: employeeId,
            isClaimed: true,
            claimedAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
          }
        })
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Employee stats retrieved successfully',
        data: {
          totalClaimed,
          todayClaimed,
          thisWeekClaimed
        }
      });
    } catch (error: any) {
      logger.error('Get employee stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve employee stats'
      });
    }
  };
}
