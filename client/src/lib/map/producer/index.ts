import type { UseMap } from 'client/lib/map';
import { Point } from 'ol/geom';
import type { Producer } from 'client/services/database/producers';
import { fromLonLat } from 'ol/proj';
import { producerStyle } from '../styles';
import Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import type { ProducerStatus } from 'client/services/database/producers/models';

export const drawProducer = () => {
    const featureProducer = (producer: Producer) => {
        //const lonLat = toLonLat([producer.location.longitude, producer.location.latitude]);
        if (!producer.location) return null;
        if (!producer.state) return null;

        const lonLat = fromLonLat([
            producer.location.lon,
            producer.location.lat,
        ]);
        const feature = new Feature({
            geometry: new Point(lonLat),
            id: producer.id,
            featureType: 'producer',
        });
        const style = producerStyle(producer.state);
        const highlightedStyle = producerStyle(producer.state, true);
        feature.set('hoverStyle', highlightedStyle);
        if (producer.status) {
            try {
                const status: ProducerStatus = JSON.parse(producer.status);
                if (status && status.wave) {
                    const { height } = status.wave;
                    let strength = (height * 100) / 5;
                    if (strength > 100) strength = 100;
                    feature.set('strength', strength);
                }
            } catch (error) {
                console.error('Error setting feature strength:', error);
            }
        }
        feature.setStyle(style);

        return feature;
    };
    const featureProducers = (producers: Producer[]) => {
        const producerMarkers: Feature<Geometry>[] = [];
        for (const producer of producers) {
            const feature = featureProducer(producer);
            if (!feature) continue;
            producerMarkers.push(feature);
        }
        return producerMarkers;
        //
    };

    const highLightProducer = (
        map: UseMap,
        producerId: string,
        highlight: boolean,
    ) => {
        const layer = map.getVectorLayer('producer-markers');
        if (!layer) return;

        const features = layer.source.getFeatures();
        for (const feature of features) {
            const id = feature.get('id') as string;
            if (id === producerId) {
                feature.setStyle(producerStyle(null, highlight));
                return;
            }
        }
    };

    return {
        featureProducers,
        highLightProducer,
        featureProducer,
    };
};
