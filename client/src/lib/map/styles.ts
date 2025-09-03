import { Circle as CircleStyle, Fill, Style } from 'ol/style';

import type { ProducerState } from 'client/services/database/producers';

const getColorForStatus = (status: ProducerState, highlighted: boolean) => {
    if (highlighted) return 'white';
    switch (status) {
        case 'RUNNING':
            return 'green';
        case 'HALTED':
            return 'yellow';
        case 'ABORTED':
            return 'red';
        case 'MISSING':
            return 'grey';
        default:
            return 'orange';
    }
};

export const producerStyle = (status: ProducerState, highlighted?: boolean) => {
    return new Style({
        zIndex: 9999,
        image: new CircleStyle({
            radius: 5,
            fill: new Fill({
                color: getColorForStatus(status, !!highlighted),
            }),
        }),
    });
};
