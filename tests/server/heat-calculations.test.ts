import { describe, it, expect } from "vitest";

// Extracted pure functions for testing (mirrors server/routes.ts logic)
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

function calculateHeatIndex(tempF: number, humidity: number): number {
  if (tempF < 80) return tempF;

  const c1 = -42.379, c2 = 2.04901523, c3 = 10.14333127,
        c4 = -0.22475541, c5 = -0.00683783, c6 = -0.05481717,
        c7 = 0.00122874, c8 = 0.00085282, c9 = -0.00000199;

  const T = tempF, R = humidity;
  let HI = c1 + c2*T + c3*R + c4*T*R + c5*T*T + c6*R*R + c7*T*T*R + c8*T*R*R + c9*T*T*R*R;

  if (R < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (R > 85 && T >= 80 && T <= 87) {
    HI += ((R - 85) / 10) * ((87 - T) / 5);
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

function getAqiLevel(aqi: number) {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy_sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very_unhealthy";
  return "hazardous";
}

// ============================================================
// Temperature Conversion
// ============================================================
describe("celsiusToFahrenheit", () => {
  it("converts 0°C to 32°F", () => expect(celsiusToFahrenheit(0)).toBe(32));
  it("converts 100°C to 212°F", () => expect(celsiusToFahrenheit(100)).toBe(212));
  it("converts 37°C to 98.6°F", () => expect(celsiusToFahrenheit(37)).toBeCloseTo(98.6, 1));
  it("converts -40°C to -40°F", () => expect(celsiusToFahrenheit(-40)).toBe(-40));
});

describe("fahrenheitToCelsius", () => {
  it("converts 32°F to 0°C", () => expect(fahrenheitToCelsius(32)).toBe(0));
  it("converts 212°F to 100°C", () => expect(fahrenheitToCelsius(212)).toBe(100));
  it("is the inverse of celsiusToFahrenheit", () => {
    const original = 25;
    expect(fahrenheitToCelsius(celsiusToFahrenheit(original))).toBeCloseTo(original, 5);
  });
});

// ============================================================
// Heat Index Calculation (NOAA algorithm)
// ============================================================
describe("calculateHeatIndex", () => {
  it("returns tempF directly when below 80°F", () => {
    expect(calculateHeatIndex(70, 80)).toBe(70);
    expect(calculateHeatIndex(79, 99)).toBe(79);
  });

  it("returns higher index than temperature at high humidity", () => {
    const hi = calculateHeatIndex(90, 80);
    expect(hi).toBeGreaterThan(90);
  });

  it("applies low-humidity adjustment when R < 13 and 80 <= T <= 112", () => {
    const hiNormal = calculateHeatIndex(95, 20);
    const hiLowHumid = calculateHeatIndex(95, 10);
    expect(hiLowHumid).toBeLessThan(hiNormal);
  });

  it("applies high-humidity adjustment when R > 85 and 80 <= T <= 87", () => {
    const hiModerate = calculateHeatIndex(85, 80);
    const hiHighHumid = calculateHeatIndex(85, 90);
    expect(hiHighHumid).toBeGreaterThan(hiModerate);
  });

  it("NOAA known value: 96°F, 65% humidity ≈ 121°F", () => {
    const hi = calculateHeatIndex(96, 65);
    expect(hi).toBeGreaterThanOrEqual(115);
    expect(hi).toBeLessThanOrEqual(130);
  });
});

// ============================================================
// Risk Level Classification
// ============================================================
describe("getHeatRiskLevel", () => {
  it("returns normal below 80°F", () => expect(getHeatRiskLevel(75)).toBe("normal"));
  it("returns normal at exactly 79°F", () => expect(getHeatRiskLevel(79)).toBe("normal"));
  it("returns caution at 80°F", () => expect(getHeatRiskLevel(80)).toBe("caution"));
  it("returns caution at 90°F", () => expect(getHeatRiskLevel(90)).toBe("caution"));
  it("returns extreme_caution at 91°F", () => expect(getHeatRiskLevel(91)).toBe("extreme_caution"));
  it("returns extreme_caution at 102°F", () => expect(getHeatRiskLevel(102)).toBe("extreme_caution"));
  it("returns danger at 103°F", () => expect(getHeatRiskLevel(103)).toBe("danger"));
  it("returns danger at 124°F", () => expect(getHeatRiskLevel(124)).toBe("danger"));
  it("returns extreme_danger at 125°F", () => expect(getHeatRiskLevel(125)).toBe("extreme_danger"));
  it("returns extreme_danger above 125°F", () => expect(getHeatRiskLevel(150)).toBe("extreme_danger"));
});

// ============================================================
// AQI Level Classification (EPA)
// ============================================================
describe("getAqiLevel", () => {
  it("returns good for 0–50", () => {
    expect(getAqiLevel(0)).toBe("good");
    expect(getAqiLevel(50)).toBe("good");
  });
  it("returns moderate for 51–100", () => expect(getAqiLevel(75)).toBe("moderate"));
  it("returns unhealthy_sensitive for 101–150", () => expect(getAqiLevel(125)).toBe("unhealthy_sensitive"));
  it("returns unhealthy for 151–200", () => expect(getAqiLevel(175)).toBe("unhealthy"));
  it("returns very_unhealthy for 201–300", () => expect(getAqiLevel(250)).toBe("very_unhealthy"));
  it("returns hazardous above 300", () => expect(getAqiLevel(301)).toBe("hazardous"));
});
