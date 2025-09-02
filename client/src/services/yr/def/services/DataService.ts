import { request as __request } from '../core/request';
import type { METJSONForecast } from '../models/METJSONForecast';

export class DataService {
    /**
     * Weather forecast for a specified place
     * @returns string Success
     * @throws ApiError
     */
    public static async getDataService(): Promise<string> {
        const result = await __request({
            method: 'GET',
            path: `/status`,
        });
        return result.body;
    }

    /**
     * Weather forecast for a specified place
     * @param lat Latitude
     * @param lon Longitude
     * @param format format code (file extension)
     * @param altitude Whole meters above sea level
     * @returns string Success
     * @throws ApiError
     */
    public static async getDataService1(
        lat: number,
        lon: number,
        format: 'xml',
        altitude?: number,
    ): Promise<string> {
        const result = await __request({
            method: 'GET',
            path: `/classic.${format}`,
            query: {
                lat: lat,
                lon: lon,
                altitude: altitude,
            },
        });
        return result.body;
    }

    /**
     * Weather forecast for a specified place
     * @param format format code (file extension)
     * @returns string Success
     * @throws ApiError
     */
    public static async getDataService2(format: 'json'): Promise<string> {
        const result = await __request({
            method: 'GET',
            path: `/status.${format}`,
        });
        return result.body;
    }

    /**
     * Weather forecast for a specified place
     * @param lat Latitude
     * @param lon Longitude
     * @param format format code (file extension)
     * @param altitude Whole meters above sea level
     * @returns METJSONForecast Success
     * @throws ApiError
     */
    public static async getDataService3(
        lat: number,
        lon: number,
        format: 'json',
        altitude?: number,
    ): Promise<METJSONForecast> {
        const result = await __request({
            method: 'GET',
            path: `/compact.${format}`,
            query: {
                lat: lat,
                lon: lon,
                altitude: altitude,
            },
        });
        return result.body;
    }

    /**
     * Weather forecast for a specified place
     * @param lat Latitude
     * @param lon Longitude
     * @param altitude Whole meters above sea level
     * @returns string Success
     * @throws ApiError
     */
    public static async getDataService4(
        lat: number,
        lon: number,
        altitude?: number,
    ): Promise<string> {
        const result = await __request({
            method: 'GET',
            path: `/classic`,
            query: {
                lat: lat,
                lon: lon,
                altitude: altitude,
            },
        });
        return result.body;
    }

    /**
     * Weather forecast for a specified place
     * @param lat Latitude
     * @param lon Longitude
     * @param format format code (file extension)
     * @param altitude Whole meters above sea level
     * @returns METJSONForecast Success
     * @throws ApiError
     */
    public static async getDataService5(
        lat: number,
        lon: number,
        format: 'json',
        altitude?: number,
    ): Promise<METJSONForecast> {
        const result = await __request({
            method: 'GET',
            path: `/complete.${format}`,
            query: {
                lat: lat,
                lon: lon,
                altitude: altitude,
            },
        });
        return result.body;
    }

    /**
     * Weather forecast for a specified place
     * @param lat Latitude
     * @param lon Longitude
     * @param altitude Whole meters above sea level
     * @returns METJSONForecast Success
     * @throws ApiError
     */
    public static async getDataService6(
        lat: number,
        lon: number,
        altitude?: number,
    ): Promise<METJSONForecast> {
        const result = await __request({
            method: 'GET',
            path: `/complete`,
            query: {
                lat: lat,
                lon: lon,
                altitude: altitude,
            },
        });
        return result.body;
    }

    /**
     * Weather forecast for a specified place
     * @param lat Latitude
     * @param lon Longitude
     * @param altitude Whole meters above sea level
     * @returns METJSONForecast Success
     * @throws ApiError
     */
    public static async getDataService7(
        lat: number,
        lon: number,
        altitude?: number,
    ): Promise<METJSONForecast> {
        const result = await __request({
            method: 'GET',
            path: `/compact`,
            query: {
                lat: lat,
                lon: lon,
                altitude: altitude,
            },
        });
        return result.body;
    }
}
