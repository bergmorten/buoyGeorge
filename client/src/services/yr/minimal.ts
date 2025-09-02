import type { ForecastMinimal, METJSONForecast, MinimalTimeStep } from './def';

export const convertToMinimal = (
    forecast: METJSONForecast,
): ForecastMinimal => {
    const steps: MinimalTimeStep[] = [];
    const lat = forecast.geometry.coordinates.at(1);
    const lon = forecast.geometry.coordinates.at(0);
    if (lat === undefined || lon === undefined)
        throw new Error('Invalid coordinates');
    const minimal: ForecastMinimal = {
        updated_at: forecast.properties.meta.updated_at,
        location: {
            latitude: lat,
            longitude: lon,
        },
        timesteps: steps,
    };
    let startTimestamp: Date | undefined;
    for (const step of forecast.properties.timeseries) {
        const next =
            step.data.next_1_hours ||
            step.data.next_6_hours ||
            step.data.next_12_hours;
        // Should precipitation values be dived by number of hours?

        const instant = step.data.instant;
        if (!instant.details) continue;
        if (!startTimestamp) startTimestamp = new Date(step.time);
        const now = new Date(step.time);
        if (now.getTime() - startTimestamp.getTime() > 24 * 60 * 60 * 1000)
            break;
        steps.push({
            time: step.time,
            press: instant.details.air_pressure_at_sea_level,
            temp: instant.details.air_temperature,
            cloud: instant.details.cloud_area_fraction,
            wdir: instant.details.wind_from_direction,
            wspeed: instant.details.wind_speed,
            wgust: instant.details.wind_speed_of_gust,
            fog: instant.details.fog_area_fraction,
            rain: next?.details.precipitation_amount,
            rainMax: next?.details.precipitation_amount_max,
            code: next?.summary.symbol_code,
        });
    }

    return minimal;
};
