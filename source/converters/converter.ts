import { HomeyAPIV2 } from "homey-api";
import { CapabilityAction, CapabilityState, DiscoveryDevice, QueryDevice } from "../typings";
import { getDeviceType, makeStateBody } from ".";

export type HomeyCapability = HomeyAPIV2.ManagerDevices.Capability & { value: any };
export type HomeyCapabilities = Record<string, HomeyCapability>;

export class HomeyConverter {
    private converters: Record<string, CapabilityConverter<any, any>> = {};

    constructor(readonly name: string, private type?: string) {}

    static create(name: string, type?: string) {
        return new HomeyConverter(name, type);
    }

    use(converter: HomeyConverter) {
        const converters = { ...this.converters };
        const newConverters = { ...converter.converters };
        
        Object.values(newConverters).map(newConverter => {
            const converterKey = `${newConverter.type},${newConverter.instance}`;
            const converterName = converters[converterKey]?.name;

            // Удаляем свойства, если их перекрывает новый конвертер
            converterName && Object.values(converters)
                .map(converter => converter.name === converterName &&
                    delete converters[`${converter.type},${converter.instance}`]);
                
            converters[converterKey] = newConverter;
        });

        this.type = converter.type || this.type;
        this.converters = converters;
        return this;
    }

    createState(run: CapabilityBuilder<{ split?: boolean }, boolean>) {
        const type = "devices.capabilities.on_off";
        const instance = "on";
        this.converters[`${type},${instance}`] = run(new CapabilityConverter(this.name, type, instance));
        return this;
    }

    createColor(instance: string, run: CapabilityBuilder<{
        temperature_k?: {
            min: number;
            max: number;
        };
        scenes?: string[];
    }, any>) {
        const type = "devices.capabilities.color_setting";
        this.converters[`${type},${instance}`] = run(new CapabilityConverter(this.name, type, instance));
        return this;
    }

    createVideo(run: CapabilityBuilder<{ protocols: string[] }, { protocols: string[] }>) {
        const type = "devices.capabilities.video_stream";
        const instance = "get_stream";
        this.converters[`${type},${instance}`] = run(new CapabilityConverter(this.name, type, instance));
        return this;
    }

    createMode(instance: string, run: CapabilityBuilder<{ modes: string[] }, string>) {
        const type = "devices.capabilities.mode";
        this.converters[`${type},${instance}`] = run(new CapabilityConverter(this.name, type, instance));
        return this;
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
        const type = "devices.capabilities.range";
        this.converters[`${type},${instance}`] = run(new CapabilityConverter(this.name, type, instance));
        return this;
    }

    createToggle(instance: string, run: CapabilityBuilder<{}, boolean>) {
        const type = "devices.capabilities.toggle";
        this.converters[`${type},${instance}`] = run(new CapabilityConverter(this.name, type, instance));
        return this;
    }

    createFloat(instance: string, run: CapabilityBuilder<{ unit?: string }, number>) {
        const type = "devices.properties.float";
        this.converters[`${type},${instance}`] = run(new CapabilityConverter(this.name, type, instance));
        return this;
    }

    createEvent(instance: string, run: CapabilityBuilder<{ events: string[] }, string>) {
        const type = "devices.properties.event";
        this.converters[`${type},${instance}`] = run(new CapabilityConverter(this.name, type, instance));
        return this;
    }

    getDevice(device: HomeyAPIV2.ManagerDevices.Device, zones: Record<string, HomeyAPIV2.ManagerZones.Zone>) {
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
        Object.values(this.converters).map(converter => {
            const capabilities: HomeyCapabilities = device.capabilitiesObj as any;
            const capability = converter.getParameters(capabilities);
            response.custom_data.push(converter.name);

            if (capability.type === "devices.capabilities.color_setting") {
                if (!capabilityColor) capabilityColor = capability;
                else capabilityColor.parameters = { ...capabilityColor.parameters, ...capability.parameters };
                return;
            }

            response[converter.category].push(capability);
        });

        response.custom_data = [...new Set(response.custom_data)];        
        capabilityColor && response.capabilities.push(capabilityColor);
        if (!response.custom_data.length) return;
        
        return response;
    }

    getStates(deviceId: string, device?: HomeyAPIV2.ManagerDevices.Device) {
        const response: QueryDevice = {
            id: device?.id || deviceId,
            capabilities: [], properties: []
        };
        
        if (!device) response.error_code = "DEVICE_NOT_FOUND";
        else if (device && (!device.ready || !device.available)) response.error_code = "DEVICE_UNREACHABLE";
        else {
            const converters = Object.values(this.converters);
            converters.map(converter => {
                const capability = converter.getState(device);
                capability !== undefined && response[converter.category]!.push(capability);
            });
        }

        return response;
    }

    async setStates(capabilities: Array<CapabilityState>, handler: (capabilityId: string, value: any) => Promise<any>) {
        const response: Record<"capabilities", Array<CapabilityAction>> = {
            capabilities: []
        };

        response.capabilities = await Promise.all(capabilities.map(async ({ type, state }) => {
            const instance = state.instance;
            const converter = this.converters[`${type},${instance}`];
            if (converter) return converter.setState(state.value, handler);
            
            const result = { status: "ERROR", error_code: "INVALID_ACTION" };
            return makeStateBody(type, instance, { action_result: result });
        }));

        return response;
    }
}

type ParamsHandler<Params> = (capabilities: HomeyCapabilities) => Partial<Params>;

type CapabilityBuilder<Params, SetValue> =
    (converter: CapabilityConverter<Params & { retrievable?: boolean }, SetValue>) => typeof converter;

class CapabilityConverter<Params extends Record<string, any>, SetValue extends any> {
    readonly category: "capabilities" | "properties";
    private parameters: Params;
    private handleParams: ParamsHandler<Params>;
    private handleGet: (device: HomeyAPIV2.ManagerDevices.Device) => any;
    private handleSet: (value: any) => Record<string, any>;

    constructor(readonly name: string, readonly type: string, readonly instance: string) {
        this.category = type.split(".")[1] as any;
        this.parameters = {} as Params;
        this.handleParams = () => ({});
        this.handleGet = () => undefined;
        this.handleSet = () => ({});
    }

    setParameters(params: Params & { parse?: ParamsHandler<Params> }) {
        const { parse, ...parameters } = params;
        const currentHandler = this.handleParams;

        this.parameters = parameters as Params;
        parse && (this.handleParams = function (capabilities) {
            const prevValue = currentHandler(capabilities);
            const value = parse(capabilities);
            return { ...prevValue, ...value };
        })

        return this;
    }

    private getConverter<ValueType = any>(type: "capability" | "setting", itemId: string, handler?: (value: ValueType) => SetValue | "@prev" | "@break") {
        const currentHandler = this.handleGet;
        handler = handler ?? (value => value as unknown as SetValue);

        this.handleGet = function (device) {
            const currentValue = currentHandler(device);
            try {
                let currentValue = null;

                const capability = (device.capabilitiesObj as HomeyCapabilities)?.[itemId];
                if (type === "capability" && capability !== undefined) {
                    currentValue = capability.value;
                    if (capability.getable === false && capability.type === "boolean") currentValue = false;
                }

                const setting = (device.settings as Record<string, any>)?.[itemId];
                if (type === "setting" && setting !== undefined) {
                    currentValue = setting;
                }

                const value = currentValue === null && "@prev" || handler(currentValue);
                if (value === "@prev") return currentValue;
                if (value === "@break") return undefined;
                if (typeof value === "number") return Math.abs(value);
                if (typeof value === "object" && typeof currentValue === "object") return { ...currentValue, ...value };

                return value ?? undefined;
            } catch (error) {
                return currentValue;
            }
        }
        
        return this;
    }

    getCapability<ValueType = any>(capabilityId: string, handler?: (value: ValueType) => SetValue | "@prev" | "@break") {
        return this.getConverter("capability", capabilityId, handler);
    }

    getSetting<ValueType = any>(settingId: string, handler?: (value: ValueType) => SetValue | "@prev" | "@break") {
        return this.getConverter("setting", settingId, handler);
    }

    setCapability<ValueType = any>(capabilityId: string, handler?: (value: SetValue) => ValueType | "@break") {
        const currentHandler = this.handleSet;
        handler = handler ?? (value => value as unknown as ValueType);

        this.handleSet = function (capabilityValue) {
            const currentValue = currentHandler(capabilityValue);
            try {
                capabilityValue = capabilityValue ?? undefined;
                const value = handler(capabilityValue);
                currentValue[capabilityId] = (value === "@break" || value === null || value === undefined) ? undefined : value;
                return currentValue;
            } catch (error) {
                return currentValue;
            }
        }
        
        return this;
    }

    getParameters(capabilities: HomeyCapabilities) {
        const parameters: Record<string, any> = {
            ...this.parameters,
            ...this.handleParams(capabilities)
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

    getState(device: HomeyAPIV2.ManagerDevices.Device) {
        const value = this.handleGet(device);
        if (value !== undefined) return makeStateBody(this.type, this.instance, { value });
        return undefined;
    }

    async setState(value: any, handler: (capabilityId: string, value: any) => Promise<any>) {
        const values = Object.entries(this.handleSet(value));
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