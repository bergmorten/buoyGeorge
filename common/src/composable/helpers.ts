import { Notify } from 'quasar';

export const notImplemented = () => {
    Notify.create({
        message: 'Not implemented yet',
        color: 'negative',
    });
};

export const fullHeight = (offset: number | string) => {
    return { height: offset ? `calc(100vh - ${offset}px - 0px)` : '100vh' };
};
