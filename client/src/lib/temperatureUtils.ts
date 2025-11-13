export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function formatTemperature(
  tempInCelsius: number,
  unit: "C" | "F",
  decimals: number = 0
): string {
  const temp = unit === "F" ? celsiusToFahrenheit(tempInCelsius) : tempInCelsius;
  return `${temp.toFixed(decimals)}°${unit}`;
}

export function getTemperatureValue(
  tempInCelsius: number,
  unit: "C" | "F"
): number {
  return unit === "F" ? celsiusToFahrenheit(tempInCelsius) : tempInCelsius;
}
