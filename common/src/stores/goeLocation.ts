import { computed, shallowRef } from 'vue';
import { defineStore } from 'pinia';

type GeolocationPositionRaw = {
    coords: Omit<GeolocationPosition['coords'], 'toJSON'>;
    timestamp: GeolocationPosition['timestamp'];
};
export interface UserLocation {
    geoLocation: GeolocationPositionRaw | null;
}
export const useGeoLocationStore = defineStore('goeLocation', () => {
    let _geoWatch: number | undefined = undefined;
    const geoLocation = shallowRef<GeolocationPositionRaw | null>(null);

    const start = async () => {
        if (_geoWatch) return; // Already watching
        const locationService: Geolocation | undefined = navigator.geolocation;
        if (process.env.MODE === 'capacitor') {
            // locationService = (await import('@capacitor/geolocation')).Geolocation;
        }
        if (locationService) {
            _geoWatch = await locationService.watchPosition(
                (location) => {
                    // WTF location is not a correct object that can be stringified with JSON.stringify
                    geoLocation.value = {
                        coords: {
                            accuracy: location.coords.accuracy,
                            altitude: location.coords.altitude,
                            altitudeAccuracy: location.coords.altitudeAccuracy,
                            heading: location.coords.heading,
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            speed: location.coords.speed,
                        },
                        timestamp: location.timestamp,
                    };
                },
                (err) => console.warn('error in navigator geolocation', err),
                { enableHighAccuracy: false },
            );
        }
    };

    const stop = () => {
        if (_geoWatch) {
            const locationService: Geolocation | undefined =
                navigator.geolocation;
            if (locationService) {
                locationService.clearWatch(_geoWatch);
            }
            _geoWatch = undefined;
        }
    };

    const location = computed(() => geoLocation.value);

    return {
        start,
        stop,
        location,
    };
});
