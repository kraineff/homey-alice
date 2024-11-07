import { ActionResult } from "./actionResult";
import { CapabilityAction, CapabilityState } from "./capability";

export type DiscoveryDevice = {
    id: string;
    name: string;
    description?: string;
    room?: string;
    type: string;
    custom_data?: any;
    capabilities: Array<any>;
    properties: Array<any>;
    device_info?: {
        manufacturer: string;
        model: string;
        hw_version?: string;
        sw_version?: string;
    };
};

export type QueryDevice = {
    id: string;
    capabilities?: Array<CapabilityState>;
    properties?: Array<CapabilityState>;
    error_code?: string;
    error_message?: string;
};

export type ActionDevice = {
    id: string;
    capabilities?: Array<CapabilityAction>;
    action_result?: ActionResult;
};