import { z } from "zod";

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
