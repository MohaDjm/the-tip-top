import { Code, Gain, Participation } from '@prisma/client';
import prisma from '../config/database';
import { generateCode } from '../utils/codeGenerator';
import { EmailService } from './email.service';
import { HTTP_STATUS } from '../config/constants';
import { logger } from '../utils/logger';

interface ParticipationResult {
  participation: Participation & {
    gain: Gain;
    code: Code;
  };
  isWinner: boolean;
}

interface ParticipationStats {
  totalParticipations: number;
  totalWins: number;
  totalValue: number;
  claimedPrizes: number;
  unclaimedPrizes: number;
}

export class CodeService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async generateCodes(gainId: string, quantity: number): Promise<Code[]> {
    // Verify gain exists
    const gain = await prisma.gain.findUnique({
      where: { id: gainId }
    });

    if (!gain) {
      const error = new Error('Gain not found');
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const codes: Code[] = [];
    const codeStrings = new Set<string>();

    // Generate unique codes
    while (codeStrings.size < quantity) {
      const codeString = generateCode();
      
      // Check if code already exists in database
      const existingCode = await prisma.code.findUnique({
        where: { code: codeString }
      });

      if (!existingCode) {
        codeStrings.add(codeString);
      }
    }

    // Create codes in database
    for (const codeString of codeStrings) {
      const code = await prisma.code.create({
        data: {
          code: codeString,
          gainId: gainId
        }
      });
      codes.push(code);
    }

    // Update gain quantities
    await prisma.gain.update({
      where: { id: gainId },
      data: {
        quantity: gain.quantity + quantity,
        remainingQuantity: gain.remainingQuantity + quantity
      }
    });

    logger.info(`Generated ${quantity} codes for gain ${gain.name}`);
    return codes;
  }

  async participateWithCode(
    userId: string,
    codeString: string,
    ipAddress: string,
    userAgent: string
  ): Promise<ParticipationResult> {
    // Check if code exists and is not used
    const code = await prisma.code.findUnique({
      where: { code: codeString },
      include: { gain: true }
    });

    if (!code) {
      const error = new Error('Invalid code');
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    if (code.isUsed) {
      const error = new Error('Code has already been used');
      (error as any).statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // Check if gain has remaining quantity
    if (code.gain.remainingQuantity <= 0) {
      const error = new Error('This prize is no longer available');
      (error as any).statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // Check if user has already participated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayParticipation = await prisma.participation.findFirst({
      where: {
        userId,
        participationDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (todayParticipation) {
      const error = new Error('You can only participate once per day');
      (error as any).statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // Create participation and mark code as used
    const participation = await prisma.$transaction(async (tx) => {
      // Mark code as used
      await tx.code.update({
        where: { id: code.id },
        data: { isUsed: true }
      });

      // Decrease remaining quantity
      await tx.gain.update({
        where: { id: code.gainId },
        data: {
          remainingQuantity: {
            decrement: 1
          }
        }
      });

      // Create participation
      const newParticipation = await tx.participation.create({
        data: {
          userId,
          codeId: code.id,
          gainId: code.gainId,
          ipAddress,
          userAgent
        },
        include: {
          gain: true,
          code: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return newParticipation;
    });

    // Send confirmation email
    await this.emailService.sendParticipationConfirmation(
      participation.user.email,
      participation.user.firstName,
      participation.gain.name,
      participation.gain.description
    );

    logger.info(`User ${userId} participated with code ${codeString} and won ${code.gain.name}`);

    return {
      participation,
      isWinner: true // In this lottery, every valid code is a winner
    };
  }

  async getUserParticipations(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    participations: (Participation & { gain: Gain; code: Pick<Code, 'code'> })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [participations, total] = await Promise.all([
      prisma.participation.findMany({
        where: { userId },
        include: {
          gain: true,
          code: {
            select: { code: true }
          }
        },
        orderBy: { participationDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.participation.count({
        where: { userId }
      })
    ]);

    return {
      participations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getUserParticipationStats(userId: string): Promise<ParticipationStats> {
    const participations = await prisma.participation.findMany({
      where: { userId },
      include: { gain: true }
    });

    const totalParticipations = participations.length;
    const totalWins = participations.length; // Every participation is a win
    const totalValue = participations.reduce((sum, p) => sum + Number(p.gain.value), 0);
    const claimedPrizes = participations.filter(p => p.isClaimed).length;
    const unclaimedPrizes = participations.filter(p => !p.isClaimed).length;

    return {
      totalParticipations,
      totalWins,
      totalValue,
      claimedPrizes,
      unclaimedPrizes
    };
  }

  async getUserTodayParticipation(userId: string, today: Date, tomorrow: Date): Promise<Participation | null> {
    return prisma.participation.findFirst({
      where: {
        userId,
        participationDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });
  }

  async getCodeByString(codeString: string): Promise<Code & { gain: Gain } | null> {
    return prisma.code.findUnique({
      where: { code: codeString },
      include: { gain: true }
    });
  }

  async getAllCodes(
    page: number = 1,
    limit: number = 20,
    gainId?: string,
    isUsed?: boolean
  ): Promise<{
    codes: (Code & { gain: Gain })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (gainId) where.gainId = gainId;
    if (typeof isUsed === 'boolean') where.isUsed = isUsed;

    const [codes, total] = await Promise.all([
      prisma.code.findMany({
        where,
        include: { gain: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.code.count({ where })
    ]);

    return {
      codes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
