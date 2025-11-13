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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  temperatureUnit: varchar("temperature_unit", { length: 1 }).notNull().default("C"), // 'C' or 'F'
  emailAlertsEnabled: boolean("email_alerts_enabled").notNull().default(false),
  alertEmail: varchar("alert_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved locations table
export const savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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

export const hourlyForecastSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  humidity: z.number(),
  apparentTemperature: z.number(),
  heatIndex: z.number(),
  riskLevel: heatRiskLevel,
});

export const weatherDataSchema = z.object({
  current: currentWeatherSchema,
  hourly: z.array(hourlyForecastSchema),
  location: locationSchema,
  heatIndex: z.number(),
  riskLevel: heatRiskLevel,
});

export type Location = z.infer<typeof locationSchema>;
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type HourlyForecast = z.infer<typeof hourlyForecastSchema>;
export type HeatRiskLevel = z.infer<typeof heatRiskLevel>;
export type WeatherData = z.infer<typeof weatherDataSchema>;

export const geocodingResponseSchema = z.object({
  results: z.array(locationSchema).optional(),
});

export type GeocodingResponse = z.infer<typeof geocodingResponseSchema>;
