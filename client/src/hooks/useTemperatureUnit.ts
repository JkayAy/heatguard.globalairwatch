import { usePreferences } from "./usePreferences";
import { formatTemperature, getTemperatureValue } from "@/lib/temperatureUtils";

export function useTemperatureUnit() {
  const { preferences, isLoading } = usePreferences();

  // Default to Celsius for non-authenticated users
  const unit = preferences?.temperatureUnit || "C";

  const format = (tempInCelsius: number, decimals: number = 0) => {
    return formatTemperature(tempInCelsius, unit, decimals);
  };

  const getValue = (tempInCelsius: number) => {
    return getTemperatureValue(tempInCelsius, unit);
  };

  return {
    unit,
    format,
    getValue,
    isLoading,
  };
}
