import { HomeyAPIV2 } from "homey-api";
import { DeviceType } from "../typings";

export function makeStateBody(type: string, instance: string, params: any) {
    return { type, state: { instance, ...params } };
}

export function getDeviceType(device: HomeyAPIV2.ManagerDevices.Device) {
    const virtualClass = device.virtualClass;
    if (virtualClass) return getDeviceTypeByClass(virtualClass);
    return getDeviceTypeByClass(device.class);
}

function getDeviceTypeByClass(deviceClass: string) {
    switch (deviceClass) {
        case "amplifier"      : return DeviceType.Media;
        case "blinds"         : return DeviceType.Curtain;
        case "button"         : return DeviceType.SensorButton;
        case "camera"         : return DeviceType.Camera;
        case "coffeemachine"  : return DeviceType.CoffeeMachine;
        case "curtain"        : return DeviceType.Curtain;
        case "doorbell"       : return DeviceType.Other;
        case "fan"            : return DeviceType.Conditioner;
        case "garagedoor"     : return DeviceType.Openable;
        case "heater"         : return DeviceType.Thermostat;
        case "homealarm"      : return DeviceType.Other;
        case "kettle"         : return DeviceType.Kettle;
        case "light"          : return DeviceType.Light;
        case "lock"           : return DeviceType.Openable;
        case "other"          : return DeviceType.Other;
        case "remote"         : return DeviceType.Tv;
        case "sensor"         : return DeviceType.Sensor;
        case "socket"         : return DeviceType.Socket;
        case "speaker"        : return DeviceType.Media;
        case "solarpanel"     : return DeviceType.Other;
        case "sunshade"       : return DeviceType.Curtain;
        case "thermostat"     : return DeviceType.Thermostat;
        case "tv"             : return DeviceType.Tv;
        case "vacuumcleaner"  : return DeviceType.VacuumCleaner;
        case "windowcoverings": return DeviceType.Curtain
        default               : return DeviceType.Other;
    }
}