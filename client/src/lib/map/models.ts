import type { useMeasure } from './useMeasure';
import type { useMap } from './useMap';

export type UseMap = ReturnType<typeof useMap>;
export type UseMeasure = ReturnType<typeof useMeasure>;
export type BaseMaps = 'esri' | 'osm' | 'noaa' | 'emod';

export interface SourceLayer {
    projection: string;
    url: string;
    attribution: string;
}

type BarUnits = 'degrees' | 'imperial' | 'us' | 'nautical' | 'metric';

interface ScaleBarOptions {
    type: 'scalebar';
    unit: BarUnits;
    steps: number;
    text: boolean;
    minWidth: number;
}

interface ScaleLineOptions {
    type: 'scaleline';
    unit: BarUnits;
}

export interface LayerDefXYZ {
    type: 'XYZ';
    extent?: [number, number, number, number];
    projection: string;
    url: string;
    attribution: string;
    maxZoom?: number;
    minZoom?: number;
}

export interface LayerDefWMTS {
    type: 'WMTS';
    extent?: [number, number, number, number];
    projection: string;
    url: string;
    matrixSet: string;
    layer: string;
    attribution: string;
    maxZoom?: number;
    minZoom?: number;
}

export interface LayerDefWMS {
    type: 'WMS';
    extent?: [number, number, number, number];
    projection: string;
    url: string;
    attribution: string;
    transition?: number;
    serverType: 'geoserver';
    params: {
        [x: string]: unknown;
    };
    maxZoom?: number;
    minZoom?: number;
}

export type LayerDef = LayerDefXYZ | LayerDefWMTS | LayerDefWMS;

export interface LatLon {
    lat: number;
    lon: number;
}

export interface DMS {
    degrees: number;
    minutes: number;
    seconds: number;
    direction: 'N' | 'S' | 'E' | 'W';
}

export interface LatLonDMS {
    lat: DMS;
    lon: DMS;
}

export interface Extent {
    upperLeft: LatLon;
    lowerRight: LatLon;
}

export type ScaleOptions = ScaleBarOptions | ScaleLineOptions;
export type AreaShapes = 'Area_Square' | 'Area_Rectangle' | 'Area_Polygon';
export type DrawTypes = 'Route' | 'Assembly' | 'DangerZone' | AreaShapes;
