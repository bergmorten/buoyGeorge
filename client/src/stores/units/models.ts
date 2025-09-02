export type SpeedUnits = 'kn' | 'NM/h' | 'km/h' | 'm/s' | 'ft/s';
export type CurrentUnits = 'kn' | 'NM/h' | 'km/h' | 'm/s' | 'ft/s';
export type AngleUnits = 'abs' | 'rad' | 'deg';
export type LocationUnits = 'dd' | 'dms';
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
  locationUnit: LocationUnits;
  distanceUnit: DistanceUnits;
  temperatureUnit: TemperatureUnits;
  depthUnit: DepthUnits;
  accelUnit: AccelUnits;
  rotationUnit: RotationUnits;
  pressureUnit: PressureUnits;
  precipitationUnit: PrecipitationUnits;
}
