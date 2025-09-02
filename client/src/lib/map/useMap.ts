/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'ol-ext/filter/Base';
import 'ol/ol.css';
import type {
    BaseMaps,
    LatLon,
    LayerDefWMS,
    LayerDefXYZ,
    ScaleOptions,
} from './models';
import { Circle, Fill, Style } from 'ol/style';
import type { StyleLike } from 'ol/style/Style';
import type { FlatStyleLike } from 'ol/style/flat';
import type { Coordinate } from 'ol/coordinate';
import type { Pixel } from 'ol/pixel';
import type { Projection } from 'ol/proj';
import { fromLonLat, get as getProj, toLonLat, transformExtent } from 'ol/proj';
import { ScaleLine } from 'ol/control';
import { asColorLike, type ColorLike } from 'ol/colorlike';
import { getTopLeft, getWidth } from 'ol/extent';
import { mapLayers } from './overLays';
import { throttle } from 'quasar';
import type BaseLayer from 'ol/layer/Base';
import Colorize from 'ol-ext/filter/Colorize';
import DayNight from 'ol-ext/source/DayNight';
import type { FeatureLike } from 'ol/Feature';
import type Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import OlMap from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WmtsSource from 'ol/source/WMTS';
import XyzSource from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import type { MapBrowserEvent } from 'ol';

export type ContextHandler = (click: {
    screenPos: number[];
    target: Feature<Geometry> | undefined;
}) => void;
export type ClickHandler = (click: {
    screenPos: number[];
    target: Feature<Geometry> | undefined;
    coords: Coordinate;
}) => void;
export type HoverHandler = (hover: {
    active: boolean;
    target: Feature<Geometry>;
}) => void;

export const useMap = ({
    id,
    initialClickHandler,
    initialContextHandler,
    initialHoverHandler,
    pointerMove,
    centerMove,
    projection,
    isTouch,
}: {
    id: HTMLDivElement;
    initialClickHandler?: ClickHandler;
    initialContextHandler?: ContextHandler;
    initialHoverHandler?: HoverHandler;
    pointerMove?: (center: Coordinate) => void;
    centerMove?: (center: LatLon) => void;
    projection?: 'EPSG:3857' | 'EPSG:4326';
    isTouch?: boolean;
}) => {
    const map = new OlMap({
        target: id,
        // moveTolerance: isTouch === true ? 5 : undefined,
    });
    const vectorLayers = new Map<
        string,
        {
            layer: VectorLayer<
                VectorSource<Feature<Geometry>>,
                Feature<Geometry>
            >;
            source: VectorSource<Feature<Geometry>>;
        }
    >();

    let dayNightLayer: BaseLayer | undefined = undefined;
    const grayFilter = new Colorize();
    const greenFilter = new Colorize();

    grayFilter.setFilter({
        operation: 'grayscale',
    });

    greenFilter.setFilter({
        operation: 'color',
        color: asColorLike([69, 75, 27]) as ColorLike,
        value: 1,
    });

    const view = new View({
        center: [0, 0],
        zoom: 2,
        projection: projection ?? 'EPSG:3857',
        maxZoom: 20,
        minZoom: 2,
    });

    map.setView(view);

    const clickHandler: ClickHandler[] = initialClickHandler
        ? [initialClickHandler]
        : [];
    const contextHandler: ContextHandler[] = initialContextHandler
        ? [initialContextHandler]
        : [];
    const hoverHandler: HoverHandler[] = initialHoverHandler
        ? [initialHoverHandler]
        : [];

    const { getBaseMap } = mapLayers();

    let clickHandlerPaused = false;

    const setContextHandler = (
        newContextHandler: ContextHandler,
        replaceAll = false,
    ) => {
        if (replaceAll) contextHandler.splice(0, contextHandler.length);
        contextHandler.push(newContextHandler);
    };
    const removeContextHandler = (handler: ContextHandler) => {
        const index = contextHandler.indexOf(handler);
        if (index > -1) contextHandler.splice(index, 1);
    };

    const setHoverHandler = (handler: HoverHandler, replaceAll = false) => {
        if (replaceAll) hoverHandler.splice(0, hoverHandler.length);
        hoverHandler.push(handler);
    };
    const removeHoverHandler = (handler: HoverHandler) => {
        const index = hoverHandler.indexOf(handler);
        if (index > -1) hoverHandler.splice(index, 1);
    };

    const setClickHandler = (
        newClickHandler: ClickHandler,
        replaceAll = false,
    ) => {
        if (replaceAll) clickHandler.splice(0, clickHandler.length);
        clickHandler.push(newClickHandler);
    };
    const removeClickHandler = (handler: ClickHandler) => {
        const index = clickHandler.indexOf(handler);
        if (index > -1) clickHandler.splice(index, 1);
    };
    const pauseClickHandler = () => (clickHandlerPaused = true);
    const resumeClickHandler = () =>
        setTimeout(() => {
            clickHandlerPaused = false;
        }, 500); // Must have this delay since map use single click listener

    const addVectorLayer = (
        name: string,
        features?: Feature<Geometry>[],
        style?: StyleLike | FlatStyleLike,
    ) => {
        const source = new VectorSource({});
        const layer = new VectorLayer({
            source,
            style,
        });
        layer.setProperties({ name });

        if (features) source.addFeatures(features);
        map.addLayer(layer);

        vectorLayers.set(name, { layer, source });

        return { source, layer };
    };

    const updateVectorLayer = (
        name: string,
        features: Feature<Geometry>[],
        options?: {
            style?: StyleLike | FlatStyleLike;
            zIndex?: number;
        },
    ) => {
        let data = vectorLayers.get(name);
        if (!data) {
            data = addVectorLayer(name, features, options?.style);
        } else {
            data.source.clear();
            data.source.addFeatures(features);
            if (options?.style) data.layer.setStyle(options?.style);
        }
        if (options?.zIndex) data.layer.setZIndex(options?.zIndex);
        return data;
    };

    const getVectorLayer = (name: string) => {
        return vectorLayers.get(name);
    };

    const setBaseMap = (selected: BaseMaps) => {
        const baseMaps = getBaseMap(selected);
        const existingLayers = map.getAllLayers();
        for (const layer of existingLayers) {
            map.removeLayer(layer);
        }

        for (const baseMap of baseMaps) {
            if (baseMap.type === 'XYZ') {
                const xyzSource = new XyzSource({
                    url: baseMap.url,
                    // projection: baseMap.projection,
                    attributions: baseMap.attribution,
                    minZoom: baseMap.minZoom,
                    maxZoom: baseMap.maxZoom,
                });
                const baseLayer = new TileLayer({
                    source: xyzSource,
                    extent: baseMap.extent
                        ? transformExtent(
                              baseMap.extent,
                              'EPSG:4326',
                              'EPSG:3857',
                          )
                        : undefined,
                });
                baseLayer.set('isBaseMap', true);
                map.addLayer(baseLayer);
            } else if (baseMap.type === 'WMTS') {
                const inspireWgs84Grid = (levels: number) => {
                    const projection = getProj('EPSG:4326') as Projection;

                    const projectionExtent = projection.getExtent();

                    const resolution = getWidth(projectionExtent) / 512;

                    const resolutions: number[] = new Array<number>(levels);
                    const matrixIds: string[] = new Array<string>(levels);

                    for (let z = 0; z < levels; ++z) {
                        resolutions[z] = resolution / Math.pow(2, z);
                        matrixIds[z] = z.toString();
                    }

                    const tileGrid = new WMTSTileGrid({
                        origin: getTopLeft(projectionExtent),
                        resolutions: resolutions,
                        matrixIds: matrixIds,
                    });

                    return { tileGrid, projection };
                };
                const { tileGrid, projection } = inspireWgs84Grid(12);
                const wmtsSource = new WmtsSource({
                    url: baseMap.url,

                    projection: projection,
                    attributions: baseMap.attribution,
                    tileGrid: tileGrid,
                    format: 'image/png',
                    layer: baseMap.layer,
                    matrixSet: baseMap.matrixSet,
                    style: 'default',
                    requestEncoding: 'REST',
                    wrapX: true, // This will cause issued with features crossing the 180th meridian
                });
                const baseLayer = new TileLayer({
                    source: wmtsSource,
                    minZoom: baseMap.minZoom,
                    maxZoom: baseMap.maxZoom,
                    extent: baseMap.extent
                        ? transformExtent(
                              baseMap.extent,
                              'EPSG:4326',
                              'EPSG:3857',
                          )
                        : undefined,
                });
                baseLayer.set('isBaseMap', true);
                map.addLayer(baseLayer);
            } else if (baseMap.type === 'WMS') {
                const baseLayer = new TileLayer({
                    extent: baseMap.extent
                        ? transformExtent(
                              baseMap.extent,
                              'EPSG:4326',
                              'EPSG:3857',
                          )
                        : undefined,
                    minZoom: baseMap.minZoom,
                    maxZoom: baseMap.maxZoom,
                    source: new TileWMS({
                        url: baseMap.url,
                        attributions: baseMap.attribution,
                        projection: projection,
                        params: baseMap.params,
                        serverType: baseMap.serverType,
                        // Countries have transparency, so do not fade tiles:
                        transition: baseMap.transition,
                    }),
                });
                baseLayer.set('isBaseMap', true);
                map.addLayer(baseLayer);
            } else {
                throw new Error('Unknown base map type');
            }
        }

        updateMapFilter();

        // restore existing layers
        for (const layer of existingLayers) {
            const isBaseMap = layer.get('isBaseMap') as undefined | true;
            if (!isBaseMap) map.addLayer(layer);
        }
    };

    const updateMapFilter = () => {
        const newLayers = map.getAllLayers();
        // Set map filter
        let filter;

        for (const layer of newLayers) {
            const isBaseMap = layer.get('isBaseMap') as undefined | true;
            if (!isBaseMap) continue;
            //@ts-ignore
            if (filter) layer.addFilter(filter);
            else {
                //@ts-ignore
                layer.removeFilter(grayFilter);
                //@ts-ignore
                layer.removeFilter(greenFilter);
            }
        }
    };

    const setCenter = (latLng: LatLon) => {
        const center = fromLonLat([latLng.lon, latLng.lat]);

        view.setCenter(center);
    };
    const setZoom = (level: number) => {
        view.setZoom(level);
    };

    const focusAt = (latLng: LatLon, zoom: number) => {
        setCenter(latLng);
        setZoom(zoom);
    };

    const viewExtent = (extent: number[]) => {
        try {
            map.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                maxZoom: 16,
            });
        } catch {
            console.error('Error fitting extent', extent);
        }
    };
    const singleClick = (evt: MapBrowserEvent) => {
        if (clickHandlerPaused || !clickHandler.length) return;
        let feature: FeatureLike | undefined;

        map.forEachFeatureAtPixel(
            evt.pixel,
            (feat) => {
                feature = feat;
                const id = feat.get('id');
                if (id) return true; // find first with id
            },
            { hitTolerance: isTouch === true ? 25 : 5 },
        );

        if (clickHandler !== undefined) {
            const coords = map.getCoordinateFromPixel(evt.pixel);
            for (const handler of clickHandler)
                handler({
                    screenPos: evt.pixel,
                    target: feature as Feature<Geometry> | undefined,
                    coords,
                });
        }
    };

    let highlightedMarker: Feature<Geometry> | undefined = undefined;
    const pointerMoveHandler = (e: MapBrowserEvent) => {
        const pixel = map.getEventPixel(e.originalEvent);
        const hit = map.hasFeatureAtPixel(pixel);

        if (pointerMove) {
            throttle(() => {
                pointerMove(getLatLonFromPixel(pixel));
            }, 100)();
        }
        if (hit) {
            let feature: Feature<Geometry> | undefined;
            let gotId = false;
            map.forEachFeatureAtPixel(e.pixel, function (feat) {
                feature = feat as Feature<Geometry>;
                const id = feat.get('id');
                if (id) {
                    gotId = true;
                    return true; // find first with id
                }
            });
            const target = map.getTarget();
            if (target !== undefined && typeof target !== 'string')
                target.style.cursor = gotId ? 'pointer' : '';

            if (feature) {
                if (feature != highlightedMarker) {
                    if (highlightedMarker) {
                        const prevStyle = highlightedMarker.get('prevStyle') as
                            | undefined
                            | Style;
                        if (prevStyle) highlightedMarker.setStyle(prevStyle);
                        if (
                            hoverHandler &&
                            highlightedMarker.get('hoverFunction') === true
                        ) {
                            for (const handler of hoverHandler)
                                handler({
                                    active: false,
                                    target: highlightedMarker,
                                });
                        }
                        highlightedMarker = undefined;
                    }
                    if (hoverHandler && feature.get('hoverFunction') === true) {
                        for (const handler of hoverHandler)
                            handler({ active: true, target: feature });
                    }
                    const hoverStyle = feature.get('hoverStyle') as
                        | undefined
                        | Style;
                    if (hoverStyle) {
                        const prevStyle = feature.getStyle();

                        feature.set('prevStyle', prevStyle);
                        feature.setStyle(hoverStyle);
                    }
                    highlightedMarker = feature;
                }
                return;
            }
        }
        const target = map.getTarget();
        if (target !== undefined && typeof target !== 'string')
            target.style.cursor = '';

        if (highlightedMarker) {
            const prevStyle = highlightedMarker.get('prevStyle') as
                | undefined
                | Style;
            if (prevStyle) highlightedMarker.setStyle(prevStyle);
            if (
                hoverHandler &&
                highlightedMarker.get('hoverFunction') === true
            ) {
                for (const handler of hoverHandler)
                    handler({ active: false, target: highlightedMarker });
            }
            highlightedMarker = undefined;
        }
    };

    const contextMenuHandler = (evt: MouseEvent) => {
        if (!contextHandler.length) return;
        evt.preventDefault();

        const pixel = map.getEventPixel(evt);

        const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
            return feature;
        });
        if (feature)
            for (const ctx of contextHandler)
                ctx({
                    screenPos: pixel,
                    target: feature as Feature<Geometry>,
                });
    };

    const setMouseEvents = () => {
        map.getViewport().addEventListener('contextmenu', contextMenuHandler);

        map.on('singleclick', singleClick);

        // change mouse cursor when over marker
        map.on('pointermove', pointerMoveHandler);
    };
    const removeMouseEvents = () => {
        map.getViewport().removeEventListener(
            'contextmenu',
            contextMenuHandler,
        );

        map.un('singleclick', singleClick);

        // change mouse cursor when over marker
        map.un('pointermove', pointerMoveHandler);
    };
    const getCordsFromPixel = (pixelPos: Pixel | [number, number]) => {
        return map.getCoordinateFromPixel(pixelPos);
    };
    const getLatLonFromPixel = (pixelPos: Pixel | [number, number]) => {
        return toLonLat(getCordsFromPixel(pixelPos));
    };
    const scaleControl = (options: ScaleOptions) => {
        if (options.type === 'scaleline') {
            const control = new ScaleLine({
                units: options.unit,
            });
            map.addControl(control);
            return;
        }
        const control = new ScaleLine({
            units: options ? options.unit : 'metric',
            bar: true,
            steps: options ? options.steps : 4,
            text: options ? options.text : true,
            minWidth: 140,
        });
        map.addControl(control);
        return;
    };
    const addXYZLayer = (name: string, layerDef: LayerDefXYZ) => {
        const newXyzSource = new XyzSource();
        newXyzSource.setUrl(layerDef.url);
        newXyzSource.setAttributions(layerDef.attribution);

        const newLayer = new TileLayer({ source: newXyzSource });
        newLayer.set('name', name);
        map.addLayer(newLayer);
    };
    const addWMSLayer = (name: string, layerDef: LayerDefWMS) => {
        const newWmsSource = new TileWMS({
            url: layerDef.url,
            attributions: layerDef.attribution,
            projection: projection,
            params: layerDef.params,
            serverType: layerDef.serverType,
            // Countries have transparency, so do not fade tiles:
        });

        const newLayer = new TileLayer({ source: newWmsSource });
        newLayer.set('name', name);
        map.addLayer(newLayer);
    };

    const removeLayer = (name: string) => {
        map.getLayers().forEach((layer) => {
            if (layer && layer.get('name') === name) {
                map.removeLayer(layer);
            }
        });

        if (vectorLayers.has(name)) vectorLayers.delete(name);
    };

    const moveHandler = () => {
        const center = view.getCenter();
        if (center === undefined) return;
        const lonLat = toLonLat(center);

        const latLng: LatLon = {
            lat: lonLat[1] as number,
            lon: lonLat[0] as number,
        };

        if (centerMove && center.length === 2) centerMove(latLng);
    };

    const init = () => {
        setMouseEvents();

        if (centerMove !== undefined) {
            map.on('moveend', moveHandler);
        }
    };

    const getOlMap = () => {
        return map;
    };

    const updateSize = () => {
        map.updateSize();
    };

    const getExtent = (layerName: string) => {
        const layer = getVectorLayer(layerName);
        if (!layer) return [];
        const extent = layer.source.getExtent();
        if (extent.length < 4) return [];
        return extent;
    };
    const zoomVectorLayer = (layerName: string) => {
        const extent = getExtent(layerName);
        if (extent.length < 4) return;

        viewExtent(extent);
    };

    const addDayNight = () => {
        if (dayNightLayer) removeDayNight(); // Already exits
        const vectorSource = new DayNight({});

        dayNightLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                image: new Circle({
                    radius: 5,
                    fill: new Fill({ color: 'red' }),
                }),
                /*
        stroke: new Stroke({
          color: [0, 0, 0, 1],
        }),
        */
                fill: new Fill({
                    color: [25, 25, 25, 0.6],
                }),
            }),
        });
        map.addLayer(dayNightLayer);
    };

    const removeDayNight = () => {
        if (!dayNightLayer) return;
        map.removeLayer(dayNightLayer);
        dayNightLayer = undefined;
    };

    const dispose = () => {
        map.un('moveend', moveHandler);
        removeMouseEvents();
        vectorLayers.clear();
        clickHandler.splice(0, clickHandler.length);
        contextHandler.splice(0, contextHandler.length);
        hoverHandler.splice(0, hoverHandler.length);
        map.dispose();
    };

    init();

    return {
        zoomVectorLayer,
        getOlMap,
        addXYZLayer,
        addWMSLayer,
        removeLayer,
        getCordsFromPixel,
        setBaseMap,
        setCenter,
        setZoom,
        viewExtent,
        focusAt,
        addVectorLayer,
        updateVectorLayer,
        getVectorLayer,
        scaleControl,
        pauseClickHandler,
        resumeClickHandler,
        updateSize,
        setClickHandler,
        setContextHandler,
        setHoverHandler,
        addDayNight,
        removeDayNight,
        getExtent,
        dispose,
        removeClickHandler,
        removeContextHandler,
        removeHoverHandler,
    };
};
