import type { ForecastSummary } from './ForecastSummary';
import type { ForecastTimeInstant } from './ForecastTimeInstant';
import type { ForecastTimePeriod } from './ForecastTimePeriod';

export type ForecastTimeStep = {
    /**
     * Forecast for a specific time
     */
    data: {
        /**
         * Parameters with validity times over one hour. Will not exist for all time steps.
         */
        next_1_hours?: {
            details: ForecastTimePeriod;
            summary: ForecastSummary;
        };
        /**
         * Parameters with validity times over six hours. Will not exist for all time steps.
         */
        next_6_hours?: {
            details: ForecastTimePeriod;
            summary: ForecastSummary;
        };
        /**
         * Parameters which applies to this exact point in time
         */
        instant: {
            details?: ForecastTimeInstant;
        };
        /**
         * Parameters with validity times over twelve hours. Will not exist for all time steps.
         */
        next_12_hours?: {
            summary: ForecastSummary;
            details: ForecastTimePeriod;
        };
    };
    /**
     * The time these forecast values are valid for. Timestamp in format YYYY-MM-DDThh:mm:ssZ (ISO 8601)
     */
    time: string;
};
