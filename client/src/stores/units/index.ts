import { defineStore } from 'pinia';
import type { UnitState } from './models';
import { reactive, toRaw, toRefs } from 'vue';
import type { LatLon, LatLonDMS, DMS } from 'client/lib/map/models';
export const useUnitStore = defineStore('units', () => {
    const kn2ms = 0.51444444444444;
    const state = reactive<UnitState>({
        speedUnit: 'm/s',
        currentUnit: 'm/s',
        angleUnit: 'deg',
        locationUnit: 'dd',
        distanceUnit: 'm',
        temperatureUnit: '°C',
        depthUnit: 'm',
        accelUnit: 'm/s²',
        rotationUnit: 'rad/s',
        pressureUnit: 'dbar',
        precipitationUnit: 'mm',
    });

    const convertPrecipitation = (precipitationSI: number) => {
        switch (state.precipitationUnit) {
            case 'inch':
                return precipitationSI * 0.0393700787;
            case 'points':
                return precipitationSI * 0.0393700787 * 100;
            default:
                return precipitationSI;
        }
    };
    const stringPrecipitation = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';
        const precision =
            digits ?? (state.precipitationUnit === 'inch' ? 2 : 0);
        return (
            convertPrecipitation(value).toFixed(precision) +
            ' ' +
            state.precipitationUnit
        );
    };
    const reversePrecipitation = (precipitationScaled: number) => {
        switch (state.precipitationUnit) {
            case 'inch':
                return precipitationScaled / 0.0393700787;
            case 'points':
                return precipitationScaled / 0.0393700787 / 100;
            default:
                return precipitationScaled;
        }
    };
    const convertDistance = (distanceSI: number) => {
        switch (state.distanceUnit) {
            case 'NM':
                return distanceSI / 1852;
            case 'km':
                return distanceSI / 1000;
            case 'miles':
                return distanceSI / 1609.344;
            case 'ft':
                return distanceSI / 0.3048;
            default:
                return distanceSI;
        }
    };
    const stringDistance = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';
        const precision =
            digits ??
            (state.distanceUnit === 'm' || state.distanceUnit === 'ft' ? 0 : 1);

        return (
            convertDistance(value).toFixed(precision) + ' ' + state.distanceUnit
        );
    };

    const reverseDistance = (distanceScaled: number) => {
        switch (state.distanceUnit) {
            case 'NM':
                return distanceScaled * 1852;
            case 'km':
                return distanceScaled * 1000;
            case 'miles':
                return distanceScaled * 1609.344;
            case 'ft':
                return distanceScaled * 0.3048;
            default:
                return distanceScaled;
        }
    };
    const convertRotation = (rotationRad: number) => {
        switch (state.rotationUnit) {
            case 'deg/s':
                return (rotationRad * 180) / Math.PI;
            default:
                return rotationRad;
        }
    };
    const stringRotation = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';
        const precision = digits ?? 0;
        return (
            convertRotation(value).toFixed(precision) + ' ' + state.rotationUnit
        );
    };

    const reverseRotation = (rotationScaled: number) => {
        switch (state.rotationUnit) {
            case 'deg/s':
                return (rotationScaled / 180) * Math.PI;
            default:
                return rotationScaled;
        }
    };

    const _convertDDToDMS = (dd: number, isLatitude: boolean): DMS => {
        const degrees = Math.floor(Math.abs(dd));
        const minutesDecimal = (Math.abs(dd) - degrees) * 60;
        const minutes = Math.floor(minutesDecimal);
        const seconds = Math.round((minutesDecimal - minutes) * 60);
        const direction = isLatitude
            ? dd >= 0
                ? 'N'
                : 'S'
            : dd >= 0
              ? 'E'
              : 'W';
        return {
            degrees: degrees,
            minutes: minutes,
            seconds: seconds,
            direction,
        };
    };

    const _convertDMSToDD = (dms: DMS) => {
        // Convert DMS to decimal degrees
        let dd = Math.abs(dms.degrees) + dms.minutes / 60 + dms.seconds / 3600;

        // Apply direction (S, W are negative)
        if (dms.direction === 'S' || dms.direction === 'W') {
            dd = -dd;
        }
        return dd;
    };

    const convertLocation = (locationDD: LatLon) => {
        switch (state.locationUnit) {
            case 'dms':
                return {
                    lat: _convertDDToDMS(locationDD.lat, true),
                    lon: _convertDDToDMS(locationDD.lon, false),
                } as LatLonDMS;
            default:
                return locationDD;
        }
    };

    const stringLocation = (
        isLatitude: boolean,
        value?: number,
        digits?: number,
    ) => {
        if (value === undefined) return 'N/A';
        const precision = digits ?? 4;
        if (state.locationUnit === 'dd') {
            return value.toFixed(precision) + '°';
        } else {
            const dms = _convertDDToDMS(value, isLatitude);
            return `${dms.degrees}° ${dms.minutes}' ${dms.seconds}" ${dms.direction}`;
        }
    };

    const reverseLocation = (locationScaled: DMS) => {
        switch (state.locationUnit) {
            case 'dms':
                return _convertDMSToDD(locationScaled);
            default:
                return locationScaled;
        }
    };
    const convertPressure = (pressureSI: number) => {
        switch (state.pressureUnit) {
            case 'bar':
                return pressureSI / 100000;
            case 'psi':
                return pressureSI * 0.000145037738;
            case 'mbar':
                return pressureSI * 0.01;
            case 'dbar':
                return pressureSI * 0.0001;
            default:
                return pressureSI;
        }
    };
    const stringPressure = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';
        const precision =
            digits ??
            (state.pressureUnit === 'bar' || state.pressureUnit === 'psi'
                ? 1
                : 0);
        return (
            convertPressure(value).toFixed(precision) + ' ' + state.pressureUnit
        );
    };
    const reversePressure = (pressureScaled: number) => {
        switch (state.pressureUnit) {
            case 'bar':
                return pressureScaled * 100000;
            case 'psi':
                return pressureScaled / 0.000145037738;
            case 'mbar':
                return pressureScaled / 0.01;
            case 'dbar':
                return pressureScaled / 0.0001;
            default:
                return pressureScaled;
        }
    };
    const convertCurrent = (currentSI: number) => {
        switch (state.currentUnit) {
            case 'NM/h':
                return (currentSI / 1852) * 3600;
            case 'km/h':
                return (currentSI / 1000) * 3600;
            case 'kn':
                return currentSI / 1.94384449;
            case 'ft/s':
                return currentSI / 0.3048;
            default:
                return currentSI;
        }
    };

    const stringCurrent = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';
        const precision = digits ?? 0;
        return (
            convertCurrent(value).toFixed(precision) + ' ' + state.currentUnit
        );
    };
    const reverseCurrent = (currentScaled: number) => {
        switch (state.currentUnit) {
            case 'NM/h':
                return (currentScaled * 1852) / 3600;
            case 'km/h':
                return (currentScaled * 1000) / 3600;
            case 'kn':
                return currentScaled * 1.94384449;
            case 'ft/s':
                return currentScaled * 0.3048;
            default:
                return currentScaled;
        }
    };
    const convertAngle = (angelDeg: number, scale180 = false) => {
        let rawAngle = angelDeg;

        rawAngle = rawAngle % 360;
        if (rawAngle < 0) rawAngle += 360;
        if (scale180) {
            if (rawAngle > 180) rawAngle -= 360;
        }
        const capped = rawAngle % 180;
        const scaled = capped / 180;

        switch (state.angleUnit) {
            case 'abs':
                return capped < rawAngle ? -scaled : scaled;
            case 'rad':
                return (rawAngle / 180) * Math.PI;
            default:
                return rawAngle;
        }
    };

    const stringAngle = (value?: number, digits?: number, scale180 = false) => {
        if (value === undefined) return 'N/A';
        const precision = digits ?? (state.angleUnit === 'abs' ? 1 : 0);
        return (
            convertAngle(value, scale180).toFixed(precision) +
            ' ' +
            state.angleUnit
        );
    };
    // we use deg not radians as default
    const reverseAngle = (angelScaled: number) => {
        switch (state.angleUnit) {
            case 'rad':
                return (angelScaled * 180) / Math.PI;
            case 'abs':
                return angelScaled * Math.PI;
            default:
                return angelScaled;
        }
    };

    const convertSpeed = (speedSI: number) => {
        switch (state.speedUnit) {
            case 'NM/h':
                return (speedSI / 1852) * 3600;
            case 'km/h':
                return (speedSI / 1000) * 3600;
            case 'kn':
                return speedSI / kn2ms;
            case 'm/s':
                return speedSI;
            case 'ft/s':
                return speedSI / 0.3048;
            default:
                return speedSI;
        }
    };
    const stringSpeed = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';

        const speed = convertSpeed(Number(value));
        const precision =
            digits ??
            (state.speedUnit === 'm/s' || state.speedUnit === 'ft/s' ? 0 : 1);
        const speedTxt = speed.toFixed(precision) + ' ' + state.speedUnit;
        return speedTxt;
    };

    const reverseSpeed = (speedScaled: number) => {
        switch (state.speedUnit) {
            case 'NM/h':
                return (speedScaled * 1852) / 3600;
            case 'km/h':
                return (speedScaled * 1000) / 3600;
            case 'kn':
                return speedScaled * kn2ms;
            case 'ft/s':
                return speedScaled * 0.3048;
            default:
                return speedScaled;
        }
    };

    const convertAccel = (accelSI: number) => {
        switch (state.accelUnit) {
            case 'ft/s²':
                return accelSI / 0.3048;
            case 'G':
                return accelSI * 0.10197162129779;
            default:
                return accelSI;
        }
    };
    const stringAccel = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';
        const precision = digits ?? 0;
        return convertAccel(value).toFixed(precision) + ' ' + state.accelUnit;
    };
    const reverseAccel = (accelScaled: number) => {
        switch (state.accelUnit) {
            case 'ft/s²':
                return accelScaled * 0.3048;
            case 'G':
                return accelScaled / 0.10197162129779;
            default:
                return accelScaled;
        }
    };
    const convertTemperature = (temperatureCelsius: number) => {
        switch (state.temperatureUnit) {
            case '°F':
                return (temperatureCelsius * 9) / 5 + 32;
            case 'Kelvin':
                return temperatureCelsius + 273.15;
            default:
                return temperatureCelsius;
        }
    };
    const stringTemperature = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';
        const precision = digits ?? 0;
        return (
            convertTemperature(value).toFixed(precision) +
            ' ' +
            state.temperatureUnit
        );
    };
    const reverseTemperature = (temperatureScaled: number) => {
        switch (state.temperatureUnit) {
            case '°F':
                return ((temperatureScaled - 32) * 5) / 9;
            case 'Kelvin':
                return temperatureScaled - 273.15;
            default:
                return temperatureScaled;
        }
    };

    const convertDepth = (depthSI: number) => {
        switch (state.depthUnit) {
            case 'Fath':
                return depthSI / 1.8288;
            case 'Ft':
                return depthSI / 0.3048;
            case 'm':
                return depthSI;
            default:
                return depthSI;
        }
    };
    const stringDepth = (value?: number, digits?: number) => {
        if (value === undefined) return 'N/A';
        const precision = digits ?? 0;
        return convertDepth(value).toFixed(precision) + ' ' + state.depthUnit;
    };

    const reverseDepth = (depthScaled: number) => {
        switch (state.depthUnit) {
            case 'Fath':
                return depthScaled * 1.8288;
            case 'Ft':
                return depthScaled * 0.3048;
            default:
                return depthScaled;
        }
    };

    const getUnits = () => {
        return toRaw(state);
    };

    return {
        ...toRefs(state),
        stringRotation,
        getUnits,
        reverseDepth,
        stringDepth,
        stringTemperature,
        reverseRotation,
        stringAccel,
        stringSpeed,
        reverseSpeed,
        reverseAccel,
        reverseTemperature,
        reverseAngle,
        reverseCurrent,
        stringAngle,
        stringCurrent,
        reversePressure,
        stringPressure,
        reverseLocation,
        stringLocation,
        convertLocation,
        reverseDistance,
        stringDistance,
        reversePrecipitation,
        stringPrecipitation,
        convertTemperature,
        convertSpeed,
        convertPressure,
        convertPrecipitation,
    };
});
