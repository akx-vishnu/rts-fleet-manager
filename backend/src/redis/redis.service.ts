import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private storage = new Map<string, string>();
  private geoStorage = new Map<string, { lat: number; lng: number }>();

  constructor() {
    this.logger.warn('Using In-Memory Redis Mock. Do not use in production if persistence is required.');
  }

  async set(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async del(key: string): Promise<void> {
    this.storage.delete(key);
  }

  // Geo-spatial mock methods
  async geoAdd(key: string, lat: number, lng: number, member: string): Promise<void> {
    // For a real Redis GEOADD, key would be the collection (e.g., 'vehicles'), and member the specific ID.
    // Here we will just store it in a separate map for simplicity, or structure it as needed.
    // Let's store by member directly for O(1) retrieval if that's the primary use case, 
    // or emulate the collection behavior if we need "nearby" search.
    // For this project's simple tracking, storing the latest location of a vehicle is the goal.
    // For this project's simple tracking, storing the latest location of a vehicle is the goal.
    const storageKey = `${key}:${member}`;
    this.storage.set(storageKey, JSON.stringify({ lat, lng, lastUpdated: new Date() }));
    this.geoStorage.set(member, { lat, lng });
  }

  async getVehicleLocation(vehicleId: string): Promise<{ lat: number; lng: number } | null> {
    return this.geoStorage.get(vehicleId) || null;
  }

  async getAllVehicleLocations(): Promise<Record<string, { lat: number; lng: number }>> {
    return Object.fromEntries(this.geoStorage);
  }
}
