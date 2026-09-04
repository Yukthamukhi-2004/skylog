import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WeatherModule } from "./weather/weather.module";

// App module with weather and other services
@Module({
  imports: [WeatherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
