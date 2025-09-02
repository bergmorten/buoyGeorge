export interface MinimalTimeStep {
    time: string; // UTC time string
    press?: number | undefined; // Pressure at sea level
    temp?: number | undefined; // Air temperature
    cloud?: number | undefined; // Cloud cover fraction %
    wdir?: number | undefined; // Wind direction in degrees
    wspeed?: number | undefined; // Wind speed m/s
    wgust?: number | undefined; // Wind gust speed m/s
    fog?: number | undefined; // Fog cover fraction %
    rain?: number | undefined; // Precipitation amount mm
    rainMax?: number | undefined; // Precipitation amount mm
    code?: string | undefined; // Weather symbol code
}

export interface ForecastMinimal {
    updated_at: string; // UTC time string
    location: {
        latitude: number;
        longitude: number;
    };
    timesteps: MinimalTimeStep[];
}
