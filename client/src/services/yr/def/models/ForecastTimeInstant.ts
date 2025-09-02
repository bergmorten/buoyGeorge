/**
 * Weather parameters valid for a specific point in time.
 */
export type ForecastTimeInstant = {
    /**
     * Amount of sky covered by clouds at high elevation.
     */
    cloud_area_fraction_high?: number;
    /**
     * Dew point temperature at sea level
     */
    dew_point_temperature?: number;
    /**
     * Speed of wind gust
     */
    wind_speed_of_gust?: number;
    /**
     * Amount of sky covered by clouds.
     */
    cloud_area_fraction?: number;
    /**
     * Amount of sky covered by clouds at medium elevation.
     */
    cloud_area_fraction_medium?: number;
    /**
     * Amount of area covered by fog.
     */
    fog_area_fraction?: number;
    /**
     * Speed of wind
     */
    wind_speed?: number;
    /**
     * Amount of sky covered by clouds at low elevation.
     */
    cloud_area_fraction_low?: number;
    /**
     * The directon which moves towards
     */
    wind_from_direction?: number;
    /**
     * Amount of humidity in the air.
     */
    relative_humidity?: number;
    /**
     * Air temperature
     */
    air_temperature?: number;
    /**
     * Air pressure at sea level
     */
    air_pressure_at_sea_level?: number;
};
