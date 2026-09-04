import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class WeatherService {
  private readonly OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast";

  async getWeather(latitude: number, longitude: number) {
    try {
      const params = {
        latitude,
        longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "weather_code",
          "wind_speed_10m",
          "wind_direction_10m",
          "surface_pressure",
          "uv_index",
          "precipitation",
          "is_day",
        ].join(","),
        hourly: [
          "temperature_2m",
          "precipitation_probability",
          "wind_speed_10m",
          "uv_index",
          "weather_code",
        ].join(","),
        daily: [
          "temperature_2m_max",
          "temperature_2m_min",
          "weather_code",
          "precipitation_sum",
          "uv_index_max",
          "sunrise",
          "sunset",
        ].join(","),
        timezone: "auto",
        forecast_days: 7,
      };

      const response = await axios.get(this.OPEN_METEO_API, { params });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch weather from Open-Meteo: ${(error as Error).message}`,
      );
    }
  }
}
