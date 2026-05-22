import { API } from "../constants/apiUrls";
import { calcSPI } from "./archiveApi";
import { calcDroughtSeverity } from "./disasterLogic";

const FETCH_TIMEOUT_MS = 10000;

export async function fetchClimateData(lat: number, lon: number) {
  // Climate API uses historical model data — fetch past 90 days for drought SPI
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: fmt(start),
    end_date: fmt(end),
    daily: [
      "precipitation_sum",
      "soil_moisture_0_to_10cm_mean",
      "et0_fao_evapotranspiration",
      "temperature_2m_mean",
    ].join(","),
    models: "ERA5",
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API.CLIMATE}?${params}`, {
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      throw new Error("Climate data fetch timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) throw new Error("Climate data fetch failed");
  return res.json();
}

export async function fetchDroughtStatus(lat: number, lon: number) {
  const data = await fetchClimateData(lat, lon);
  const precipList: number[] = data?.daily?.precipitation_sum ?? [];
  const soilList: number[] = data?.daily?.soil_moisture_0_to_10cm_mean ?? [];
  const spi = calcSPI(precipList);
  const severity = calcDroughtSeverity(spi);
  const soilMoisture = soilList.length ? soilList[soilList.length - 1] : null;
  return { spi, severity, soilMoisture, raw: data };
}
