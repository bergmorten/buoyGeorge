export type PointGeometry = {
    /**
     * [longitude, latitude, altitude]. All numbers in decimal.
     */
    coordinates: Array<number>;
    type: PointGeometryType;
};

export enum PointGeometryType {
    POINT = 'Point',
}
