import type { Forecast } from './Forecast';
import type { PointGeometry } from './PointGeometry';

export type METJSONForecast = {
    type: METJSONForecastType;
    properties: Forecast;
    geometry: PointGeometry;
};

export enum METJSONForecastType {
    FEATURE = 'Feature',
}
