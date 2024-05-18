import { CapabilityState, CapabilityStateAction, DeviceCapability, DeviceProperty } from "./capability";
import { ActionResult } from ".";

export type UnlinkResponse = {
    request_id: string;
};

export type DiscoveryDevice = {
    id: string;
    name: string;
    description?: string;
    room?: string;
    type: string;
    custom_data?: any;
    capabilities: Array<DeviceCapability>;
    properties: Array<DeviceProperty>;
    device_info?: {
        manufacturer: string;
        model: string;
        hw_version?: string;
        sw_version?: string;
    };
};

export type DiscoveryResponse = {
    request_id: string;
    payload: {
        user_id: string;
        devices: Array<DiscoveryDevice>;
    };
};

export type QueryRequest = {
    devices: Array<{
        id: string;
        custom_data?: any;
    }>;
};

export type QueryDevice = {
    id: string;
    capabilities?: Array<CapabilityState>;
    properties?: Array<CapabilityState>;
    error_code?: string;
    error_message?: string;
};

export type QueryResponse = {
    request_id: string;
    payload: {
        devices: Array<QueryDevice>;
    };
};

export type ActionRequest = {
    payload: {
        devices: Array<{
            id: string;
            custom_data?: any;
            capabilities: Array<CapabilityState>;
        }>;
    };
};

export type ActionDevice = {
    id: string;
    capabilities?: Array<CapabilityStateAction>;
    action_result?: ActionResult;
};

export type ActionResponse = {
    request_id: string;
    payload: {
        devices: Array<ActionDevice>;
    };
};

export type CallbackStateRequest = {
    ts: number;
    payload: {
        user_id: string;
        devices: Array<{
            id: string;
            capabilities: Array<CapabilityState>;
            properties: Array<CapabilityState>;
        }>;
    };
};

export type CallbackDiscoveryRequest = {
    ts: number;
    payload: {
        user_id: string;
    };
};

export type CallbackResponse = {
    request_id: string;
    status: "ok";
};

export type CallbackErrorResponse = {
    request_id: string;
    status: "error";
    error_code?: "BAD_REQUEST" | "UNKNOWN_USER";
    error_message?: string;
};