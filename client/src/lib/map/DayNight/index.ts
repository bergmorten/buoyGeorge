import DayNight from 'ol-ext/source/DayNight';
import VectorLayer from 'ol/layer/Vector';

export const getDayNight = () => {
    const vectorSource = new DayNight({});

    const dayNightLayer = new VectorLayer({
        source: vectorSource,
    });
    return dayNightLayer;
};
