import { LineString } from 'ol/geom';
import { createProjection, toLonLat } from 'ol/proj';
import { fromLonLat } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';
import type { LatLon } from './models';

const extent3857 = createProjection('EPSG:3857', '').getExtent();
const maxEPSG3857 = extent3857[2] as number;

export const addJustCoordinatesForMeridian = ([startCoord, endCoord]: [
    Coordinate,
    Coordinate,
]) => {
    const x1 = startCoord[0] ?? 0;
    const x2 = endCoord[0] ?? 0;

    const start = [...startCoord];
    const end = [...endCoord];

    const xDiff = x1 - x2;
    if (Math.abs(xDiff) > maxEPSG3857) {
        const sign = xDiff < 0 ? -1 : 1;
        if (sign === 1) {
            const newX2 = x2 + maxEPSG3857 * 2;
            end[0] = newX2;
        } else {
            const newX1 = x1 + maxEPSG3857 * 2;
            start[0] = newX1;
        }
    }
    return [start, end] as [Coordinate, Coordinate];
};

export const createLineGeometry = (
    startLonLat: [number, number],
    endLonLat: Coordinate,
) => {
    const startCoord = fromLonLat(startLonLat);
    const endCoord = fromLonLat(endLonLat);
    const [start, end] = addJustCoordinatesForMeridian([startCoord, endCoord]);

    const segmentLineGeometry = new LineString([start, end]);
    return segmentLineGeometry;
};

export const toLatLon = (coord: Coordinate): LatLon => {
    const lonLat = toLonLat(coord);
    return { lat: lonLat[1] ?? -9999, lon: lonLat[0] ?? -9999 };
};
