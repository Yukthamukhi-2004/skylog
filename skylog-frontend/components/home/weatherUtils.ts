// WMO Weather Code mapping to human-readable labels and emoji icons
export interface WeatherInfo {
  label: string;
  icon: string;
}

export function getWeatherInfo(code: number, isDay: boolean = true): WeatherInfo {
  if (code === 0) return { label: "Clear", icon: isDay ? "☀️" : "🌙" };
  if (code === 1) return { label: "Mainly Clear", icon: isDay ? "🌤️" : "🌙" };
  if (code === 2) return { label: "Partly Cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "Foggy", icon: "🌫️" };
  if (code >= 51 && code <= 55) return { label: "Drizzle", icon: "🌦️" };
  if (code >= 56 && code <= 57) return { label: "Freezing Drizzle", icon: "🌧️❄️" };
  if (code >= 61 && code <= 65) return { label: "Rain", icon: "🌧️" };
  if (code >= 66 && code <= 67) return { label: "Freezing Rain", icon: "🌧️❄️" };
  if (code >= 71 && code <= 75) return { label: "Snow", icon: "❄️" };
  if (code === 77) return { label: "Snow Grains", icon: "❄️" };
  if (code >= 80 && code <= 82) return { label: "Rain Showers", icon: "🌦️" };
  if (code >= 85 && code <= 86) return { label: "Snow Showers", icon: "🌨️" };
  if (code === 95) return { label: "Thunderstorm", icon: "⛈️" };
  if (code >= 96 && code <= 99) return { label: "Thunderstorm ⚡", icon: "⛈️⚡" };
  return { label: "Unknown", icon: "❓" };
}

export function getWeatherEmoji(code: number, isDay: boolean = true): string {
  return getWeatherInfo(code, isDay).icon;
}

export function getWeatherLabel(code: number, isDay: boolean = true): string {
  return getWeatherInfo(code, isDay).label;
}

export function formatHour(timeStr: string): string {
  // timeStr is "2024-01-01T13:00"
  const parts = timeStr.split("T");
  if (parts.length < 2) return timeStr;
  const timePart = parts[1];
  const [h] = timePart.split(":");
  const hour = parseInt(h, 10);
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const toDateStr = (dt: Date) => dt.toISOString().split("T")[0];
  if (dateStr === toDateStr(today)) return "Today";
  if (dateStr === toDateStr(yesterday)) return "Yesterday";
  if (dateStr === toDateStr(tomorrow)) return "Tomorrow";

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames[d.getDay()];
}

export function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return dayNames[d.getDay()];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
