import { FastifyInstance } from 'fastify';
import { Coordinates } from '../../shared/types/index.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export class FleetService {
  constructor(private app: FastifyInstance) {}

  /**
   * Updates a vehicle's real-time location in Redis.
   * Format: `vehicle:{imei}:location` -> JSON string
   */
  async updateVehicleLocation(imei: string, lat: number, lng: number) {
    // 1. Verify the vehicle exists in DB before caching its location
    // We could add an in-memory cache here to avoid hitting DB every second
    const vehicle = await this.app.prisma.vehicle.findUnique({
      where: { imei },
      select: { id: true, isActive: true, agencyId: true, registrationNumber: true },
    });

    if (!vehicle) {
      throw new NotFoundError(`Vehicle with IMEI ${imei} not found`);
    }

    const cacheKey = `vehicle:${imei}:location`;
    const payload = {
      lat,
      lng,
      timestamp: new Date().toISOString(),
      vehicleId: vehicle.id,
      registration: vehicle.registrationNumber,
      agencyId: vehicle.agencyId,
      isActive: vehicle.isActive,
    };

    if (this.app.redis) {
      await this.app.redis.set(cacheKey, JSON.stringify(payload), 'EX', 300);
    }

    return payload;
  }

  async getVehicleLocation(imei: string): Promise<(Coordinates & { timestamp: string }) | null> {
    if (!this.app.redis) return null;
    const cacheKey = `vehicle:${imei}:location`;
    const data = await this.app.redis.get(cacheKey);
    if (!data) return null;
    return JSON.parse(data);
  }

  async getAllActiveVehicleLocations() {
    if (!this.app.redis) return [];
    const keys = await this.app.redis.keys('vehicle:*:location');
    if (keys.length === 0) return [];
    const rawData = await this.app.redis.mget(keys);
    return rawData
      .filter((data): data is string => data !== null)
      .map(data => JSON.parse(data));
  }
}
