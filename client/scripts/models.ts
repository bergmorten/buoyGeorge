export interface ExistingClient {
    id: string;
    stackName: string;
    name: string;
    appId?: string | null | undefined;
    environmentName?: string | null | undefined;
    projectName?: string | null | undefined;
    branch?: string | null | undefined;
}

export interface Client {
    isSandbox: boolean;
    name: string;
    stackName: string;
    amplifyOutput: string;
    appRegion: string;
    appSyncUrl: string;
    lastDeploymentTime: string;
    latestDeploymentVersion: string;
    appId?: string | null | undefined;
    branch?: string | null | undefined;
    projectName?: string | null | undefined;
    environmentName?: string | null | undefined;

    // Below is set in admin UI

    minimumUiVersion?: string | null | undefined;
    url?: string | null | undefined;
    amplifyWebhook?: string | null | undefined;
    tcpBanned?: boolean | null | undefined;
    iridiumBanned?: boolean | null | undefined;
    iridiumQueueRegion?: string | null | undefined;
    iridiumQueueUrl?: string | null | undefined;
    iridiumQueueArn?: string | null | undefined;
    socketQueueRegion?: string | null | undefined;
    socketQueueUrl?: string | null | undefined;
    socketQueueArn?: string | null | undefined;
}
