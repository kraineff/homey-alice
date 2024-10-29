import { BunFile } from "bun";
import { AthomCloudAPI, HomeyAPIV2 } from "homey-api";
import { getDeviceType, HomeyCapabilities, HomeyConverters } from "../converters";
import { ActionDevice, ActionDevicesRequest, ActionDevicesResponse, DiscoveryDevice, DiscoveryDevicesResponse, QueryDevice, QueryDevicesRequest, QueryDevicesResponse, StorageItem } from "../typings";

export class ProviderController {
    #homeyApis: Record<string, any> = {};

    constructor(private clientId: string, private clientSecret: string, private storageFile: BunFile) {}

    #getStorageAdapter(token: string) {
        const storageAdapter = new AthomCloudAPI.StorageAdapter();

        storageAdapter.get = async () => {
            const storageItems: Array<StorageItem> = await this.storageFile.json();
            const storageItem = storageItems.find(item => item.token === token);
            return storageItem && storageItem.storage || {};
        };

        storageAdapter.set = async (storage: any) => {
            if (!storage.user) return;
            const homeyId = storage.user.homeys[0].id;
            const storageItems: Array<StorageItem> = await this.storageFile.json();
            const storageItem = storageItems.find(item => item.homeyId === homeyId);

            if (storageItem !== undefined) {
                storageItem.storage = { ...storageItem.storage, ...storage };
                storageItem.token = token;
            } else storageItems.push({ homeyId, token, storage });

            await Bun.write(this.storageFile, JSON.stringify(storageItems));
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

        setTimeout(() => delete this.#homeyApis[token], 5 * 60 * 1000);
        this.#homeyApis[token] = homeyApi;
        return homeyApi as any;
    }

    async userRemove(token: string) {
        await this.#getAthomUser(token);
        const storageItems: Array<StorageItem> = await this.storageFile.json();
        const newStorageItems = storageItems.filter(item => item.token !== token);
        await Bun.write(this.storageFile, JSON.stringify(newStorageItems));
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