import * as EmailValidator from 'email-validator';
import { isIP } from 'is-ip';
import { isWebUri } from 'valid-url';
import isValidDomain from 'is-valid-domain';

export const isUrlValid = (url: string) => {
    if (!url) return 'A url is required';
    const isValid = isWebUri(url);
    if (isValid === undefined) {
        return 'Url must be a valid HTTPS or HTTP url';
    }
    return true;
};

export const isDomain = (domain: string) => {
    if (!domain) return 'A domain is required';
    const isValidIp = isIP(domain);
    if (isValidIp) return true;
    const isDomainName = isValidDomain(domain);
    if (!isDomainName) {
        return 'Domain must be a IP or DNS name';
    }
    return true;
};

export const isIpPort = (ipPort: string) => {
    const [ip, port] = ipPort.split(':');
    if (!ip) return 'IP or DNS name is required';
    const domain = isDomain(ip);
    if (domain !== true) return domain;
    if (ipPort.includes(':') && !port) return 'Port is required, when using :';
    if (port) {
        const portNumber = parseInt(port);
        if (isNaN(portNumber)) return 'Port must be a number';
        if (portNumber < 1 || portNumber > 65535)
            return 'Port must be between 1 and 65535';
    }

    return true;
};
export const isJsonValid = (data: string) => {
    if (!data) return 'Not a valid JSON object';
    try {
        JSON.parse(data);
        return true;
    } catch {
        return 'Not a valid JSON object';
    }
};

export const isAWSPhone = (val: string) => {
    if (!val) return 'Phone is required';
    const isPhone = !!/^\+[1-9]\d{1,14}$/.exec(val);
    if (!isPhone)
        return 'Wrong format must be +1234567890 (+country code with phone number, no space or parentheses)';
    return true;
};

export const isValidEmail = (val: string) => {
    return EmailValidator.validate(val);
};

export enum PasswordStrength {
    None = -1,
    NoSymbols = 0,
    Weak = 1,
    Medium = 2,
    Strong = 3,
}

export function getPasswordStrength(password: string): PasswordStrength {
    if (password.length < 8) return PasswordStrength.None;

    // Check for symbols
    if (!/[^A-Za-z0-9]/.test(password)) return PasswordStrength.NoSymbols;
    let score = 0;

    // Check for lowercase letters
    if (/[a-z]/.test(password)) score++;

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) score++;

    // Check for numbers
    if (/\d/.test(password)) score++;

    // Check for length
    if (password.length > 8) score++;

    // Count transitions between lowercase and uppercase
    let transitions = 0;
    for (let i = 1; i < password.length; i++) {
        const prev = password[i - 1] as string;
        const curr = password[i] as string;
        if (
            (/[a-z]/.test(prev) && !/[a-z]/.test(curr)) ||
            (/[A-Z]/.test(prev) && !/[A-Z]/.test(curr)) ||
            (/\d/.test(prev) && !/\d/.test(curr)) ||
            (/[^A-Za-z0-9]/.test(prev) && !/[^A-Za-z0-9]/.test(curr))
        ) {
            transitions++;
        }
    }
    if (transitions >= 3) score++; // reward for at least 2 transitions
    if (transitions >= 5) score++; // reward for at least 4 transitions
    if (score <= 3) return PasswordStrength.Weak;
    if (score <= 5) return PasswordStrength.Medium;
    return PasswordStrength.Strong;
}
