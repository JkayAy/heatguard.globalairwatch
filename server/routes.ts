import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { getAuth } from "@clerk/express";
import axios from "axios";
import { apiCache } from "./cache";
import { storage } from "./storage";
import { logger } from "./logger";
import { weatherRateLimiter, mutationRateLimiter } from "./middleware/rateLimiter";
import {
  locationSchema,
  geocodingResponseSchema,
  type Location,
  type WeatherData,
  type AqiLevel,
  insertUserPreferencesSchema,
  insertSavedLocationSchema,
} from "@shared/schema";

const MAX_SAVED_LOCATIONS = 50;
const AXIOS_TIMEOUT_MS = 10000;

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

function calculateHeatIndex(tempF: number, humidity: number): number {
  if (tempF < 80) {
    return tempF;
  }

  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -0.00683783;
  const c6 = -0.05481717;
  const c7 = 0.00122874;
  const c8 = 0.00085282;
  const c9 = -0.00000199;

  const T = tempF;
  const R = humidity;

  let HI =
    c1 +
    c2 * T +
    c3 * R +
    c4 * T * R +
    c5 * T * T +
    c6 * R * R +
    c7 * T * T * R +
    c8 * T * R * R +
    c9 * T * T * R * R;

  if (R < 13 && T >= 80 && T <= 112) {
    const adjustment =
      ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    HI -= adjustment;
  } else if (R > 85 && T >= 80 && T <= 87) {
    const adjustment = ((R - 85) / 10) * ((87 - T) / 5);
    HI += adjustment;
  }

  return Math.round(HI);
}

function getHeatRiskLevel(heatIndex: number) {
  if (heatIndex < 80) return "normal";
  if (heatIndex < 91) return "caution";
  if (heatIndex < 103) return "extreme_caution";
  if (heatIndex < 125) return "danger";
  return "extreme_danger";
}

function getAqiLevel(aqi: number): AqiLevel {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy_sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very_unhealthy";
  return "hazardous";
}

// Middleware to require authentication
function requireAuth(req: Request, res: Response, next: Function) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // --- User preferences ---
  app.get("/api/preferences", requireAuth, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      let prefs = await storage.getUserPreferences(userId!);
      if (!prefs) {
        prefs = await storage.createUserPreferences({ userId: userId!, temperatureUnit: "C", emailAlertsEnabled: false });
      }
      res.json(prefs);
    } catch (error) {
      logger.error("preferences_fetch_error", { error: String(error) });
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.patch("/api/preferences", requireAuth, mutationRateLimiter, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      const updates = insertUserPreferencesSchema.omit({ userId: true }).partial().parse(req.body);
      const updatedPrefs = await storage.updateUserPreferences(userId!, updates);
      logger.audit("preferences_updated", userId!, { fields: Object.keys(updates) });
      res.json(updatedPrefs);
    } catch (error) {
      logger.error("preferences_update_error", { error: String(error) });
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // --- Saved locations ---
  app.get("/api/saved-locations", requireAuth, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      const locations = await storage.getSavedLocations(userId!);
      res.json(locations);
    } catch (error) {
      logger.error("saved_locations_fetch_error", { error: String(error) });
      res.status(500).json({ message: "Failed to fetch saved locations" });
    }
  });

  app.post("/api/saved-locations", requireAuth, mutationRateLimiter, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      const existing = await storage.getSavedLocations(userId!);
      if (existing.length >= MAX_SAVED_LOCATIONS) {
        return res.status(400).json({ message: `Maximum of ${MAX_SAVED_LOCATIONS} saved locations reached` });
      }
      const locationData = insertSavedLocationSchema.parse({ ...req.body, userId });
      const savedLocation = await storage.addSavedLocation(locationData);
      logger.audit("location_saved", userId!, { locationName: savedLocation.name });
      res.json(savedLocation);
    } catch (error) {
      logger.error("saved_location_add_error", { error: String(error) });
      res.status(500).json({ message: "Failed to add saved location" });
    }
  });

  app.delete("/api/saved-locations/:id", requireAuth, mutationRateLimiter, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      const locationId = parseInt(req.params.id);
      if (isNaN(locationId)) return res.status(400).json({ error: "Invalid location ID" });
      await storage.removeSavedLocation(locationId, userId!);
      logger.audit("location_removed", userId!, { locationId });
      res.json({ success: true });
    } catch (error) {
      logger.error("saved_location_remove_error", { error: String(error) });
      res.status(500).json({ message: "Failed to remove saved location" });
    }
  });

  app.patch("/api/saved-locations/:id/default", requireAuth, mutationRateLimiter, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      const locationId = parseInt(req.params.id);
      if (isNaN(locationId)) return res.status(400).json({ error: "Invalid location ID" });
      await storage.setDefaultLocation(locationId, userId!);
      logger.audit("default_location_set", userId!, { locationId });
      res.json({ success: true });
    } catch (error) {
      logger.error("default_location_set_error", { error: String(error) });
      res.status(500).json({ message: "Failed to set default location" });
    }
  });

  // --- Weather history ---
  app.get("/api/weather-history", weatherRateLimiter, async (req, res) => {
    try {
      const lat = parseFloat(req.query.latitude as string);
      const lon = parseFloat(req.query.longitude as string);
      const days = Math.min(parseInt(req.query.days as string) || 7, 30);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      const history = await storage.getWeatherHistory(lat, lon, days);
      res.json(history);
    } catch (error) {
      logger.error("weather_history_fetch_error", { error: String(error) });
      res.status(500).json({ message: "Failed to fetch weather history" });
    }
  });

  // --- Geocoding (public) ---
  app.get("/api/geocoding/search", weatherRateLimiter, async (req, res) => {
    try {
      const query = (req.query.q as string || "").trim();
      if (!query || query.length < 2 || query.length > 100) {
        return res.status(400).json({ error: "Query must be 2–100 characters" });
      }
      const cacheKey = `geocoding-search:${query.toLowerCase()}`;
      const cached = apiCache.get<Location[]>(cacheKey);
      if (cached) return res.json(cached);

      const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: { name: query, count: 10, language: "en", format: "json" },
        timeout: AXIOS_TIMEOUT_MS,
      });
      const parsed = geocodingResponseSchema.parse(response.data);
      const results = parsed.results || [];
      apiCache.set(cacheKey, results);
      res.json(results);
    } catch (error) {
      logger.error("geocoding_search_error", { error: String(error) });
      res.status(500).json({ error: "Failed to search locations" });
    }
  });

  app.get("/api/geocoding/reverse", weatherRateLimiter, async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      const cacheKey = `geocoding-reverse:${lat.toFixed(4)},${lon.toFixed(4)}`;
      const cached = apiCache.get<Location>(cacheKey);
      if (cached) return res.json(cached);

      const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: { latitude: lat, longitude: lon, count: 1, language: "en", format: "json" },
        timeout: AXIOS_TIMEOUT_MS,
      });
      const parsed = geocodingResponseSchema.parse(response.data);
      const location: Location = parsed.results?.length
        ? parsed.results[0]
        : { name: "Unknown Location", latitude: lat, longitude: lon };
      apiCache.set(cacheKey, location);
      res.json(location);
    } catch (error) {
      logger.error("geocoding_reverse_error", { error: String(error) });
      res.status(500).json({ error: "Failed to get location name" });
    }
  });

  // --- Weather (public) ---
  app.get("/api/weather", weatherRateLimiter, async (req, res) => {
    try {
      const lat = parseFloat(req.query.latitude as string);
      const lon = parseFloat(req.query.longitude as string);
      const locationName = (req.query.name as string || "Unknown Location").slice(0, 200);
      const country = (req.query.country as string || "").slice(0, 100);
      const admin1 = (req.query.admin1 as string || "").slice(0, 100);

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const cacheKey = `weather:${lat.toFixed(4)},${lon.toFixed(4)}`;
      const cached = apiCache.get<WeatherData>(cacheKey);
      if (cached) return res.json(cached);

      const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: lat, longitude: lon,
          current: "temperature_2m,relative_humidity_2m,apparent_temperature",
          hourly: "temperature_2m,relative_humidity_2m,apparent_temperature",
          daily: "temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,precipitation_probability_max,wind_speed_10m_max",
          temperature_unit: "celsius",
          wind_speed_unit: "kmh",
          timezone: "auto",
          forecast_days: 7,
        },
        timeout: AXIOS_TIMEOUT_MS,
      });

      const data = response.data;

      if (!data?.current || !data?.hourly) throw new Error("Invalid response from weather API");
      if (typeof data.current.temperature_2m !== "number" || typeof data.current.relative_humidity_2m !== "number" || typeof data.current.apparent_temperature !== "number") {
        throw new Error("Missing or invalid current weather data");
      }
      if (!Array.isArray(data.hourly.time) || data.hourly.time.length === 0) {
        throw new Error("Missing or invalid hourly data from weather API");
      }

      const currentTempC = data.current.temperature_2m;
      const currentHumidity = data.current.relative_humidity_2m;
      const currentApparentTempC = data.current.apparent_temperature;
      const currentTempF = celsiusToFahrenheit(currentTempC);
      const heatIndexF = calculateHeatIndex(currentTempF, currentHumidity);
      const heatIndex = fahrenheitToCelsius(heatIndexF);
      const riskLevel = getHeatRiskLevel(heatIndexF);

      // Limit hourly to next 48 hours (96 data points) to keep payload lean
      const hourlyForecasts = data.hourly.time.slice(0, 48).map((time: string, index: number) => {
        const tempC = data.hourly.temperature_2m[index];
        const humidity = data.hourly.relative_humidity_2m[index];
        const tempF = celsiusToFahrenheit(tempC);
        const hourHeatIndexF = calculateHeatIndex(tempF, humidity);
        return {
          time,
          temperature: tempC,
          humidity,
          apparentTemperature: data.hourly.apparent_temperature[index],
          heatIndex: fahrenheitToCelsius(hourHeatIndexF),
          riskLevel: getHeatRiskLevel(hourHeatIndexF),
        };
      });

      const dailyForecasts = (data.daily?.time || []).map((date: string, index: number) => {
        const tempMaxC = data.daily.temperature_2m_max[index];
        const tempMinC = data.daily.temperature_2m_min[index];
        const humidityMax = data.daily.relative_humidity_2m_max[index];
        const humidityMin = data.daily.relative_humidity_2m_min[index];
        const tempMaxF = celsiusToFahrenheit(tempMaxC);
        const heatIndexMaxF = calculateHeatIndex(tempMaxF, humidityMax);
        const tempMinF = celsiusToFahrenheit(tempMinC);
        const heatIndexMinF = calculateHeatIndex(tempMinF, humidityMin);
        return {
          date,
          temperatureMax: tempMaxC,
          temperatureMin: tempMinC,
          heatIndexMax: fahrenheitToCelsius(heatIndexMaxF),
          heatIndexMin: fahrenheitToCelsius(heatIndexMinF),
          riskLevel: getHeatRiskLevel(heatIndexMaxF),
          precipitationProbability: data.daily.precipitation_probability_max[index] || 0,
          windSpeedMax: data.daily.wind_speed_10m_max[index] || 0,
        };
      });

      const location: Location = { name: locationName, latitude: lat, longitude: lon, country, admin1 };

      let airQuality = undefined;
      try {
        const aqiResponse = await axios.get("https://air-quality-api.open-meteo.com/v1/air-quality", {
          params: { latitude: lat, longitude: lon, current: "us_aqi,pm2_5,pm10" },
          timeout: AXIOS_TIMEOUT_MS,
        });
        const aqiData = aqiResponse.data;
        if (aqiData?.current && typeof aqiData.current.us_aqi === "number") {
          airQuality = {
            aqi: Math.round(aqiData.current.us_aqi),
            pm25: aqiData.current.pm2_5 || 0,
            pm10: aqiData.current.pm10 || 0,
            level: getAqiLevel(Math.round(aqiData.current.us_aqi)),
            time: aqiData.current.time || data.current.time,
          };
        }
      } catch (aqiError) {
        logger.warn("aqi_fetch_error_non_fatal", { error: String(aqiError) });
      }

      const weatherData: WeatherData = {
        current: { temperature: currentTempC, humidity: currentHumidity, apparentTemperature: currentApparentTempC, time: data.current.time },
        hourly: hourlyForecasts,
        daily: dailyForecasts,
        location,
        heatIndex,
        riskLevel,
        airQuality,
      };

      apiCache.set(cacheKey, weatherData);

      // Persist to weather history (fire-and-forget)
      storage.addWeatherHistory({
        locationName,
        latitude: lat,
        longitude: lon,
        temperature: currentTempC,
        humidity: currentHumidity,
        heatIndex,
        riskLevel,
        recordedAt: new Date(),
      }).catch((err) => logger.warn("weather_history_write_failed", { error: String(err) }));

      res.json(weatherData);
    } catch (error) {
      logger.error("weather_fetch_error", { error: String(error) });
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
