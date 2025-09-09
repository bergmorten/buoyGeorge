export interface ProducerStatus_V1 {
    version: 1;
    wave: {
        height: number;
        speed: number;
        direction: number;
    };
    current10m: {
        speed: number;
        direction: number;
    };
    current20m: {
        speed: number;
        direction: number;
    };
    current50m: {
        speed: number;
        direction: number;
    };
}
export type ProducerStatus = ProducerStatus_V1;
