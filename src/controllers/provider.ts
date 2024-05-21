import { BunFile } from "bun";
import { AthomCloudAPI, HomeyAPIV2 } from "homey-api";
import { HomeyConverters } from "../services/converters";
import { getDeviceType } from "../services/utils";
import { ActionDevice, ActionDevicesRequest, ActionDevicesResponse, DiscoveryDevice, DiscoveryDevicesResponse, QueryDevice, QueryDevicesRequest, QueryDevicesResponse } from "../typings";
import { HomeyConverter } from "../services/converter";

export class ProviderController {
    constructor(private clientId: string, private clientSecret: string, private storageFile: BunFile) {}

    private getStorageAdapter(token: string) {
        const storageAdapter = new AthomCloudAPI.StorageAdapter();

        storageAdapter.get = async () => {
            const storageItems: any[] = await this.storageFile.json();
            const storageItem = storageItems.find(item => item.token === token);
            return storageItem && storageItem.storage || {};
        };

        storageAdapter.set = async (storage: any) => {
            !storage.user && console.log(JSON.stringify(storage));
            const homeyId = storage.user.homeys[0].id;
            const storageItems: any[] = await this.storageFile.json();
            const storageItem = storageItems.find(item => item.homeyId === homeyId);

            storageItem
                ? (storageItem.token = token, storageItem.storage = { ...storageItem.storage, ...storage })
                : storageItems.push({ homeyId, token, storage });
            
            await Bun.write(this.storageFile, JSON.stringify(storageItems));
        };

        return storageAdapter;
    }

    private async getAthomUser(token: string) {
        const athomApi = new AthomCloudAPI({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            redirectUrl: "https://social.yandex.net/broker/redirect",
            // @ts-ignore
            token: new AthomCloudAPI.Token({ access_token: token }),
            store: this.getStorageAdapter(token),
            autoRefreshTokens: false
        });
        
        // @ts-ignore
        const user = await athomApi.getAuthenticatedUserFromStore();
        return user as AthomCloudAPI.User;
    }

    private async getHomeyAPI(token: string) {
        const user = await this.getAthomUser(token);
        const homey = await user.getFirstHomey();
        const homeyApi = await homey.authenticate({ strategy: "cloud" });
        return homeyApi as any;
    }

    async unlinkAccount(token: string) {
        await this.getAthomUser(token);
        const storageItems: any[] = await this.storageFile.json();
        const newStorageItems = storageItems.filter(item => item.token !== token);
        await Bun.write(this.storageFile, JSON.stringify(newStorageItems));
    }

    async discoveryDevices(token: string) {
        const homeyApi = await this.getHomeyAPI(token);
        const homeyDevices: Record<string, HomeyAPIV2.ManagerDevices.Device> = await homeyApi.devices.getDevices();
        const homeyZones: Record<string, HomeyAPIV2.ManagerZones.Zone> = await homeyApi.zones.getZones();
        
        const payload: DiscoveryDevicesResponse["payload"] = {
            user_id: homeyApi.id,
            devices: []
        };

        Object.values(homeyDevices).map(homeyDevice => {
            const device: DiscoveryDevice = {
                id: homeyDevice.id,
                name: homeyDevice.name,
                room: homeyZones[homeyDevice.zone].name,
                type: getDeviceType(homeyDevice),
                custom_data: [],
                capabilities: [],
                properties: []
            };

            // Специальные команды
            const note = homeyDevice.note;
            if (note && note.includes("@hidden;")) return;
            if (note && note.includes("@type=")) {
                const type = note.split("@type=")[1].split(";")[0];
                device.type = `devices.types.${type}`;
            }

            // Конвертация
            const converterX = HomeyConverter.create("X");
            const homeyCapabilities: Record<string, any> = homeyDevice.capabilitiesObj;

            Object.values(homeyCapabilities).map(capability => {
                const converter = HomeyConverters[capability.id];
                converter && converterX.use(converter);
            });

            const driverId = homeyDevice.driverId.replace("homey:app:", "");
            const driverConverter = HomeyConverters[driverId];
            driverConverter && converterX.use(driverConverter);

            const convertResult = converterX.getParams(homeyCapabilities);
            device.capabilities = convertResult.capabilities;
            device.properties = convertResult.properties;
            device.custom_data = convertResult.custom_data;
            device.custom_data.length && payload.devices.push(device);
        });

        return payload;
    }

    async queryDevices(token: string, body: QueryDevicesRequest) {
        const homeyApi = await this.getHomeyAPI(token);
        const homeyDevices: Record<string, HomeyAPIV2.ManagerDevices.Device> = await homeyApi.devices.getDevices();
        
        const payload: QueryDevicesResponse["payload"] = {
            devices: []
        };

        const queries = body.devices;
        queries.map(query => {
            const deviceId = query.id;
            const homeyDevice = homeyDevices[deviceId];

            const device: QueryDevice = {
                id: deviceId,
                capabilities: [],
                properties: []
            };

            if (!homeyDevice) device.error_code = "DEVICE_NOT_FOUND";
            if (homeyDevice && (!homeyDevice.ready || !homeyDevice.available)) device.error_code = "DEVICE_UNREACHABLE";

            if (!device.error_code) {
                const converterX = HomeyConverter.create("X");
                const homeyCapabilities: Record<string, any> = homeyDevice.capabilitiesObj;
                const converterIds: string[] = query.custom_data;

                converterIds.map(converterId => {
                    const converter = HomeyConverters[converterId];
                    converter && converterX.use(converter);
                });
    
                const convertResult = converterX.getStates(homeyCapabilities);
                device.capabilities = convertResult.capabilities;
                device.properties = convertResult.properties;
            }

            payload.devices.push(device);
        });

        return payload;
    }

    async actionDevices(token: string, body: ActionDevicesRequest) {
        const homeyApi = await this.getHomeyAPI(token);

        const payload: ActionDevicesResponse["payload"] = {
            devices: []
        };

        const actions = body.payload.devices;
        await Promise.all(actions.map(async action => {
            const deviceId = action.id;
            const deviceCapabilities = action.capabilities;

            const device: ActionDevice = {
                id: deviceId,
                capabilities: []
            };
            
            // Конвертация
            const converterX = HomeyConverter.create("X");
            const converterIds: string[] = action.custom_data;
            const converterSet = async (capabilityId: string, value: any) =>
                homeyApi.devices.setCapabilityValue({ capabilityId, deviceId, value });

            converterIds.map(converterId => {
                const converter = HomeyConverters[converterId];
                converter && converterX.use(converter);
            });

            const convertResult = await converterX.setStates(deviceCapabilities, converterSet);
            device.capabilities = convertResult.capabilities;
            payload.devices.push(device);
        }));

        return payload;
    }
}