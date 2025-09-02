/**
 * Weather parameters valid for a specified time period.
 */
export type ForecastTimePeriod = {
    /**
     * Maximum amount of precipitation for this period
     */
    precipitation_amount_max?: number;
    /**
     * Maximum ultraviolet index if sky is clear
     */
    ultraviolet_index_clear_sky_max?: number;
    /**
     * Probability of any precipitation coming for this period
     */
    probability_of_precipitation?: number;
    /**
     * Minimum amount of precipitation for this period
     */
    precipitation_amount_min?: number;
    /**
     * Maximum air temperature in period
     */
    air_temperature_max?: number;
    /**
     * Probability of any thunder coming for this period
     */
    probability_of_thunder?: number;
    /**
     * Best estimate for amount of precipitation for this period
     */
    precipitation_amount?: number;
    /**
     * Minimum air temperature in period
     */
    air_temperature_min?: number;
};
