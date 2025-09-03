export interface ProducerStatus_V1 {
    version: 1;
    wave: {
        height: number;
        direction: number;
    };
    current10m: {
        value: number;
        direction: number;
    };
    current20m: {
        value: number;
        direction: number;
    };
    current50m: {
        value: number;
        direction: number;
    };
}
export type ProducerStatus = ProducerStatus_V1;
