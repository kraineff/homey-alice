import { AthomCloudAPI, HomeyAPIV2 } from "homey-api";
import { getDeviceType, HomeyCapabilities, HomeyConverters } from "../converters";
import { ActionDevice, ActionDevicesRequest, ActionDevicesResponse, DiscoveryDevice, DiscoveryDevicesResponse, QueryDevice, QueryDevicesRequest, QueryDevicesResponse } from "../typings";
import { PrismaClient } from "@prisma/client";

export class ProviderService {
    #homeyApis: Record<string, any> = {};

    constructor(private clientId: string, private clientSecret: string) {}

    #getStorageAdapter(token: string) {
        const storageAdapter = new AthomCloudAPI.StorageAdapter();

        storageAdapter.get = async () => {
            const prisma = new PrismaClient();
            const user = await prisma.user.findFirst({ where: { token } });
            return user && JSON.parse(user.storage) || {};
        };

        storageAdapter.set = async (storage: any) => {
            if (!storage.user) return;
            const prisma = new PrismaClient();
            const homeyId = storage.user.homeys[0].id;
            const user = await prisma.user.findFirst({ where: { id: homeyId } });

            if (user) await prisma.user.update({
                where: { id: homeyId },
                data: {
                    token: token,
                    storage: JSON.stringify({ ...JSON.parse(user.storage), ...storage })
                }
            });
            else await prisma.user.create({
                data: {
                    id: homeyId,
                    token: token,
                    storage: JSON.stringify(storage)
                }
            });
        };

        return storageAdapter;
    }

    async #getAthomUser(token: string) {
        const athomApi = new AthomCloudAPI({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            redirectUrl: "https://social.yandex.net/broker/redirect",
            // @ts-ignore
            token: new AthomCloudAPI.Token({ access_token: token }),
            store: this.#getStorageAdapter(token),
            autoRefreshTokens: false
        });
        
        // @ts-ignore
        const user = await athomApi.getAuthenticatedUserFromStore();
        return user as AthomCloudAPI.User;
    }

    async #getHomeyAPI(token: string) {
        if (token in this.#homeyApis) return this.#homeyApis[token];
        
        const user = await this.#getAthomUser(token);
        const homey = await user.getFirstHomey();
        const homeyApi = await homey.authenticate({ strategy: "cloud" });

        setTimeout(() => delete this.#homeyApis[token], 30 * 60 * 1000);
        this.#homeyApis[token] = homeyApi;
        return this.#homeyApis[token];
    }

    async userRemove(token: string) {
        await this.#getAthomUser(token);
        const prisma = new PrismaClient();
        const user = await prisma.user.findFirst({ where: { token } });
        user && await prisma.user.delete({ where: { id: user.id } });
    }

    async devicesDiscovery(token: string) {
        const homeyApi = await this.#getHomeyAPI(token);
        const homeyDevices: Record<string, HomeyAPIV2.ManagerDevices.Device> = await homeyApi.devices.getDevices();
        const homeyZones: Record<string, HomeyAPIV2.ManagerZones.Zone> = await homeyApi.zones.getZones();
        const payload: DiscoveryDevicesResponse["payload"] = {
            user_id: homeyApi.id, devices: []
        };

        await Promise.all(
            Object.values(homeyDevices).map(async homeyDevice => {
                const device: DiscoveryDevice = {
                    id: homeyDevice.id,
                    name: homeyDevice.name,
                    room: homeyZones[homeyDevice.zone].name,
                    type: getDeviceType(homeyDevice),
                    custom_data: [], capabilities: [], properties: []
                };
    
                // Специальные команды
                const note = homeyDevice.note;
                if (note && note.includes("@hidden;")) return;
                if (note && note.includes("@type="))
                    device.type = `devices.types.${note.split("@type=")[1].split(";")[0]}`;
    
                const capabilities: HomeyCapabilities = homeyDevice.capabilitiesObj as any;
                const converter = await HomeyConverters.merge([...Object.keys(capabilities), homeyDevice.driverId]);
    
                const params = converter.getParams(capabilities);
                if (params.custom_data.length) {
                    device.type = params.type || device.type;
                    device.capabilities = params.capabilities;
                    device.properties = params.properties;
                    device.custom_data = params.custom_data;
                    payload.devices.push(device);
                }
            })
        );

        return payload;
    }

    async devicesQuery(token: string, body: QueryDevicesRequest) {
        const homeyApi = await this.#getHomeyAPI(token);
        const homeyDevices: Record<string, HomeyAPIV2.ManagerDevices.Device> = await homeyApi.devices.getDevices();
        const payload: QueryDevicesResponse["payload"] = {
            devices: []
        };

        await Promise.all(
            body.devices.map(async query => {
                const device: QueryDevice = {
                    id: query.id, capabilities: [], properties: []
                };
                
                const homeyDevice = homeyDevices[query.id];
                if (!homeyDevice) device.error_code = "DEVICE_NOT_FOUND";
                else if (homeyDevice && (!homeyDevice.ready || !homeyDevice.available)) device.error_code = "DEVICE_UNREACHABLE";
                else {
                    const capabilities: HomeyCapabilities = homeyDevice.capabilitiesObj as any;
                    const converter = await HomeyConverters.merge(query.custom_data);
                    const states = converter.getStates(capabilities);
                    device.capabilities = states.capabilities;
                    device.properties = states.properties;
                }
                payload.devices.push(device);
            })
        );
        
        return payload;
    }

    async devicesAction(token: string, body: ActionDevicesRequest) {
        const homeyApi = await this.#getHomeyAPI(token);
        const payload: ActionDevicesResponse["payload"] = {
            devices: []
        };
        
        await Promise.all(
            body.payload.devices.map(async action => {
                const deviceId = action.id;
                const device: ActionDevice = {
                    id: deviceId, capabilities: []
                };
    
                const converter = await HomeyConverters.merge(action.custom_data);
                const converterSet = async (capabilityId: string, value: any) =>
                    homeyApi.devices.setCapabilityValue({ capabilityId, deviceId, value });
    
                const states = await converter.setStates(action.capabilities, converterSet);
                device.capabilities = states.capabilities;
                payload.devices.push(device);
            })
        );

        return payload;
    }
}