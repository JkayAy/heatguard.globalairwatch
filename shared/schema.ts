import { z } from "zod";
import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  real,
  boolean,
  serial,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// User preferences table (userId is Clerk user ID)
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Clerk user ID
  temperatureUnit: varchar("temperature_unit", { length: 1 }).notNull().default("C"), // 'C' or 'F'
  emailAlertsEnabled: boolean("email_alerts_enabled").notNull().default(false),
  alertEmail: varchar("alert_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("user_preferences_user_id_unique").on(table.userId),
]);

// Saved locations table (userId is Clerk user ID)
export const savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Clerk user ID
  name: varchar("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  country: varchar("country"),
  admin1: varchar("admin1"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weather history table
export const weatherHistory = pgTable("weather_history", {
  id: serial("id").primaryKey(),
  locationName: varchar("location_name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  heatIndex: real("heat_index").notNull(),
  riskLevel: varchar("risk_level").notNull(),
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_weather_history_location").on(table.latitude, table.longitude),
  index("idx_weather_history_recorded_at").on(table.recordedAt),
]);

export type InsertUserPreferences = typeof userPreferences.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertSavedLocation = typeof savedLocations.$inferInsert;
export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertWeatherHistory = typeof weatherHistory.$inferInsert;
export type WeatherHistory = typeof weatherHistory.$inferSelect;

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavedLocationSchema = createInsertSchema(savedLocations).omit({
  id: true,
  createdAt: true,
});

export const locationSchema = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
  admin1: z.string().optional(),
  country_code: z.string().optional(),
});

export const currentWeatherSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  apparentTemperature: z.number(),
  time: z.string(),
});

export const heatRiskLevel = z.enum([
  "normal",
  "caution",
  "extreme_caution",
  "danger",
  "extreme_danger",
]);

export const aqiLevel = z.enum([
  "good",
  "moderate",
  "unhealthy_sensitive",
  "unhealthy",
  "very_unhealthy",
  "hazardous",
]);

export const airQualitySchema = z.object({
  aqi: z.number(),
  pm25: z.number(),
  pm10: z.number(),
  level: aqiLevel,
  time: z.string(),
});

export const hourlyForecastSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  humidity: z.number(),
  apparentTemperature: z.number(),
  heatIndex: z.number(),
  riskLevel: heatRiskLevel,
});

export const dailyForecastSchema = z.object({
  date: z.string(),
  temperatureMax: z.number(),
  temperatureMin: z.number(),
  heatIndexMax: z.number(),
  heatIndexMin: z.number(),
  riskLevel: heatRiskLevel,
  precipitationProbability: z.number(),
  windSpeedMax: z.number(),
});

export const weatherDataSchema = z.object({
  current: currentWeatherSchema,
  hourly: z.array(hourlyForecastSchema),
  daily: z.array(dailyForecastSchema),
  location: locationSchema,
  heatIndex: z.number(),
  riskLevel: heatRiskLevel,
  airQuality: airQualitySchema.optional(),
});

export type Location = z.infer<typeof locationSchema>;
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type HourlyForecast = z.infer<typeof hourlyForecastSchema>;
export type DailyForecast = z.infer<typeof dailyForecastSchema>;
export type HeatRiskLevel = z.infer<typeof heatRiskLevel>;
export type AqiLevel = z.infer<typeof aqiLevel>;
export type AirQuality = z.infer<typeof airQualitySchema>;
export type WeatherData = z.infer<typeof weatherDataSchema>;

export const geocodingResponseSchema = z.object({
  results: z.array(locationSchema).optional(),
});

export type GeocodingResponse = z.infer<typeof geocodingResponseSchema>;
