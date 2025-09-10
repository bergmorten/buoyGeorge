export const additionalReports = [
    {
        label: 'Weather forecast',
        fullLabel:
            'Weather forecast - Measure when high wind or waves are expected',
        value: 'weather_forecast',
    },
    {
        label: 'High tide',
        fullLabel: 'High tide - Measure when tide is at its highest',
        value: 'high_tide',
    },
    {
        label: 'Low tide',
        fullLabel: 'Low tide - Measure when tide is at its lowest',
        value: 'low_tide',
    },
    {
        label: 'Flood tide',
        fullLabel: 'Flood tide - When tide currents are on the strongest',
        value: 'flood_tide',
    },
    {
        label: 'Freak wave',
        fullLabel: 'Freak wave - A anomaly large wave detected',
        value: 'freak_wave',
    },
    {
        label: 'Sentry',
        fullLabel: 'Sentry - Waves caused by boat traffic',
        value: 'sentry',
    },
] as const;
export type AdditionalReport = (typeof additionalReports)[number];

export const gnssInterval = [
    {
        label: '5 min',
        value: 5,
    },
    {
        label: '10 min',
        value: 10,
    },
    {
        label: '15 min',
        value: 15,
    },
    {
        label: '30 min',
        value: 30,
    },
    {
        label: '60 min',
        value: 60,
    },
    {
        label: '90 min',
        value: 90,
    },
    {
        label: '120 min',
        value: 120,
    },
    {
        label: '3 hours',
        value: 180,
    },
    {
        label: '6 hours',
        value: 360,
    },
    {
        label: '12 hours',
        value: 720,
    },
    {
        label: '24 hours',
        value: 1440,
    },
    {
        label: '48 hours',
        value: 2880,
    },
];

export const gnssDuration = [
    {
        label: '10 s',
        value: 10,
    },
    {
        label: '20 s',
        value: 20,
    },
    {
        label: '30 s',
        value: 30,
    },
    {
        label: '1 min',
        value: 60,
    },
    {
        label: '2 min',
        value: 120,
    },
    {
        label: '5 min',
        value: 300,
    },
];

export const dopplerInterval = [
    {
        label: '5 min',
        value: 5,
    },
    {
        label: '10 min',
        value: 10,
    },
    {
        label: '15 min',
        value: 15,
    },
    {
        label: '30 min',
        value: 30,
    },
    {
        label: '60 min',
        value: 60,
    },
    {
        label: '90 min',
        value: 90,
    },
    {
        label: '120 min',
        value: 120,
    },
    {
        label: '3 hours',
        value: 180,
    },
    {
        label: '6 hours',
        value: 360,
    },
    {
        label: '12 hours',
        value: 720,
    },
    {
        label: '24 hours',
        value: 1440,
    },
    {
        label: '48 hours',
        value: 2880,
    },
];

export const dopplerDepth = [
    {
        label: '10 m',
        value: 10,
    },
    {
        label: '20 m',
        value: 20,
    },
    {
        label: '30 m',
        value: 30,
    },
    {
        label: '40 m',
        value: 40,
    },
    {
        label: '50 m',
        value: 50,
    },
    {
        label: '60 m',
        value: 60,
    },
    {
        label: '70 m',
        value: 70,
    },
    {
        label: '80 m',
        value: 80,
    },
    {
        label: '90 m',
        value: 90,
    },
    {
        label: '100 m',
        value: 100,
    },
];

export const cloudReportInterval = [
    {
        label: '5 min',
        value: 5,
    },
    {
        label: '10 min',
        value: 10,
    },
    {
        label: '15 min',
        value: 15,
    },
    {
        label: '30 min',
        value: 30,
    },
    {
        label: '60 min',
        value: 60,
    },
    {
        label: '90 min',
        value: 90,
    },
    {
        label: '120 min',
        value: 120,
    },
    {
        label: '3 hours',
        value: 180,
    },
    {
        label: '6 hours',
        value: 360,
    },
    {
        label: '12 hours',
        value: 720,
    },
    {
        label: '24 hours',
        value: 1440,
    },
    {
        label: '48 hours',
        value: 2880,
    },
];

export const defaultSettings = {
    waveGnssInterval: 30 as number | null,
    waveGnssSamplingLength: 20 as number | null,
    dopplerInterval: 15 as number | null,
    dopplerDepth: 50 as number | null,
    acpMaxDepth: 50 as number | null,
    additionalReports: null as AdditionalReport[] | null,
    cloudReportInterval: 60 as number | null,
};

export type DeploymentOptions = typeof defaultSettings;
