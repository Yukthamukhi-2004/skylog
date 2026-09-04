import { Controller, Get, Query } from "@nestjs/common";
import { WeatherService } from "./weather.service";

@Controller("weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(
    @Query("latitude") latitude: string,
    @Query("longitude") longitude: string,
  ) {
    return await this.weatherService.getWeather(
      Number(latitude),
      Number(longitude),
    );
  }
}
