// 100 realistic offshore positions near the Norwegian coastline
// Clusters: Kristiansand→Finnmark, with small offsets into the sea.
import type { ProducerStatus } from 'client/services/database/producers';

function randRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

const lastSeen = () => {
    if (Math.random() < 0.05)
        return Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7); // 7 days
    return Date.now() - Math.floor(Math.random() * 1000 * 60 * 30); // 30 minutes
};

const randomOperation = () => {
    const baseCurrent = 0.5 + 1 * Math.random(); // 0.5 to 1.5 m/s
    const currentDirection = Math.random() * 360; // 0 to 360 degrees
    const current10m = baseCurrent * (0.8 + 0.4 * Math.random()); // 0.8 to 1.2 multiply
    const direction10m = currentDirection + (Math.random() * 10 - 5); // +/- 5 degrees
    const current20m = baseCurrent * (0.6 + 0.4 * Math.random()); // 0.6 to 1.0 multiply
    const direction20m = currentDirection + (Math.random() * 10 - 5); // +/- 5 degrees
    const current50m = baseCurrent * (0.4 + 0.4 * Math.random()); // 0.4 to 0.8 multiply
    const direction50m = currentDirection + (Math.random() * 10 - 5); // +/- 5 degrees
    const waveHeight = 0.5 + 2 * Math.random(); // 0.5 to 2.5 m;
    const waveDirection =
        ((currentDirection + 180) % 360) + (Math.random() * 20 - 10); // +/- 10 degrees
    const stateNum = Math.random();
    let state: ProducerStatus = 'RUNNING';
    if (stateNum < 0.15) state = 'ABORTED';
    else if (stateNum < 0.2) state = 'HALTED';

    return {
        status: JSON.stringify({
            wave: { height: waveHeight, direction: waveDirection },
            current10m: { value: current10m, direction: direction10m },
            current20m: { value: current20m, direction: direction20m },
            current50m: { value: current50m, direction: direction50m },
        }),
        state,
        lastSeen: lastSeen(),
    };
};

const anchors = [
    // South & Southwest (Skagerrak)
    { name: 'Kristiansand', lat: 58.15, lon: 8.0 },
    { name: 'Lindesnes', lat: 58.03, lon: 7.3 },
    { name: 'Arendal', lat: 58.46, lon: 8.77 },

    // West coast (North Sea)
    { name: 'Stavanger', lat: 58.97, lon: 5.73 },
    { name: 'Haugesund', lat: 59.41, lon: 5.27 },
    { name: 'Bergen', lat: 60.39, lon: 5.32 },
    { name: 'Fedje', lat: 60.78, lon: 4.72 },
    { name: 'Florø', lat: 61.6, lon: 5.03 },

    // Møre & Romsdal / Trøndelag
    { name: 'Ålesund', lat: 62.47, lon: 6.15 },
    { name: 'Kristiansund', lat: 63.11, lon: 7.73 },
    { name: 'Agdenes', lat: 63.47, lon: 10.21 },

    // Namdalen / Helgeland
    { name: 'Rørvik', lat: 64.86, lon: 11.24 },
    { name: 'Brønnøysund', lat: 65.47, lon: 12.21 },
    { name: 'Sandnessjøen', lat: 66.02, lon: 12.63 },

    // Nordland (Salten, Lofoten, Vesterålen)
    { name: 'Bodø', lat: 67.28, lon: 14.4 },
    { name: 'Svolvær', lat: 68.23, lon: 14.57 },
    { name: 'Sortland', lat: 68.69, lon: 15.41 },
    { name: 'Andøya', lat: 69.15, lon: 15.99 },

    // Troms & Finnmark
    { name: 'Senja', lat: 69.44, lon: 17.99 },
    { name: 'Tromsø', lat: 69.65, lon: 18.96 },
    { name: 'Hammerfest', lat: 70.66, lon: 23.68 },
    { name: 'Honningsvåg', lat: 70.98, lon: 25.97 },
] as const;

export const genDemoData = () => {
    // For each anchor, create ~5 offshore points to get ~100 total.
    const data: {
        name: string;
        startTime: Date;
        positions: {
            lat: number;
            lon: number;
            operation: ReturnType<typeof randomOperation>;
        }[];
    }[] = [];
    const baseSamplesPerAnchor = 10;

    for (const a of anchors) {
        const pts: {
            lat: number;
            lon: number;
            operation: ReturnType<typeof randomOperation>;
        }[] = [];
        const samplesPerAnchor =
            baseSamplesPerAnchor + Math.floor(Math.random() * 5);
        const startTime = new Date(
            Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 45),
        ); // 45 day per sample

        for (let i = 0; i < samplesPerAnchor; i++) {
            let lat: number = a.lat;
            let lon: number = a.lon;

            if (a.lon > 24) {
                // Far north (Finnmark): coastline faces north → push out to sea by increasing latitude.
                lat += randRange(0.15, 0.8);
                lon += randRange(-0.2, 0.2);
            } else {
                // Most of Norway's coast faces the Norwegian Sea/North Sea to the west.
                lat += randRange(-0.12, 0.12);
                lon -= randRange(0.15, 0.8); // push westward (to sea)
            }

            // Clamp to a broad, safe marine envelope (roughly offshore Norway)
            lat = Math.max(57.8, Math.min(71.5, lat));
            lon = Math.max(3.0, Math.min(31.5, lon));

            pts.push({
                lat: Number(lat.toFixed(4)),
                lon: Number(lon.toFixed(4)),
                operation: randomOperation(),
            });
        }
        data.push({
            name: a.name,
            startTime,
            positions: pts,
        });
    }
    return data;
};
// => Array<{lat:number, lon:number}> (length 100) clustered just offshore along the Norwegian coast

export type DemoDataType = ReturnType<typeof genDemoData>;
