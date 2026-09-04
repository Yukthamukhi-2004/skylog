import { useCallback, useEffect, useState } from "react";
import { fetchAirQuality, getAQICategory } from "../Services/airQualityApi";
import { fetchPastWeather } from "../Services/archiveApi";
import { fetchClimateData } from "../Services/climateApi";
import { calcDroughtSeverity } from "../Services/disasterLogic";
import { fetchEarthquakes, Earthquake } from "../Services/earthquakeApi";
import { fetchElevation, getElevationRisk } from "../Services/elevationApi";
import { fetchFloodData } from "../Services/floodApi";
import { calcFloodSeverity } from "../Services/disasterLogic";
import { fetchMarineData } from "../Services/marineApi";
import { calcTsunamiRisk } from "../Services/disasterLogic";
import { fetchWeather } from "../Services/weatherApi";
import { getWeatherInfo } from "../components/home/weatherUtils";
import { useAppSelector } from "../store/hooks";

// ─── Types ────────────────────────────────────────────────────────────────

export interface HourlyData {
  time: string;
  temperature: number;
  precipitationProb: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
}

export interface DayData {
  date: string;
  label: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationSum: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  isPast: boolean;
  tempMean?: number;
}

export interface DisasterAlert {
  id: string;
  type: "earthquake" | "flood" | "tsunami" | "drought";
  title: string;
  location: string;
  severity: "DANGER" | "WARNING" | "WATCH" | "INFO" | "EXTREME" | "SEVERE" | "MODERATE";
  severityColor: string;
  time: number;
  lat: number;
  lon: number;
  description: string;
  distanceKm?: number;
}

export interface HealthInsight {
  type: "positive" | "warning" | "info";
  icon: string;
  message: string;
}

export interface HomeScreenData {
  loading: boolean;
  error: string | null;

  // Weather
  hourly: HourlyData[];
  days: DayData[];
  currentTemp: number;
  currentApparentTemp: number;
  currentHumidity: number;
  currentWind: number;
  currentWeatherCode: number;
  currentIsDay: number;
  aqi: { label: string; color: string; value: number };

  // Disasters
  earthquakes: Earthquake[];
  disasterAlerts: DisasterAlert[];

  // Local risk
  elevation: number | null;
  elevationRisk: { label: string; riskLevel: "high" | "moderate" | "low" } | null;
  floodRisk: { level: string; speed_kmh: number; reach_km: number; discharge: number } | null;
  droughtRisk: { level: string; score: number } | null;
  tsunamiRisk: { level: string; wave_height_m: number; speed_kmh: number; reach_km: number } | null;

  // Health
  healthInsights: HealthInsight[];

  // Brief
  brief: string;
}

function calcSPI(precipValues: number[]): number {
  if (!precipValues.length) return 0;
  const mean = precipValues.reduce((a, b) => a + b, 0) / precipValues.length;
  const std = Math.sqrt(
    precipValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / precipValues.length,
  );
  const recent = precipValues.slice(-7).reduce((a, b) => a + b, 0) / 7;
  return std === 0 ? 0 : +((recent - mean) / std).toFixed(2);
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(0);
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames[d.getDay()];
}

function generateBrief(
  days: DayData[],
  aqiLabel: string,
  alerts: DisasterAlert[],
  temp: number,
  apparentTemp: number,
  humidity: number,
  wind: number,
): string {
  const today = days.find((d) => d.label === "Today");
  const yesterday = days.find((d) => d.label === "Yesterday");
  const tomorrow = days.find((d) => d.label === "Tomorrow");

  const parts: string[] = [];

  if (today) {
    const wi = getWeatherInfo(today.weatherCode);
    parts.push(`${wi.icon} ${wi.label}, ${Math.round(today.tempMax)}°C / ${Math.round(today.tempMin)}°C.`);
  } else {
    parts.push(`🌡️ Current: ${Math.round(temp)}°C (feels like ${Math.round(apparentTemp)}°C).`);
  }

  if (yesterday && today) {
    const diff = Math.round(today.tempMax - yesterday.tempMax);
    if (diff > 2) parts.push(`📈 ${diff}°C warmer than yesterday.`);
    else if (diff < -2) parts.push(`📉 ${Math.abs(diff)}°C cooler than yesterday.`);
    else parts.push(`↔️ Similar to yesterday.`);
  }

  if (today && today.precipitationSum > 0) {
    parts.push(`🌧️ ${today.precipitationSum}mm rain expected.`);
  }

  parts.push(`💧 Humidity ${humidity}% · 💨 Wind ${wind} km/h · ${aqiLabel} air.`);

  if (tomorrow) {
    const tWi = getWeatherInfo(tomorrow.weatherCode);
    parts.push(`📅 Tomorrow: ${tWi.icon} ${tWi.label}, ${Math.round(tomorrow.tempMax)}°C / ${Math.round(tomorrow.tempMin)}°C.`);
  }

  const dangerAlerts = alerts.filter((a) => a.severity === "DANGER" || a.severity === "EXTREME");
  if (dangerAlerts.length > 0) {
    const top = dangerAlerts[0];
    parts.push(`🚨 ${top.type.toUpperCase()}: ${top.title} near ${top.location}.`);
  }

  return parts.join(" ");
}

function generateHealthInsights(
  temp: number,
  humidity: number,
  wind: number,
  weatherCode: number,
  uvIndexMax: number,
  aqiLabel: string,
  aqiValue: number,
  healthConcerns: string[],
  allergies: string[],
  skinIssues: string[],
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  // UV check
  if (uvIndexMax >= 6) {
    insights.push({
      type: "warning",
      icon: "☀️",
      message: `UV index ${uvIndexMax} is high. Wear SPF 50+ and limit sun exposure.`,
    });
  } else {
    insights.push({
      type: "positive",
      icon: "☀️",
      message: `UV index ${uvIndexMax} is low. Safe to be outdoors.`,
    });
  }

  // Heat check
  if (temp >= 35) {
    insights.push({
      type: "warning",
      icon: "🥵",
      message: `Extreme heat (${temp}°C). Stay hydrated and avoid peak sun hours.`,
    });
  } else if (temp >= 30) {
    if (healthConcerns.some((c) => c.toLowerCase().includes("heat"))) {
      insights.push({
        type: "warning",
        icon: "🌡️",
        message: `High of ${temp}°C — take precautions if you're sensitive to heat.`,
      });
    }
  }

  // Cold check
  if (temp <= 5) {
    if (healthConcerns.some((c) => c.toLowerCase().includes("cold"))) {
      insights.push({
        type: "warning",
        icon: "🥶",
        message: `Low of ${temp}°C — cold sensitivity risk. Dress warmly.`,
      });
    }
  }

  // Allergy checks
  if (allergies.length > 0) {
    const pollenConditions = weatherCode === 0 || weatherCode === 1 || weatherCode === 2;
    const highWind = wind >= 20;
    if (pollenConditions && highWind) {
      insights.push({
        type: "warning",
        icon: "🌿",
        message: `Clear & windy — high pollen dispersion. Take your allergy medication.`,
      });
    } else if (weatherCode >= 61 && weatherCode <= 82) {
      insights.push({
        type: "positive",
        icon: "🌧️",
        message: `Rain helps wash away pollen — good news for your allergies.`,
      });
    }
  }

  // Skin issues
  if (skinIssues.length > 0) {
    if (humidity < 30) {
      insights.push({
        type: "warning",
        icon: "🧴",
        message: `Low humidity (${humidity}%) may worsen dry skin. Use moisturizer.`,
      });
    }
    if (temp >= 30 && skinIssues.some((s) => s.toLowerCase().includes("rash") || s.toLowerCase().includes("sweat"))) {
      insights.push({
        type: "warning",
        icon: "💦",
        message: `Heat & humidity increase sweat rash risk. Keep skin cool & dry.`,
      });
    }
  }

  // AQI
  if (aqiValue > 100) {
    insights.push({
      type: "warning",
      icon: "😮‍💨",
      message: `Air quality is ${aqiLabel}. Limit outdoor exertion.`,
    });
  }

  // Asthma / respiratory
  if (healthConcerns.some((c) => c.toLowerCase().includes("asthma") || c.toLowerCase().includes("lung"))) {
    if (aqiValue > 50 || (weatherCode >= 45 && weatherCode <= 48)) {
      insights.push({
        type: "warning",
        icon: "🫁",
        message: `Poor air quality or fog may trigger respiratory issues. Keep your inhaler handy.`,
      });
    }
  }

  // Thunderstorm
  if (weatherCode >= 95) {
    insights.push({
      type: "info",
      icon: "⛈️",
      message: `Thunderstorm detected — stay indoors. Avoid open areas and tall objects.`,
    });
  }

  // Joint pain / cold
  if (healthConcerns.some((c) => c.toLowerCase().includes("joint"))) {
    if (temp < 15 && humidity > 60) {
      insights.push({
        type: "info",
        icon: "🦴",
        message: `Cold & damp weather may worsen joint pain. Keep warm and stay active.`,
      });
    }
  }

  return insights.slice(0, 4);
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useHomeScreenData(coords: { latitude: number; longitude: number } | null) {
  const [data, setData] = useState<HomeScreenData>({
    loading: true,
    error: null,
    hourly: [],
    days: [],
    currentTemp: 0,
    currentApparentTemp: 0,
    currentHumidity: 0,
    currentWind: 0,
    currentWeatherCode: 0,
    currentIsDay: 1,
    aqi: { label: "Loading...", color: "#999", value: 0 },
    earthquakes: [],
    disasterAlerts: [],
    elevation: null,
    elevationRisk: null,
    floodRisk: null,
    droughtRisk: null,
    tsunamiRisk: null,
    healthInsights: [],
    brief: "",
  });

  // Refetch counter for pull-to-refresh
  const [refetchCounter, setRefetchCounter] = useState(0);

  const climateHealth = useAppSelector((s) => s.profile?.climateHealth);
  const healthConcerns = climateHealth?.healthConcerns ?? [];
  const allergies = climateHealth?.allergies ?? [];
  const skinIssues = climateHealth?.skinIssues ?? [];

  const triggerRefetch = useCallback(() => {
    setRefetchCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!coords) return;

    let isMounted = true;
    setData((prev) => ({ ...prev, loading: true, error: null }));

    async function fetchAll() {
      try {
        const { latitude, longitude } = coords;
        const cleanLat = Number(latitude.toFixed(4));
        const cleanLon = Number(longitude.toFixed(4));

        const [
          forecastRes,
          airRes,
          pastRes,
          eqRes,
          elevRes,
          climateRes,
          floodRes,
          marineRes,
        ] = await Promise.allSettled([
          fetchWeather(cleanLat, cleanLon),
          fetchAirQuality(cleanLat, cleanLon),
          (async () => {
            // Fetch 2 days back to ensure we get yesterday's data
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 2);
            const fmt = (d: Date) => d.toISOString().split("T")[0];
            return fetchPastWeather(cleanLat, cleanLon, fmt(start), fmt(end));
          })(),
          fetchEarthquakes(),
          fetchElevation(cleanLat, cleanLon),
          fetchClimateData(cleanLat, cleanLon),
          fetchFloodData(cleanLat, cleanLon),
          fetchMarineData(cleanLat, cleanLon),
        ]);

        if (!isMounted) return;

        const forecast = forecastRes.status === "fulfilled" ? forecastRes.value : null;
        const airQuality = airRes.status === "fulfilled" ? airRes.value : null;
        const pastWeather = pastRes.status === "fulfilled" ? pastRes.value : null;
        const earthquakes = eqRes.status === "fulfilled" ? eqRes.value : [];
        const elevation = elevRes.status === "fulfilled" ? elevRes.value : null;
        const climateData = climateRes.status === "fulfilled" ? climateRes.value : null;
        const floodData = floodRes.status === "fulfilled" ? floodRes.value : null;
        const marineData = marineRes.status === "fulfilled" ? marineRes.value : null;

        // Current weather
        const currentTemp = forecast?.current?.temperature_2m ?? 0;
        const currentApparentTemp = forecast?.current?.apparent_temperature ?? currentTemp;
        const currentHumidity = forecast?.current?.relative_humidity_2m ?? 0;
        const currentWind = forecast?.current?.wind_speed_10m ?? 0;
        const currentWeatherCode = forecast?.current?.weather_code ?? 0;
        const currentIsDay = forecast?.current?.is_day ?? 1;

        // AQI
        const rawAqi = airQuality?.current?.us_aqi ?? 0;
        const aqiDetails = getAQICategory(rawAqi);

        // Hourly data
        const hourlyRaw = forecast?.hourly;
        const hourly: HourlyData[] = [];
        if (hourlyRaw?.time) {
          const now = new Date();
          const nowStr = now.toISOString().slice(0, 13) + ":00";
          let startIdx = hourlyRaw.time.findIndex((t: string) => t >= nowStr);
          if (startIdx < 0) startIdx = 0;
          const endIdx = Math.min(startIdx + 24, hourlyRaw.time.length);
          for (let i = startIdx; i < endIdx; i++) {
            hourly.push({
              time: hourlyRaw.time[i],
              temperature: Math.round(hourlyRaw.temperature_2m?.[i] ?? 0),
              precipitationProb: hourlyRaw.precipitation_probability?.[i] ?? 0,
              windSpeed: hourlyRaw.wind_speed_10m?.[i] ?? 0,
              uvIndex: hourlyRaw.uv_index?.[i] ?? 0,
              weatherCode: hourlyRaw.weather_code?.[i] ?? currentWeatherCode,
            });
          }
        }

        // Daily data
        const dailyRaw = forecast?.daily;
        const days: DayData[] = [];
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const dayBeforeYesterday = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];

        // Yesterday from archive (try yesterday first, then day before)
        if (pastWeather?.daily) {
          let yIdx = pastWeather.daily.time?.findIndex((t: string) => t === yesterday);
          if (yIdx < 0) yIdx = pastWeather.daily.time?.findIndex((t: string) => t === dayBeforeYesterday);
          if (yIdx >= 0) {
            days.push({
              date: yesterday,
              label: "Yesterday",
              tempMax: pastWeather.daily.temperature_2m_max?.[yIdx] ?? 0,
              tempMin: pastWeather.daily.temperature_2m_min?.[yIdx] ?? 0,
              tempMean: pastWeather.daily.temperature_2m_mean?.[yIdx],
              weatherCode: 0,
              precipitationSum: pastWeather.daily.precipitation_sum?.[yIdx] ?? 0,
              uvIndexMax: 0,
              sunrise: "",
              sunset: "",
              isPast: true,
            });
          }
        }

        // Today and forecast from daily
        if (dailyRaw?.time) {
          for (let i = 0; i < Math.min(3, dailyRaw.time.length); i++) {
            const dateStr = dailyRaw.time[i];
            if (dateStr === yesterday) continue;
            const label = dateStr === today ? "Today" : i === 1 ? "Tomorrow" : formatDayLabel(dateStr);
            days.push({
              date: dateStr,
              label,
              tempMax: dailyRaw.temperature_2m_max?.[i] ?? 0,
              tempMin: dailyRaw.temperature_2m_min?.[i] ?? 0,
              weatherCode: dailyRaw.weather_code?.[i] ?? 0,
              precipitationSum: dailyRaw.precipitation_sum?.[i] ?? 0,
              uvIndexMax: dailyRaw.uv_index_max?.[i] ?? 0,
              sunrise: dailyRaw.sunrise?.[i] ?? "",
              sunset: dailyRaw.sunset?.[i] ?? "",
              isPast: false,
            });
          }
        }

        days.sort((a, b) => a.date.localeCompare(b.date));

        // Disaster alerts
        const disasterAlerts: DisasterAlert[] = [];

        const dangerQuakes = earthquakes
          .filter((eq) => eq.magnitude >= 5)
          .slice(0, 5);
        for (const eq of dangerQuakes) {
          const severity = eq.magnitude >= 7 ? "DANGER" : eq.magnitude >= 6 ? "WARNING" : "WATCH";
          const color = eq.magnitude >= 7 ? "#ef4444" : eq.magnitude >= 6 ? "#f97316" : "#eab308";
          disasterAlerts.push({
            id: `eq-${eq.id}`,
            type: "earthquake",
            title: `M${eq.magnitude} Earthquake`,
            location: eq.place,
            severity,
            severityColor: color,
            time: eq.time,
            lat: eq.lat,
            lon: eq.lon,
            description: `Depth: ${eq.depth_km}km`,
            distanceKm: distanceKm(cleanLat, cleanLon, eq.lat, eq.lon),
          });
        }

        if (floodData?.daily?.river_discharge?.[0]) {
          const discharge = floodData.daily.river_discharge[0];
          const elevationVal = elevation ?? 0;
          const floodSeverity = calcFloodSeverity(discharge, elevationVal);
          if (floodSeverity.level !== "WATCH" || floodSeverity.discharge > 300) {
            disasterAlerts.push({
              id: "flood-local",
              type: "flood",
              title: `Flood Risk: ${floodSeverity.level}`,
              location: "Your area",
              severity: floodSeverity.level as any,
              severityColor: floodSeverity.level === "DANGER" ? "#ef4444" : floodSeverity.level === "WARNING" ? "#f97316" : "#eab308",
              time: Date.now(),
              lat: cleanLat,
              lon: cleanLon,
              description: `Discharge: ${floodSeverity.discharge} m³/s · Speed: ${floodSeverity.speed_kmh} km/h`,
            });
          }
        }

        if (marineData?.current) {
          const waveH = marineData.current.wave_height ?? 0;
          const waveP = marineData.current.wave_period ?? 0;
          const tsunamiRisk_ = calcTsunamiRisk(waveH, waveP, elevation ?? 0);
          if (tsunamiRisk_) {
            disasterAlerts.push({
              id: "tsunami-local",
              type: "tsunami",
              title: "Tsunami Risk Detected",
              location: "Your coastal area",
              severity: "DANGER",
              severityColor: "#ef4444",
              time: Date.now(),
              lat: cleanLat,
              lon: cleanLon,
              description: `Wave: ${waveH}m · Speed: ${tsunamiRisk_.speed_kmh} km/h`,
            });
          }
        }

        if (climateData?.daily?.precipitation_sum) {
          const precipList: number[] = climateData.daily.precipitation_sum;
          const spi = calcSPI(precipList);
          const droughtSeverity = calcDroughtSeverity(spi);
          if (droughtSeverity) {
            disasterAlerts.push({
              id: "drought-local",
              type: "drought",
              title: `Drought: ${droughtSeverity.level}`,
              location: "Your region",
              severity: droughtSeverity.level as any,
              severityColor: droughtSeverity.level === "EXTREME" ? "#ef4444" : droughtSeverity.level === "SEVERE" ? "#f97316" : "#eab308",
              time: Date.now(),
              lat: cleanLat,
              lon: cleanLon,
              description: `SPI: ${spi} · Severity: ${droughtSeverity.level}`,
            });
          }
        }

        disasterAlerts.sort((a, b) => {
          const severityOrder = { DANGER: 0, EXTREME: 0, WARNING: 1, SEVERE: 1, MODERATE: 2, WATCH: 2, INFO: 3 } as const;
          const aOrder = severityOrder[a.severity as keyof typeof severityOrder] ?? 4;
          const bOrder = severityOrder[b.severity as keyof typeof severityOrder] ?? 4;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return b.time - a.time;
        });

        const elevationRisk = elevation ? getElevationRisk(elevation) : null;

        const maxDailyUv = Math.max(...days.map((d) => d.uvIndexMax), 0);
        const healthInsights = generateHealthInsights(
          currentTemp, currentHumidity, currentWind, currentWeatherCode,
          maxDailyUv, aqiDetails.label, rawAqi,
          healthConcerns, allergies, skinIssues,
        );

        const brief = generateBrief(days, aqiDetails.label, disasterAlerts, currentTemp, currentApparentTemp, currentHumidity, currentWind);

        setData({
          loading: false,
          error: null,
          hourly,
          days,
          currentTemp,
          currentApparentTemp,
          currentHumidity,
          currentWind,
          currentWeatherCode,
          currentIsDay,
          aqi: { label: aqiDetails.label, color: aqiDetails.color, value: rawAqi },
          earthquakes,
          disasterAlerts,
          elevation,
          elevationRisk,
          floodRisk: floodData?.daily?.river_discharge?.[0]
            ? calcFloodSeverity(floodData.daily.river_discharge[0], elevation ?? 0)
            : null,
          droughtRisk: climateData?.daily?.precipitation_sum
            ? calcDroughtSeverity(calcSPI(climateData.daily.precipitation_sum))
            : null,
          tsunamiRisk: marineData?.current
            ? calcTsunamiRisk(marineData.current.wave_height ?? 0, marineData.current.wave_period ?? 0, elevation ?? 0)
            : null,
          healthInsights,
          brief,
        });
      } catch (err: any) {
        if (isMounted) {
          setData((prev) => ({
            ...prev,
            loading: false,
            error: err.message || "Failed to load home screen data",
          }));
        }
      }
    }

    fetchAll();
    return () => { isMounted = false; };
  }, [coords, refetchCounter]);

  return { ...data, triggerRefetch };
}
