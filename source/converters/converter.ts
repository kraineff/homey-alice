import { HomeyAPIV2 } from "homey-api";
import { CapabilityAction, CapabilityState, DiscoveryDevice, QueryDevice } from "../typings";
import { getDeviceType, makeStateBody } from ".";

export type HomeyCapability = HomeyAPIV2.ManagerDevices.Capability & { value: any };
export type HomeyCapabilities = Record<string, HomeyCapability>;

export class HomeyConverter {
    private converters = new Map<string, CapabilityConverter<any, any>>();

    constructor(readonly name: string, private type?: string) {}

    static create(name: string, type?: string) {
        return new HomeyConverter(name, type);
    }

    use(converter: HomeyConverter) {
        const converters = new Map(this.converters);
        const convertersNew = new Map(converter.converters);

        convertersNew.forEach((converter, key) => {
            const converterName = converters.get(key)?.name;

            converterName && converters.forEach((converter, key) =>
                converter.name === converterName && converters.delete(key));
            
            converters.set(key, converter);
        });

        this.type = converter.type || this.type;
        this.converters = converters;
        (converter as any) = null;
        return this;
    }

    private createConverter<Params extends Record<string, any>, SetValue>(
        type: string,
        instance: string,
        run: CapabilityBuilder<Params, SetValue>
    ) {
        this.converters.set(`${type},${instance}`, run(new CapabilityConverter<Params, SetValue>(this.name, type, instance)));
        return this;
    }

    createState(run: CapabilityBuilder<{ split?: boolean }, boolean>) {
        return this.createConverter("devices.capabilities.on_off", "on", run);
    }

    createColor(instance: string, run: CapabilityBuilder<{
        temperature_k?: {
            min: number;
            max: number;
        };
        scenes?: string[];
    }, any>) {
        return this.createConverter("devices.capabilities.color_setting", instance, run);
    }

    createVideo(run: CapabilityBuilder<{ protocols: string[] }, { protocols: string[] }>) {
        return this.createConverter("devices.capabilities.video_stream", "get_stream", run);
    }

    createMode(instance: string, run: CapabilityBuilder<{ modes: string[] }, string>) {
        return this.createConverter("devices.capabilities.mode", instance, run);
    }

    createRange(instance: string, run: CapabilityBuilder<{
        unit?: string;
        random_access?: boolean;
        range?: {
            min: number;
            max: number;
            precision: number;
        };
    }, number>) {
        return this.createConverter("devices.capabilities.range", instance, run);
    }

    createToggle(instance: string, run: CapabilityBuilder<{}, boolean>) {
        return this.createConverter("devices.capabilities.toggle", instance, run);
    }

    createFloat(instance: string, run: CapabilityBuilder<{ unit?: string }, number>) {
        return this.createConverter("devices.properties.float", instance, run);
    }

    createEvent(instance: string, run: CapabilityBuilder<{ events: string[] }, string>) {
        return this.createConverter("devices.properties.event", instance, run);
    }

    async getDevice(device: HomeyAPIV2.ManagerDevices.Device, zones: Record<string, HomeyAPIV2.ManagerZones.Zone>) {
        const response: DiscoveryDevice = {
            id: device.id,
            name: device.name,
            room: zones[device.zone].name,
            type: this.type || getDeviceType(device),
            custom_data: [], capabilities: [], properties: []
        };

        // Специальные команды
        const note = device.note;
        if (note && note.includes("@hidden;")) return;
        if (note && note.includes("@type="))
            response.type = `devices.types.${note.split("@type=")[1].split(";")[0]}`;

        // Конвертация свойств
        let capabilityColor: any;
        const capabilities = device.capabilitiesObj as HomeyCapabilities;

        await Promise.all(
            this.converters.values().map(async converter => {
                const capability = await converter.getParameters(capabilities);
                response.custom_data.push(converter.name);
    
                if (capability.type === "devices.capabilities.color_setting") {
                    if (!capabilityColor) capabilityColor = capability;
                    else capabilityColor.parameters = { ...capabilityColor.parameters, ...capability.parameters };
                    return;
                }
    
                response[converter.category].push(capability);
            })
        );

        capabilityColor && response.capabilities.push(capabilityColor);
        response.custom_data = [...new Set(response.custom_data)];                
        return response.custom_data.length ? response : undefined;
    }

    async getStates(deviceId: string, device?: HomeyAPIV2.ManagerDevices.Device) {
        const response: QueryDevice = {
            id: device?.id || deviceId,
            capabilities: [], properties: []
        };
        
        if (!device) response.error_code = "DEVICE_NOT_FOUND";
        else if (device && (!device.ready || !device.available)) response.error_code = "DEVICE_UNREACHABLE";
        else {
            await Promise.all(
                this.converters.values().map(async converter => {
                    const capability = await converter.getCapability(device);
                    capability !== undefined && response[converter.category]!.push(capability);
                })
            );
        }

        return response;
    }

    async setStates(capabilities: Array<CapabilityState>, handler: (capabilityId: string, value: any) => Promise<any>) {
        const response: Record<"capabilities", Array<CapabilityAction>> = {
            capabilities: []
        };

        response.capabilities = await Promise.all(
            capabilities.map(async ({ type, state }) => {
                const instance = state.instance;
                const converter = this.converters.get(`${type},${instance}`);
                if (converter) return await converter.setCapability(state.value, handler);
                
                const result = { status: "ERROR", error_code: "INVALID_ACTION" };
                return makeStateBody(type, instance, { action_result: result });
            })
        );

        return response;
    }
}

type ParamsHandler<Params> = (capabilities: HomeyCapabilities) => Partial<Params>;

type CapabilityBuilder<Params, SetValue> =
    (converter: CapabilityConverter<Params & { retrievable?: boolean }, SetValue>) => typeof converter;

class CapabilityConverter<Params extends Record<string, any>, SetValue> {
    readonly category: "capabilities" | "properties";
    private parameters: Params = {} as Params;
    private onParamsHandler?: ParamsHandler<Params>;
    private onGetHandler?: (device: HomeyAPIV2.ManagerDevices.Device) => SetValue | undefined;
    private onSetHandler?: (value: SetValue) => Record<string, any>;

    constructor(
        readonly name: string,
        readonly type: string,
        readonly instance: string
    ) {
        this.category = type.split(".")[1] as any;
    }

    onGetParameters(values: Params & { parse?: ParamsHandler<Params> }) {
        const { parse, ...parameters } = values;
        this.parameters = parameters as Params;

        if (parse) {
            const currentHandler = this.onParamsHandler || (() => ({}));
            this.onParamsHandler = capabilities =>
                ({...currentHandler(capabilities), ...parse(capabilities)});
        }
        return this;
    }

    onGetCapability<ValueType>(
        capabilityId: string, 
        handler?: (value: ValueType) => SetValue | "@prev" | "@break"
    ) {
        const currentHandler = this.onGetHandler || (() => undefined);
        const newHandler = handler ?? (value => value as unknown as SetValue);

        this.onGetHandler = device => {
            try {
                const capability = (device.capabilitiesObj as HomeyCapabilities)?.[capabilityId];
                const value = currentHandler(device);

                if (!capability || capability.value === undefined || capability.value === null)
                    return value;

                if (capability.type === "boolean" && capability.getable === false)
                    return false as SetValue;

                const newValue = newHandler(capability.value);
                if (newValue === "@break") return undefined;
                else if (newValue === "@prev") return value;
                else if (typeof newValue === "number") return Math.abs(newValue) as SetValue;
                else if (typeof newValue === "object" && typeof value === "object") return { ...value, ...newValue } as SetValue;
                else return newValue as SetValue;
            } catch (error) {
                return undefined;
            }
        }
        return this;
    }

    onGetSetting<ValueType>(
        settingId: string, 
        handler?: (value: ValueType) => SetValue | "@prev" | "@break"
    ) {
        const currentHandler = this.onGetHandler || (() => undefined);
        const newHandler = handler ?? (value => value as unknown as SetValue);

        this.onGetHandler = device => {
            try {
                const setting = (device.settings as Record<string, any>)?.[settingId];
                const value = currentHandler(device);

                if (!setting || setting.value === undefined || setting.value === null)
                    return value;

                const newValue = newHandler(setting);
                if (newValue === "@break") return undefined;
                else if (newValue === "@prev") return value;
                else if (typeof newValue === "number") return Math.abs(newValue) as SetValue;
                else if (typeof newValue === "object" && typeof value === "object") return { ...value, ...newValue } as SetValue;
                else return newValue as SetValue;
            } catch (error) {
                return undefined;
            }
        }
        return this;
    }

    onSetCapability<ValueType>(
        capabilityId: string,
        handler?: (value: SetValue) => ValueType | "@break"
    ) {
        const currentHandler = this.onSetHandler ?? (() => ({} as any));
        const newHandler = handler ?? (value => value as unknown as ValueType);

        this.onSetHandler = setValue => {
            try {
                const values = currentHandler(setValue);
                const newValue = newHandler(setValue);
                values[capabilityId] = (newValue === "@break" || newValue === null || newValue === undefined) ? undefined : newValue;
                return values;
            } catch (error) {
                return {};
            }
        }
        
        return this;
    }

    async getParameters(capabilities: HomeyCapabilities) {
        const parameters: Record<string, any> = {
            ...this.parameters,
            ...(this.onParamsHandler && this.onParamsHandler(capabilities))
        };

        return {
            type: this.type,
            retrievable: parameters.retrievable ?? true,
            reportable: false,
            parameters: {
                ...((this.type !== "devices.capabilities.on_off" && this.type !== "devices.capabilities.color_setting") && {
                    instance: this.instance
                }),
                ...((this.instance === "hsv" || this.instance === "rgb") && {
                    color_model: this.instance
                }),
                ...((parameters.temperature_k !== undefined && this.instance === "temperature_k") && {
                    temperature_k: parameters.temperature_k
                }),
                ...((parameters.scenes !== undefined && this.instance === "scene") && {
                    color_scene: { scenes: parameters.scenes.map((id: string) => ({ id })) }
                }),
                ...((parameters.split !== undefined) && {
                    split: parameters.split
                }),
                ...((parameters.random_access !== undefined) && {
                    random_access: parameters.random_access
                }),
                ...((parameters.range !== undefined) && {
                    range: parameters.range
                }),
                ...((parameters.unit !== undefined) && {
                    unit: `unit.${parameters.unit}`
                }),
                ...((parameters.modes !== undefined) && {
                    modes: parameters.modes.map((value: string) => ({ value }))
                }),
                ...((parameters.events !== undefined) && {
                    events: parameters.events.map((value: string) => ({ value }))
                })
            }
        };
    }

    async getCapability(device: HomeyAPIV2.ManagerDevices.Device) {
        const value = this.onGetHandler ? this.onGetHandler(device) : undefined;
        return value !== undefined ? makeStateBody(this.type, this.instance, { value }) : value;
    }

    async setCapability(value: any, handler: (capabilityId: string, value: any) => Promise<any>) {
        const values = Object.entries(this.onSetHandler ? this.onSetHandler(value) : {});
        const actionResult = await Promise
            .all(values.map(async ([capabilityId, value]) => value !== undefined && handler(capabilityId, value)))
            .then(() => ({ status: "DONE" }))
            .catch((error: Error) => {
                const errorMsg = error?.message || "";
                const result = { status: "ERROR", error_code: "DEVICE_UNREACHABLE" };
                console.log(errorMsg);

                if (errorMsg.startsWith("Invalid Capability:"))
                    return ({ status: "DONE" });

                if (errorMsg.startsWith("Not Found: Device with ID"))
                    result.error_code = "DEVICE_NOT_FOUND";

                if (errorMsg.startsWith("Power on in progress..."))
                    result.error_code = "DEVICE_BUSY";

                return result;
            });
        
        return makeStateBody(this.type, this.instance, { action_result: actionResult });
    }
}