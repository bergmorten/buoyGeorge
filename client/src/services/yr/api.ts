// https://www.npmjs.com/package/openapi-typescript-codegen
import { DataService, OpenAPI } from './def';
import { convertToMinimal } from './minimal';
import type { ForecastTimeStep, METJSONForecast } from './def';

type TimeStepData = ForecastTimeStep['data'];
export interface TimeStep extends TimeStepData {
  time: Date;
}

const yrApi = () => {
  OpenAPI.BASE = 'https://api.met.no/weatherapi/locationforecast/2.0';
  const getForecast = async (lat: number, lon: number) => {
    return await DataService.getDataService5(lat, lon, 'json', 0);
  };

  const parseTimeStep = (timeStep: ForecastTimeStep): TimeStep => {
    return { ...timeStep.data, time: new Date(timeStep.time) };
  };

  const getSummaryNow = (forecast: METJSONForecast) => {
    const properties = forecast.properties;
    const now = properties.timeseries[0];
    if (now) return parseTimeStep(now);
    return undefined;
  };

  const getForecastMinimal = async (lat: number, lon: number) => {
    const fullForecast = await getForecast(lat, lon);
    return convertToMinimal(fullForecast);
  };

  return { getForecast, getSummaryNow, getForecastMinimal };
};

const api = yrApi();
export default api;
