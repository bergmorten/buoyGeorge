export interface ClientVersion {
    major: number;
    minor: number;
    patch: number;
}

export const parseAmplifyVersion = (version?: string): ClientVersion | null => {
    const verArr = version?.split('.');
    if (!verArr) return null;
    return {
        major: verArr[0] ? Number(verArr[0]) : 0,
        minor: verArr[1] ? Number(verArr[1]) : 0,
        patch: verArr[2] ? Number(verArr[2]) : 0,
    };
};

export const version2String = (version?: ClientVersion): string => {
    if (!version) return 'N/A';
    return `${version.major}.${version.minor}.${version.patch}`;
};
