export enum AlertSeverity {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARNING = 'WARNING',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL',
}

export interface NOTIFY_SETTING_V1 {
    version: 1;
    globalPushLevel?: AlertSeverity;
    globalEmailLevel?: AlertSeverity;
    globalSMSLevel?: AlertSeverity;

    // There will also be Notify per mission
}

export type USER_NOTIFY_SETTING = NOTIFY_SETTING_V1;

export type SpeedUnits = 'kn' | 'NM/h' | 'km/h' | 'm/s' | 'ft/s';
export type CurrentUnits = 'kn' | 'NM/h' | 'km/h' | 'm/s' | 'ft/s';
export type AngleUnits = 'abs' | 'rad' | 'deg';
export type DistanceUnits = 'NM' | 'km' | 'miles' | 'm' | 'ft';
export type TemperatureUnits = '°C' | '°F' | 'Kelvin';
export type DepthUnits = 'm' | 'Ft' | 'Fath';
export type AccelUnits = 'm/s²' | 'G' | 'ft/s²';
export type RotationUnits = 'deg/s' | 'rad/s';
export type PressureUnits = 'Pa' | 'mbar' | 'dbar' | 'bar' | 'psi';
export type PrecipitationUnits = 'mm' | 'inch' | 'points';
export interface UnitState {
    speedUnit: SpeedUnits;
    currentUnit: CurrentUnits;
    angleUnit: AngleUnits;
    distanceUnit: DistanceUnits;
    temperatureUnit: TemperatureUnits;
    depthUnit: DepthUnits;
    accelUnit: AccelUnits;
    rotationUnit: RotationUnits;
    pressureUnit: PressureUnits;
    precipitationUnit: PrecipitationUnits;
}

export type Palette = 'night' | 'dusk' | 'day' | 'bright';

export interface Dimming {
    autoBrightness: boolean;
    brightness: number;
    autoPalette: boolean;
    palette: Palette;
}

export interface BaseMap {
    basemap: string;
}

export interface USER_V1 {
    version: 1;
    dimming?: Dimming;
    units?: UnitState;
    map?: BaseMap;
}

export type USER_DATA = USER_V1;
