import { THRESHOLDS as T } from "../constants";

export function calcFloodSeverity(discharge: number, elevation: number) {
  const speed_ms = Math.pow(discharge / 50, 0.4); // Manning approx
  const speed_kmh = speed_ms * 3.6;
  const reach_km = elevation > 0 ? (discharge / elevation) * 0.1 : 10;
  const level =
    discharge > T.flood.discharge_danger
      ? "DANGER"
      : discharge > T.flood.discharge_warning
        ? "WARNING"
        : "WATCH";
  return {
    level,
    speed_kmh: +speed_kmh.toFixed(1),
    reach_km: +reach_km.toFixed(1),
    discharge,
  };
}

export function calcTsunamiRisk(
  wave_height_m: number,
  period_s: number,
  elevation: number,
) {
  const period_min = period_s / 60;
  if (
    wave_height_m < T.tsunami.wave_height_m ||
    period_min < T.tsunami.wave_period_min
  )
    return null;
  const depth_m = 4000; // avg ocean depth
  const speed_kmh = Math.sqrt(9.81 * depth_m) * 3.6;
  // For coastal areas (elevation <= 0), use a different approach or cap the reach
  const reach_km =
    elevation > 0
      ? Math.min((wave_height_m * 1000) / elevation, 100) // Cap at reasonable max
      : wave_height_m * 2; // Simplified coastal reach estimate
  return {
    level: "DANGER",
    wave_height_m,
    speed_kmh: +speed_kmh.toFixed(0),
    reach_km: +reach_km.toFixed(1),
  };
}

export function calcDroughtSeverity(spi: number) {
  if (!Number.isFinite(spi)) return null;
  const { spi_extreme, spi_severe, spi_moderate } = T.drought;
  return spi <= spi_extreme
    ? { level: "EXTREME", score: 5 }
    : spi <= spi_severe
      ? { level: "SEVERE", score: 4 }
      : spi <= spi_moderate
        ? { level: "MODERATE", score: 3 }
        : null;
}
