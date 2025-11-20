import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { getAuth } from "@clerk/express";
import axios from "axios";
import { apiCache } from "./cache";
import { storage } from "./storage";
import {
  locationSchema,
  geocodingResponseSchema,
  type Location,
  type WeatherData,
  type AqiLevel,
  insertUserPreferencesSchema,
  insertSavedLocationSchema,
} from "@shared/schema";

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
  // User preferences routes
  app.get('/api/preferences', requireAuth, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      let prefs = await storage.getUserPreferences(userId);
      
      // Create default preferences if none exist
      if (!prefs) {
        prefs = await storage.createUserPreferences({
          userId,
          temperatureUnit: 'C',
          emailAlertsEnabled: false,
        });
      }
      
      res.json(prefs);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.patch('/api/preferences', requireAuth, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Exclude userId from updates to prevent hijacking other users' preferences
      const updates = insertUserPreferencesSchema.omit({ userId: true }).partial().parse(req.body);
      
      const updatedPrefs = await storage.updateUserPreferences(userId, updates);
      res.json(updatedPrefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Saved locations routes
  app.get('/api/saved-locations', requireAuth, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const locations = await storage.getSavedLocations(userId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching saved locations:", error);
      res.status(500).json({ message: "Failed to fetch saved locations" });
    }
  });

  app.post('/api/saved-locations', requireAuth, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const locationData = insertSavedLocationSchema.parse({ ...req.body, userId });
      
      const savedLocation = await storage.addSavedLocation(locationData);
      res.json(savedLocation);
    } catch (error) {
      console.error("Error adding saved location:", error);
      res.status(500).json({ message: "Failed to add saved location" });
    }
  });

  app.delete('/api/saved-locations/:id', requireAuth, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const locationId = parseInt(req.params.id);
      
      await storage.removeSavedLocation(locationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing saved location:", error);
      res.status(500).json({ message: "Failed to remove saved location" });
    }
  });

  app.patch('/api/saved-locations/:id/default', requireAuth, async (req: Request, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const locationId = parseInt(req.params.id);
      
      await storage.setDefaultLocation(locationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default location:", error);
      res.status(500).json({ message: "Failed to set default location" });
    }
  });

  // Weather history routes
  app.get('/api/weather-history', async (req, res) => {
    try {
      const lat = parseFloat(req.query.latitude as string);
      const lon = parseFloat(req.query.longitude as string);
      const days = parseInt(req.query.days as string) || 7;
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      const history = await storage.getWeatherHistory(lat, lon, days);
      res.json(history);
    } catch (error) {
      console.error("Error fetching weather history:", error);
      res.status(500).json({ message: "Failed to fetch weather history" });
    }
  });

  // Public routes (no auth required)
  app.get("/api/geocoding/search", async (req, res) => {
    try {
      const query = req.query.q as string;

      if (!query || query.length < 2) {
        return res.status(400).json({ error: "Query must be at least 2 characters" });
      }

      const cacheKey = `geocoding-search:${query.toLowerCase()}`;
      const cached = apiCache.get<Location[]>(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const response = await axios.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        {
          params: {
            name: query,
            count: 10,
            language: "en",
            format: "json",
          },
        }
      );

      const parsed = geocodingResponseSchema.parse(response.data);
      const results = parsed.results || [];

      apiCache.set(cacheKey, results);
      res.json(results);
    } catch (error) {
      console.error("Geocoding search error:", error);
      res.status(500).json({ error: "Failed to search locations" });
    }
  });

  app.get("/api/geocoding/reverse", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const cacheKey = `geocoding-reverse:${lat.toFixed(4)},${lon.toFixed(4)}`;
      const cached = apiCache.get<Location>(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const response = await axios.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        {
          params: {
            latitude: lat,
            longitude: lon,
            count: 1,
            language: "en",
            format: "json",
          },
        }
      );

      const parsed = geocodingResponseSchema.parse(response.data);
      const results = parsed.results || [];

      const location: Location = results.length > 0
        ? results[0]
        : {
            name: "Unknown Location",
            latitude: lat,
            longitude: lon,
          };

      apiCache.set(cacheKey, location);
      res.json(location);
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      res.status(500).json({ error: "Failed to get location name" });
    }
  });

  app.get("/api/weather", async (req, res) => {
    try {
      const lat = parseFloat(req.query.latitude as string);
      const lon = parseFloat(req.query.longitude as string);
      const locationName = (req.query.name as string) || "Unknown Location";
      const country = (req.query.country as string) || "";
      const admin1 = (req.query.admin1 as string) || "";

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const cacheKey = `weather:${lat.toFixed(4)},${lon.toFixed(4)}`;
      const cached = apiCache.get<WeatherData>(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const response = await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: lat,
            longitude: lon,
            current: "temperature_2m,relative_humidity_2m,apparent_temperature",
            hourly: "temperature_2m,relative_humidity_2m,apparent_temperature",
            daily: "temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,precipitation_probability_max,wind_speed_10m_max",
            temperature_unit: "celsius",
            wind_speed_unit: "kmh",
            timezone: "auto",
            forecast_days: 7,
          },
        }
      );

      const data = response.data;

      if (!data || !data.current || !data.hourly) {
        throw new Error("Invalid response from weather API");
      }

      if (
        typeof data.current.temperature_2m !== "number" ||
        typeof data.current.relative_humidity_2m !== "number" ||
        typeof data.current.apparent_temperature !== "number"
      ) {
        throw new Error("Missing or invalid current weather data");
      }

      if (
        !Array.isArray(data.hourly.time) ||
        !Array.isArray(data.hourly.temperature_2m) ||
        !Array.isArray(data.hourly.relative_humidity_2m) ||
        !Array.isArray(data.hourly.apparent_temperature) ||
        data.hourly.time.length === 0
      ) {
        throw new Error("Missing or invalid hourly data from weather API");
      }

      const currentTempC = data.current.temperature_2m;
      const currentHumidity = data.current.relative_humidity_2m;
      const currentApparentTempC = data.current.apparent_temperature;
      const currentTempF = celsiusToFahrenheit(currentTempC);
      const heatIndexF = calculateHeatIndex(currentTempF, currentHumidity);
      const heatIndex = fahrenheitToCelsius(heatIndexF);
      const riskLevel = getHeatRiskLevel(heatIndexF);

      const hourlyForecasts = data.hourly.time.map((time: string, index: number) => {
        const tempC = data.hourly.temperature_2m[index];
        const humidity = data.hourly.relative_humidity_2m[index];
        const tempF = celsiusToFahrenheit(tempC);
        const hourHeatIndexF = calculateHeatIndex(tempF, humidity);
        const hourHeatIndex = fahrenheitToCelsius(hourHeatIndexF);
        const hourRiskLevel = getHeatRiskLevel(hourHeatIndexF);

        return {
          time,
          temperature: tempC,
          humidity,
          apparentTemperature: data.hourly.apparent_temperature[index],
          heatIndex: hourHeatIndex,
          riskLevel: hourRiskLevel,
        };
      });

      // Process daily forecast data
      const dailyForecasts = data.daily?.time?.map((date: string, index: number) => {
        const tempMaxC = data.daily.temperature_2m_max[index];
        const tempMinC = data.daily.temperature_2m_min[index];
        const humidityMax = data.daily.relative_humidity_2m_max[index];
        const humidityMin = data.daily.relative_humidity_2m_min[index];
        
        // Calculate heat index for max temperature (convert to F first, then calculate, then back to C)
        const tempMaxF = celsiusToFahrenheit(tempMaxC);
        const heatIndexMaxF = calculateHeatIndex(tempMaxF, humidityMax);
        const heatIndexMaxC = fahrenheitToCelsius(heatIndexMaxF);
        
        // Calculate heat index for min temperature (convert to F first, then calculate, then back to C)
        const tempMinF = celsiusToFahrenheit(tempMinC);
        const heatIndexMinF = calculateHeatIndex(tempMinF, humidityMin);
        const heatIndexMinC = fahrenheitToCelsius(heatIndexMinF);
        
        // Use max heat index for daily risk level
        const dailyRiskLevel = getHeatRiskLevel(heatIndexMaxF);

        return {
          date,
          temperatureMax: tempMaxC,
          temperatureMin: tempMinC,
          heatIndexMax: heatIndexMaxC,
          heatIndexMin: heatIndexMinC,
          riskLevel: dailyRiskLevel,
          precipitationProbability: data.daily.precipitation_probability_max[index] || 0,
          windSpeedMax: data.daily.wind_speed_10m_max[index] || 0,
        };
      }) || [];

      const location: Location = {
        name: locationName,
        latitude: lat,
        longitude: lon,
        country,
        admin1,
      };

      // Fetch air quality data
      let airQuality = undefined;
      try {
        const aqiResponse = await axios.get(
          "https://air-quality-api.open-meteo.com/v1/air-quality",
          {
            params: {
              latitude: lat,
              longitude: lon,
              current: "us_aqi,pm2_5,pm10",
            },
          }
        );

        const aqiData = aqiResponse.data;
        
        if (aqiData?.current && typeof aqiData.current.us_aqi === "number") {
          const aqi = Math.round(aqiData.current.us_aqi);
          const pm25 = aqiData.current.pm2_5 || 0;
          const pm10 = aqiData.current.pm10 || 0;
          const level = getAqiLevel(aqi);
          
          airQuality = {
            aqi,
            pm25,
            pm10,
            level,
            time: aqiData.current.time || data.current.time,
          };
        }
      } catch (aqiError) {
        console.error("Air quality API error (non-fatal):", aqiError);
      }

      const weatherData: WeatherData = {
        current: {
          temperature: currentTempC,
          humidity: currentHumidity,
          apparentTemperature: currentApparentTempC,
          time: data.current.time,
        },
        hourly: hourlyForecasts,
        daily: dailyForecasts,
        location,
        heatIndex,
        riskLevel,
        airQuality,
      };

      apiCache.set(cacheKey, weatherData);
      res.json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
