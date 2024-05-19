import { CapabilityState } from "./capability";
import { ActionDevice, DiscoveryDevice, QueryDevice } from "./device";

export type UserUnlinkResponse = {
    request_id: string;
};

export type DiscoveryDevicesResponse = {
    request_id: string;
    payload: {
        user_id: string;
        devices: Array<DiscoveryDevice>;
    };
};

export type QueryDevicesRequest = {
    devices: Array<{
        id: string;
        custom_data?: any;
    }>;
};

export type QueryDevicesResponse = {
    request_id: string;
    payload: {
        devices: Array<QueryDevice>;
    };
};

export type ActionDevicesRequest = {
    payload: {
        devices: Array<{
            id: string;
            custom_data?: any;
            capabilities: Array<CapabilityState>;
        }>;
    };
};

export type ActionDevicesResponse = {
    request_id: string;
    payload: {
        devices: Array<ActionDevice>;
    };
};