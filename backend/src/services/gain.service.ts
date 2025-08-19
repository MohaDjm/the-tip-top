import { Gain } from '@prisma/client';
import prisma from '../config/database';
import { HTTP_STATUS } from '../config/constants';

interface CreateGainData {
  name: string;
  value: number;
  description: string;
  quantity: number;
}

interface UpdateGainData {
  name?: string;
  value?: number;
  description?: string;
  quantity?: number;
  remainingQuantity?: number;
}

export class GainService {
  async createGain(gainData: CreateGainData): Promise<Gain> {
    const gain = await prisma.gain.create({
      data: {
        ...gainData,
        remainingQuantity: gainData.quantity
      }
    });

    return gain;
  }

  async updateGain(gainId: string, updateData: UpdateGainData): Promise<Gain> {
    const existingGain = await prisma.gain.findUnique({
      where: { id: gainId }
    });

    if (!existingGain) {
      const error = new Error('Gain not found');
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // If quantity is being updated, adjust remaining quantity accordingly
    let adjustedData = { ...updateData };
    if (updateData.quantity !== undefined && updateData.quantity !== existingGain.quantity) {
      const quantityDifference = updateData.quantity - existingGain.quantity;
      adjustedData.remainingQuantity = existingGain.remainingQuantity + quantityDifference;
    }

    const updatedGain = await prisma.gain.update({
      where: { id: gainId },
      data: adjustedData
    });

    return updatedGain;
  }

  async getGainById(gainId: string): Promise<Gain | null> {
    return prisma.gain.findUnique({
      where: { id: gainId }
    });
  }

  async getAllGains(): Promise<Gain[]> {
    return prisma.gain.findMany({
      orderBy: { value: 'desc' }
    });
  }

  async getAvailableGains(): Promise<Gain[]> {
    return prisma.gain.findMany({
      where: {
        remainingQuantity: {
          gt: 0
        }
      },
      orderBy: { value: 'desc' }
    });
  }

  async deleteGain(gainId: string): Promise<void> {
    const existingGain = await prisma.gain.findUnique({
      where: { id: gainId },
      include: {
        codes: true,
        participations: true
      }
    });

    if (!existingGain) {
      const error = new Error('Gain not found');
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    if (existingGain.codes.length > 0 || existingGain.participations.length > 0) {
      const error = new Error('Cannot delete gain with associated codes or participations');
      (error as any).statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    await prisma.gain.delete({
      where: { id: gainId }
    });
  }

  async getGainStats(gainId: string): Promise<{
    gain: Gain;
    totalCodes: number;
    usedCodes: number;
    totalParticipations: number;
    claimedParticipations: number;
  }> {
    const gain = await prisma.gain.findUnique({
      where: { id: gainId }
    });

    if (!gain) {
      const error = new Error('Gain not found');
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const [totalCodes, usedCodes, totalParticipations, claimedParticipations] = await Promise.all([
      prisma.code.count({
        where: { gainId }
      }),
      prisma.code.count({
        where: { gainId, isUsed: true }
      }),
      prisma.participation.count({
        where: { gainId }
      }),
      prisma.participation.count({
        where: { gainId, isClaimed: true }
      })
    ]);

    return {
      gain,
      totalCodes,
      usedCodes,
      totalParticipations,
      claimedParticipations
    };
  }
}
