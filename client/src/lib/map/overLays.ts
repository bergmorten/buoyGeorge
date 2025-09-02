import type { BaseMaps, LayerDef, LayerDefWMS, LayerDefXYZ } from './models';

export const mapLayers = () => {
    const getBaseMap = (selected: BaseMaps): LayerDef[] => {
        switch (selected) {
            case 'emod':
                return [
                    {
                        type: 'WMTS',
                        projection: 'EPSG:4326',
                        url: 'https://tiles.emodnet-bathymetry.eu/2020/{Layer}/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png',
                        layer: 'baselayer',
                        matrixSet: 'inspire_quad',
                        attribution:
                            "&copy;<a href='https://https://tiles.emodnet-bathymetry.eu/'>EMODnet Bathymetry Consortium</a>contributors",
                    },

                    {
                        type: 'WMTS',
                        extent: [-36, 15, 43, 90],
                        projection: 'EPSG:4326',
                        url: 'https://tiles.emodnet-bathymetry.eu/v10/{Layer}/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png',
                        layer: 'mean_atlas_land',
                        matrixSet: 'inspire_quad',
                        attribution:
                            "&copy;<a href='https://https://tiles.emodnet-bathymetry.eu/'>EMODnet Bathymetry Consortium</a>contributors",
                    },
                ];
            case 'noaa':
                return [
                    {
                        type: 'XYZ',
                        projection: 'EPSG:4326',
                        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        attribution:
                            "&copy;<a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>contributors",
                    },
                    {
                        type: 'WMS',
                        // extent: [
                        //   -124.50873577266263, 42.37921526640779, -79.25138744177072,
                        //   57.72673875401309,
                        // ],
                        minZoom: 8,
                        projection: 'EPSG:4326',
                        url: 'https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/ENCOnline/MapServer/exts/MaritimeChartService/WMSServer',
                        attribution: '&copy;NOAA',
                        serverType: 'geoserver',
                        params: {
                            LAYERS: '1,2,3,4,5,6',
                            TILED: true,
                        },
                    },
                ];
            case 'esri':
                return [
                    {
                        type: 'XYZ',
                        projection: 'EPSG:4326',
                        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
                        maxZoom: 10,
                        attribution:
                            'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
                    },
                ];
            case 'osm':
            default:
                return [
                    {
                        type: 'XYZ',
                        projection: 'EPSG:4326',
                        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        attribution:
                            "&copy;<a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>contributors",
                    },
                ];
        }
    };

    const getNauticalMarkers = (): LayerDefXYZ => {
        return {
            type: 'XYZ',
            projection: 'EPSG:4326',
            url: 'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png',
            attribution:
                "&copy; <a href='http://www.openseamap.org'>OpenSeaMap</a> contributors",
        };
    };

    const getWeatherMaps = (
        selected: 'wind' | 'precipitation',
    ): LayerDefXYZ => {
        const openWeatherMapApiKey = 'e7c646049646d66b417a0e70c016577f'; // TODO make backend service?
        switch (selected) {
            case 'wind':
                return {
                    type: 'XYZ',
                    projection: 'EPSG:4326',
                    // url: `http://maps.openweathermap.org/maps/2.0/weather/WND/{z}/{x}/{y}?appid=${openWeathermapApiKey}`,
                    url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${openWeatherMapApiKey}`,
                    attribution: '&copy;openweathermap.org',
                };

            default:
                return {
                    type: 'XYZ',
                    projection: 'EPSG:4326',
                    url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherMapApiKey}`,
                    attribution: '&copy;openweathermap.org',
                };
        }
    };

    const getCurrentMaps = (selected: 'noaa'): LayerDefWMS => {
        switch (selected) {
            case 'noaa':
                return {
                    type: 'WMS',
                    projection: 'EPSG:4326',
                    serverType: 'geoserver',
                    params: {
                        layers: 'sea_water_velocity',
                        transparent: true,
                    },
                    url: 'https://cwcgom.aoml.noaa.gov/thredds/wms/OCEAN_GEOSTROPHIC_CURRENTS/CURRENTS.nc',
                    attribution: '&copy;NOAA',
                };

            default:
                throw new Error('Invalid map type');
        }
    };
    return { getBaseMap, getNauticalMarkers, getWeatherMaps, getCurrentMaps };
};
