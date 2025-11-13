import type { HeatRiskLevel } from "@shared/schema";

export function calculateHeatIndex(tempF: number, humidity: number): number {
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

  let HI = c1 + c2 * T + c3 * R + c4 * T * R + c5 * T * T + c6 * R * R + 
           c7 * T * T * R + c8 * T * R * R + c9 * T * T * R * R;

  if (R < 13 && T >= 80 && T <= 112) {
    const adjustment = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    HI -= adjustment;
  } else if (R > 85 && T >= 80 && T <= 87) {
    const adjustment = ((R - 85) / 10) * ((87 - T) / 5);
    HI += adjustment;
  }

  return Math.round(HI);
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function getHeatRiskLevel(heatIndex: number): HeatRiskLevel {
  if (heatIndex < 80) return "normal";
  if (heatIndex < 91) return "caution";
  if (heatIndex < 103) return "extreme_caution";
  if (heatIndex < 125) return "danger";
  return "extreme_danger";
}

export function getRiskLevelLabel(level: HeatRiskLevel): string {
  const labels: Record<HeatRiskLevel, string> = {
    normal: "Normal",
    caution: "Caution",
    extreme_caution: "Extreme Caution",
    danger: "Danger",
    extreme_danger: "Extreme Danger",
  };
  return labels[level];
}

export function getRiskLevelColor(level: HeatRiskLevel): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<HeatRiskLevel, { bg: string; text: string; border: string }> = {
    normal: { bg: "bg-risk-normal", text: "text-risk-normalForeground", border: "border-risk-normal" },
    caution: { bg: "bg-risk-caution", text: "text-risk-cautionForeground", border: "border-risk-caution" },
    extreme_caution: { bg: "bg-risk-extremeCaution", text: "text-risk-extremeCautionForeground", border: "border-risk-extremeCaution" },
    danger: { bg: "bg-risk-danger", text: "text-risk-dangerForeground", border: "border-risk-danger" },
    extreme_danger: { bg: "bg-risk-extremeDanger", text: "text-risk-extremeDangerForeground", border: "border-risk-extremeDanger" },
  };
  return colors[level];
}

export function getHealthGuidance(level: HeatRiskLevel): string[] {
  const guidance: Record<HeatRiskLevel, string[]> = {
    normal: [
      "No special precautions needed",
      "Stay hydrated with regular water intake",
      "Enjoy outdoor activities as usual",
    ],
    caution: [
      "Drink plenty of water throughout the day",
      "Take breaks in shade during prolonged outdoor activity",
      "Watch for signs of heat exhaustion in vulnerable individuals",
      "Avoid strenuous activity during peak heat hours",
    ],
    extreme_caution: [
      "Minimize outdoor exposure during hottest hours (10am-4pm)",
      "Drink water frequently, even if not thirsty",
      "Wear lightweight, light-colored, loose-fitting clothing",
      "Take frequent breaks in air-conditioned spaces",
      "Check on elderly neighbors and vulnerable individuals",
      "Never leave children or pets in vehicles",
    ],
    danger: [
      "Avoid outdoor activity during peak heat hours",
      "Stay in air-conditioned spaces as much as possible",
      "Drink water every 15-20 minutes during any outdoor activity",
      "Watch for heat exhaustion symptoms: dizziness, nausea, weakness",
      "Seek immediate medical attention if symptoms worsen",
      "Check on at-risk individuals multiple times per day",
      "Postpone outdoor events and strenuous activities",
    ],
    extreme_danger: [
      "STAY INDOORS in air-conditioned spaces",
      "This is a life-threatening heat emergency",
      "Do not go outside unless absolutely necessary",
      "Call emergency services immediately if experiencing heat stroke symptoms",
      "Symptoms include confusion, rapid pulse, hot dry skin, unconsciousness",
      "Check on all vulnerable individuals immediately",
      "Cancel all outdoor activities and events",
      "Move to cooling centers if home AC is unavailable",
    ],
  };
  return guidance[level];
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
