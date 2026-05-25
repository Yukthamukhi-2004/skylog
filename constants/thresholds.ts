export const THRESHOLDS = {
  flood: {
    discharge_danger: 1000,
    discharge_warning: 500,
  },
  tsunami: {
    wave_height_m: 2.0,
    wave_period_min: 1,
  },
  drought: {
    spi_extreme: -2.0,
    spi_severe: -1.5,
    spi_moderate: -1.0,
  },
  earthquake: {
    radius_km: 500,
    magnitude_danger: 7.0,
    magnitude_warning: 6.0,
    magnitude_watch: 5.0,
  },
};

// These are sensible defaults for development; adjust to your domain thresholds.
