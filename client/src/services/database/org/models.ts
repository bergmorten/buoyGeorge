export type ORG_CONTACT_INFO = CONTACT_INFO_V1;
export type OrgBillingData = OrgBillingData_V1;
export interface CONTACT_INFO_V1 {
    version: 1;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string; //To letter country code
}

export interface OrgBillingData_V1 {
    version: 1;
    pricePerVirtualGlider: number;
    serviceFee: number;
    supportHourPrice: number;
    extendedSupport: boolean;
    extendedSupportFee: number;
    sendQuickBooksInvoice?: boolean | undefined;
    quickBooksCustomerId?: number | undefined;
}

export const DefaultBillingData: OrgBillingData_V1 = {
    version: 1,
    pricePerVirtualGlider: 49,
    serviceFee: 99,
    supportHourPrice: 99,
    extendedSupport: false,
    extendedSupportFee: 1999,
    sendQuickBooksInvoice: false,
    quickBooksCustomerId: undefined,
} as const;
