import type Vector from 'ol/source/Vector';
import IDW from 'ol-ext/source/IDW';
import ImageLayer from 'ol/layer/Image';
export const getIDW = (source: Vector) => {
    // IDW source
    const idwSource = new IDW({
        /* Use workers */
        useWorker: true,

        /**/
        // scale: 8,
        // maxD: 1000000,
        // Source that contains the data
        source,
        // Use strength as weight property
        weight: 'strength',
    });
    idwSource.setMaxD(500);
    idwSource.setScale(2);

    const iwdLayer = new ImageLayer({
        source: idwSource,
        opacity: 0.5,
    });

    return iwdLayer;
};
