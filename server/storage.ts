import {
  type User,
  type UpsertUser,
  type UserPreferences,
  type InsertUserPreferences,
  type SavedLocation,
  type InsertSavedLocation,
  type WeatherHistory,
  type InsertWeatherHistory,
  users,
  userPreferences,
  savedLocations,
  weatherHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, prefs: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  
  // Saved locations operations
  getSavedLocations(userId: string): Promise<SavedLocation[]>;
  addSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  removeSavedLocation(id: number, userId: string): Promise<void>;
  setDefaultLocation(id: number, userId: string): Promise<void>;
  
  // Weather history operations
  addWeatherHistory(record: InsertWeatherHistory): Promise<WeatherHistory>;
  getWeatherHistory(latitude: number, longitude: number, days: number): Promise<WeatherHistory[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const [created] = await db
      .insert(userPreferences)
      .values(prefs)
      .returning();
    return created;
  }

  async updateUserPreferences(userId: string, prefs: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...prefs, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updated;
  }

  // Saved locations operations
  async getSavedLocations(userId: string): Promise<SavedLocation[]> {
    return await db
      .select()
      .from(savedLocations)
      .where(eq(savedLocations.userId, userId))
      .orderBy(desc(savedLocations.createdAt));
  }

  async addSavedLocation(location: InsertSavedLocation): Promise<SavedLocation> {
    // If setting as default, unset other defaults first
    if (location.isDefault) {
      await db
        .update(savedLocations)
        .set({ isDefault: false })
        .where(eq(savedLocations.userId, location.userId));
    }

    const [saved] = await db
      .insert(savedLocations)
      .values(location)
      .returning();
    return saved;
  }

  async removeSavedLocation(id: number, userId: string): Promise<void> {
    await db
      .delete(savedLocations)
      .where(and(eq(savedLocations.id, id), eq(savedLocations.userId, userId)));
  }

  async setDefaultLocation(id: number, userId: string): Promise<void> {
    // Unset all defaults first
    await db
      .update(savedLocations)
      .set({ isDefault: false })
      .where(eq(savedLocations.userId, userId));

    // Set the new default
    await db
      .update(savedLocations)
      .set({ isDefault: true })
      .where(and(eq(savedLocations.id, id), eq(savedLocations.userId, userId)));
  }

  // Weather history operations
  async addWeatherHistory(record: InsertWeatherHistory): Promise<WeatherHistory> {
    const [history] = await db
      .insert(weatherHistory)
      .values(record)
      .returning();
    return history;
  }

  async getWeatherHistory(latitude: number, longitude: number, days: number): Promise<WeatherHistory[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    return await db
      .select()
      .from(weatherHistory)
      .where(
        and(
          eq(weatherHistory.latitude, latitude),
          eq(weatherHistory.longitude, longitude),
          sql`${weatherHistory.recordedAt} >= ${sinceDate}`
        )
      )
      .orderBy(desc(weatherHistory.recordedAt));
  }
}

export const storage = new DatabaseStorage();
