// 100 realistic offshore positions near the Norwegian coastline
// Clusters: Kristiansand→Finnmark, with small offsets into the sea.

function randRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

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
        positions: { lat: number; lon: number }[];
    }[] = [];
    const samplesPerAnchor = Math.ceil(100 / anchors.length);

    for (const a of anchors) {
        const pts: { lat: number; lon: number }[] = [];
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
            });
        }
        data.push({
            name: a.name,
            positions: pts,
        });
    }
    return data;
};
// => Array<{lat:number, lon:number}> (length 100) clustered just offshore along the Norwegian coast

export type DemoDataType = ReturnType<typeof genDemoData>;
