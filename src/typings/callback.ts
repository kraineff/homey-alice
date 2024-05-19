import { CapabilityState } from "./provider/capability";

export type CallbackDevice = {
    id: string;
    capabilities: Array<CapabilityState>;
    properties: Array<CapabilityState>;
};

export type CallbackDiscoveryRequest = {
    ts: number;
    payload: {
        user_id: string;
    };
};

export type CallbackStateRequest = {
    ts: number;
    payload: {
        user_id: string;
        devices: Array<CallbackDevice>;
    };
};

export type CallbackResponse = {
    request_id: string;
    status: "ok" | "error";
    error_code?: "BAD_REQUEST" | "UNKNOWN_USER";
    error_message?: string;
};