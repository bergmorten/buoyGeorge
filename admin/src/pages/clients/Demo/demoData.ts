// 100 realistic offshore positions near the Norwegian coastline
// Clusters: Kristiansand→Finnmark, with small offsets into the sea.
import type { ProducerState } from 'client/services/database/producers';
import type { ProducerStatus } from 'client/services/database/producers/models';

interface Anchor {
    name: string;
    project: string;
    lat: number;
    lon: number;
    spread: number;
    count?: number;
    initialWaveHeight?: number;
    initialCurrent?: number;
}

function randRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

const lastSeen = () => {
    if (Math.random() < 0.05)
        return Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7); // 7 days
    return Date.now() - Math.floor(Math.random() * 1000 * 60 * 30); // 30 minutes
};

const randomOperation = (anchor: Anchor) => {
    const baseCurrent = anchor.initialCurrent ?? 0.5 + 1 * Math.random(); // 0.5 to 1.5 m/s
    const currentDirection = Math.random() * 360; // 0 to 360 degrees
    const current10m = baseCurrent * (0.8 + 0.4 * Math.random()); // 0.8 to 1.2 multiply
    const direction10m = currentDirection + (Math.random() * 10 - 5); // +/- 5 degrees
    const current20m = baseCurrent * (0.6 + 0.2 * Math.random()); // 0.6 to 1.0 multiply
    const direction20m = currentDirection + (Math.random() * 10 - 5); // +/- 5 degrees
    const current50m = baseCurrent * (0.4 + 0.2 * Math.random()); // 0.4 to 0.8 multiply
    const direction50m = currentDirection + (Math.random() * 10 - 5); // +/- 5 degrees
    const baseWaveHeight = anchor.initialWaveHeight ?? 1 + 2 * Math.random(); // 1 to 3 m;
    const waveHeight = baseWaveHeight * (0.75 + 0.5 * Math.random()); // 0.75 to 1.25 multiply
    const waveDirection =
        ((currentDirection + 180) % 360) + (Math.random() * 20 - 10); // +/- 10 degrees
    const stateNum = Math.random();
    let state: ProducerState = 'RUNNING';
    if (stateNum < 0.15) state = 'ABORTED';
    else if (stateNum < 0.2) state = 'HALTED';
    const status: ProducerStatus = {
        version: 1,
        wave: {
            height: waveHeight,
            direction: waveDirection,
            speed: Math.min((waveHeight * 9.81) ** 0.5, 30),
        },
        current10m: { speed: current10m, direction: direction10m },
        current20m: { speed: current20m, direction: direction20m },
        current50m: { speed: current50m, direction: direction50m },
    };
    return {
        status: JSON.stringify(status),
        state,
        lastSeen: lastSeen(),
    };
};

const anchors: Anchor[] = [
    // South & Southwest (Skagerrak)
    {
        name: 'Kristiansand',
        lat: 58.12,
        lon: 8.04,
        spread: 0.005,
        project: 'South Norway',
    },
    {
        name: 'Lindesnes',
        lat: 58.0324,
        lon: 7.777,
        spread: 0.005,
        project: 'South Norway',
    },
    {
        name: 'Arendal',
        lat: 58.41,
        lon: 8.82,
        spread: 0.005,
        project: 'South Norway',
    },

    // West coast (North Sea)
    {
        name: 'Stavanger',
        lat: 58.925,
        lon: 5.464,
        spread: 0.01,
        project: 'West Norway',
    },
    {
        name: 'Haugesund',
        lat: 59.482,
        lon: 5.117,
        spread: 0.01,
        project: 'West Norway',
    },
    {
        name: 'Bergen',
        lat: 60.464,
        lon: 4.861,
        spread: 0.01,
        project: 'West Norway',
    },
    {
        name: 'Fedje',
        lat: 60.79,
        lon: 4.15,
        spread: 0.02,
        initialWaveHeight: 4,
        initialCurrent: 2,
        project: 'West Norway',
    },
    {
        name: 'Florø',
        lat: 61.69,
        lon: 4.8,
        spread: 0.02,
        project: 'West Norway',
    },

    // Møre & Romsdal / Trøndelag
    {
        name: 'Ålesund',
        lat: 62.58,
        lon: 5.62,
        spread: 0.02,
        project: 'Mid Norway',
    },
    {
        name: 'Kristiansund',
        lat: 63.11,
        lon: 7.52,
        spread: 0.02,
        project: 'Mid Norway',
    },
    {
        name: 'Agdenes',
        lat: 63.45,
        lon: 10.078,
        spread: 0.005,
        project: 'Mid Norway',
    },

    // Namdalen / Helgeland
    {
        name: 'Rørvik',
        lat: 64.723,
        lon: 11.4,
        spread: 0.02,
        project: 'Helgeland',
    },
    {
        name: 'Brønnøysund',
        lat: 65.45,
        lon: 12.24,
        spread: 0.015,
        project: 'Helgeland',
    },
    {
        name: 'Sandnessjøen',
        lat: 66.063,
        lon: 12.619,
        spread: 0.02,
        project: 'Helgeland',
    },

    // Nordland (Salten, Lofoten, Vesterålen)
    { name: 'Bodø', lat: 67.26, lon: 14.15, spread: 0.02, project: 'Nordland' },
    {
        name: 'Svolvær',
        lat: 68.17,
        lon: 14.57,
        spread: 0.02,
        project: 'Nordland',
    },
    {
        name: 'Sortland',
        lat: 68.645,
        lon: 15.42,
        spread: 0.02,
        project: 'Nordland',
    },
    {
        name: 'Andøya',
        lat: 69.1,
        lon: 16.37,
        spread: 0.02,
        project: 'Nordland',
    },

    // Troms & Finnmark
    {
        name: 'Senja',
        lat: 69.46,
        lon: 18.08,
        spread: 0.02,
        project: 'Finnmark',
    },
    {
        name: 'Tromsø',
        lat: 69.66,
        lon: 18.87,
        spread: 0.01,
        project: 'Finnmark',
    },
    {
        name: 'Hammerfest',
        lat: 70.66,
        lon: 23.59,
        spread: 0.02,
        project: 'Finnmark',
    },
    {
        name: 'Honningsvåg',
        lat: 70.98,
        lon: 26.23,
        spread: 0.02,
        project: 'Finnmark',
    },

    // NOAA Gulf of America
    {
        name: 'NOAA',
        project: 'Gulf of America',
        lat: 29.286,
        lon: -87.69,
        spread: 0.02,
        count: 100,
        initialWaveHeight: 3,
        initialCurrent: 3,
    },
] as const;

export const genDemoData = () => {
    // For each anchor, create ~5 offshore points to get ~100 total.
    const data: {
        name: string;
        startTime: Date;
        project: string;
        records: {
            lat: number;
            lon: number;
            operation: ReturnType<typeof randomOperation>;
        }[];
    }[] = [];
    const baseSamplesPerAnchor = 10;

    for (const a of anchors) {
        const records: {
            lat: number;
            lon: number;
            operation: ReturnType<typeof randomOperation>;
        }[] = [];
        const samplesPerAnchor =
            a.count ?? baseSamplesPerAnchor + Math.floor(Math.random() * 5);
        const startTime = new Date(
            Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 45),
        ); // 45 day per sample

        for (let i = 0; i < samplesPerAnchor; i++) {
            let lat: number = a.lat;
            let lon: number = a.lon;

            lat += randRange(-a.spread, a.spread);
            lon += randRange(-a.spread, a.spread);

            records.push({
                lat: Number(lat.toFixed(4)),
                lon: Number(lon.toFixed(4)),
                operation: randomOperation(a),
            });
        }
        data.push({
            name: a.name,
            project: a.project,
            startTime,
            records,
        });
    }
    return data;
};
// => Array<{lat:number, lon:number}> (length 100) clustered just offshore along the Norwegian coast

export type DemoDataType = ReturnType<typeof genDemoData>;
