import { HomeyConverter } from "../converter";
import { CapabilityConverters } from "./capability";
import { DeviceConverters } from "./device";

export const HomeyConverters = {
    ...CapabilityConverters,
    ...DeviceConverters
} as Record<string, HomeyConverter>;