import type { ForecastTimeStep } from './ForecastTimeStep';
import type { ForecastUnits } from './ForecastUnits';

export type Forecast = {
    meta: {
        units: ForecastUnits;
        /**
         * Update time for this forecast
         */
        updated_at: string;
    };
    timeseries: Array<ForecastTimeStep>;
};
