import axios from "axios";

const DEFAULT_API_TIMEOUT = 30000;
const RETRY_DELAYS_MS = [0, 500, 1500]; // first attempt immediately, then 2 quick retries
const BACKEND_API =
  process.env.EXPO_PUBLIC_BACKEND_API || "http://localhost:3000";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWeather(lat: number, lon: number) {
  if (lat === undefined || lon === undefined) {
    throw new Error("Missing coordinates");
  }

  const targetUrl = `${BACKEND_API}/weather`;
  const params = {
    latitude: lat.toString(),
    longitude: lon.toString(),
  };

  let lastError: any;

  // Retry with quick backoff
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    if (RETRY_DELAYS_MS[attempt] > 0) {
      await sleep(RETRY_DELAYS_MS[attempt]);
    }

    try {
      console.log("Requesting Weather from backend:", targetUrl, {
        attempt,
        params,
      });

      const response = await axios.get(targetUrl, {
        params,
        timeout: DEFAULT_API_TIMEOUT,
      });

      return response.data;
    } catch (error) {
      lastError = error;
      if ((error as any)?.code === "ECONNABORTED") {
        console.warn("Weather fetch timed out", {
          attempt,
          lat,
          lon,
          targetUrl,
        });
      }
      // continue retries
    }
  }

  if ((lastError as any)?.code === "ECONNABORTED") {
    throw new Error("Weather fetch timed out");
  }
  throw lastError;
}
