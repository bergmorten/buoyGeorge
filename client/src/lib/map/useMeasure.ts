import type { FeatureLike } from 'ol/Feature';
import type { LineString } from 'ol/geom';
import { Point } from 'ol/geom';
import type { LatLon, UseMap } from './models';
import {
    Fill,
    RegularShape,
    Style,
    Text,
    Circle as CircleStyle,
    Stroke,
} from 'ol/style';
import { Draw, Modify } from 'ol/interaction';
import { never } from 'ol/events/condition';
import type VectorSource from 'ol/source/Vector';
import { headingDistanceTo } from 'geolocation-utils';
import { toLatLon } from './tools';

export const useMeasure = (
    map: UseMap,
    formatDistance: (meter: number) => string,
) => {
    let _hasMeasure = false;
    const _currentLength = 0;
    const _currentHeading = 0;
    let _draw: Draw | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let _tipPoint: Point | undefined;
    const _idleTip = 'Click to start measuring';
    const _activeTip = '';
    const _modifyTip = ''; // 'Click on endpoint to modify position';
    let _tip = _idleTip;
    let _source: VectorSource | undefined;
    let _modify: Modify | undefined;

    const _style = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2,
        }),
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
        }),
    });

    const _labelStyle = new Style({
        text: new Text({
            font: '12px Roboto,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            padding: [3, 3, 3, 3],
            textBaseline: 'bottom',
            offsetY: -15,
        }),
        image: new RegularShape({
            radius: 8,
            points: 3,
            angle: Math.PI,
            displacement: [0, 10],
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
        }),
    });

    const _locationStyle = new Style({
        text: new Text({
            font: '12px Roboto,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            padding: [3, 3, 3, 3],
            textBaseline: 'bottom',
            offsetY: 35,
        }),
        image: new RegularShape({
            radius: 8,
            points: 3,
            angle: 0,
            displacement: [0, -10],
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
        }),
    });

    const _tipStyle = new Style({
        text: new Text({
            font: '12px Roboto,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15,
        }),
    });

    const _modifyStyle = new Style({
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
        }),
        text: new Text({
            text: 'Drag endpoints to modify',
            font: '12px Roboto,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15,
        }),
    });

    const formatLength = (from: LatLon, to: LatLon) => {
        const { distance, heading } = headingDistanceTo(from, to);
        const headingTo = heading < 0 ? heading + 360 : heading;
        return `${formatDistance(distance)}, ${headingTo.toFixed(0)}°`;
    };

    const _styleFunction = (feature: FeatureLike, initialMessage: string) => {
        const styles: Style[] = [];
        const geometry = feature.getGeometry();
        if (!geometry) {
            console.log('no geometry');
            return styles;
        }
        const type = geometry.getType();

        styles.push(_style);
        if (type === 'LineString') {
            const line = geometry as LineString;
            const startCoordinate = line.getFirstCoordinate();
            const startLocation = toLatLon(startCoordinate);
            const startPoint = new Point(startCoordinate);
            const _startStyle = _locationStyle.clone();
            _startStyle.setGeometry(startPoint);
            _startStyle
                .getText()
                ?.setText(
                    `${startLocation.lat.toFixed(
                        4,
                    )}, ${startLocation.lon.toFixed(4)}`,
                );
            styles.push(_startStyle);

            const endCoordinate = line.getLastCoordinate();
            const endLocation = toLatLon(endCoordinate);
            const endPoint = new Point(endCoordinate);
            const _endStyle = _locationStyle.clone();
            _endStyle.setGeometry(endPoint);
            _endStyle
                .getText()
                ?.setText(
                    `${endLocation.lat.toFixed(4)}, ${endLocation.lon.toFixed(
                        4,
                    )}`,
                );
            styles.push(_endStyle);

            const label = formatLength(startLocation, endLocation);
            const labelPoint = new Point(line.getCoordinateAt(0.5));
            _labelStyle.setGeometry(labelPoint);
            _labelStyle.getText()?.setText(label);
            styles.push(_labelStyle);
        } else if (type === 'Point') {
            _tipPoint = geometry as Point;
            _tipStyle.getText()?.setText(initialMessage);
            styles.push(_tipStyle);
        }
        return styles;
    };

    const toggleMeasure = () => {
        if (_hasMeasure) {
            hideMeasure();
        } else {
            showMeasure();
        }
    };

    const showMeasure = () => {
        const drawLayer = map.addVectorLayer(
            'Measure',
            undefined,
            (feature: FeatureLike) => {
                return _styleFunction(feature, _tip);
            },
        );
        _source = drawLayer.source;

        _modify = new Modify({
            source: _source,
            style: _modifyStyle,
            insertVertexCondition: never,
        });
        const olMap = map.getOlMap();
        _draw = new Draw({
            source: drawLayer.source,
            type: 'LineString',
            maxPoints: 2,
            style: (feature: FeatureLike) => {
                return _styleFunction(feature, _tip);
            },
        });
        _hasMeasure = true;
        _draw.on('drawstart', function () {
            _source?.clear();
            _tip = _activeTip;
            _modify?.setActive(false);
        });
        _draw.on('drawend', function () {
            // if (_tipPoint) _modifyStyle.setGeometry(_tipPoint);

            _modify?.setActive(true);
            // const olMap = map.getOlMap();
            // olMap.once('pointermove', function () {
            //   _modifyStyle.setGeometry();
            // });
            _tip = _modifyTip;
            _draw?.setActive(false);
        });
        _modify.setActive(false);
        olMap.addInteraction(_draw);
        olMap.addInteraction(_modify);
    };

    const hideMeasure = () => {
        if (_source) {
            _source.clear();
            _source = undefined;
        }
        if (_draw) {
            const olMap = map.getOlMap();
            olMap.removeInteraction(_draw);
            _draw = undefined;
        }
        if (_modify) {
            const olMap = map.getOlMap();
            olMap.removeInteraction(_modify);
            _modify.dispose();
            _modify = undefined;
        }
        map.removeLayer('Measure');
        _hasMeasure = false;
    };

    const hasMeasure = () => {
        return _hasMeasure;
    };

    const getValues = () => ({
        length: _currentLength,
        heading: _currentHeading,
    });

    return {
        toggleMeasure,
        showMeasure,
        hideMeasure,
        hasMeasure,
        getValues,
    };
};
