import { HomeyAPIV2 } from "homey-api";
import Device from "../typings/device";

export function getDeviceType(device: HomeyAPIV2.ManagerDevices.Device) {
    const virtualClass = device.virtualClass;
    if (virtualClass) return getDeviceTypeByClass(virtualClass);
    return getDeviceTypeByClass(device.class);
}

function getDeviceTypeByClass(deviceClass: string) {
    switch (deviceClass) {
        case "amplifier"      : return Device.Media;
        case "blinds"         : return Device.Curtain;
        case "button"         : return Device.SensorButton;
        case "camera"         : return Device.Camera;
        case "coffeemachine"  : return Device.CoffeeMachine;
        case "curtain"        : return Device.Curtain;
        case "doorbell"       : return Device.Other;
        case "fan"            : return Device.Conditioner;
        case "garagedoor"     : return Device.Openable;
        case "heater"         : return Device.Thermostat;
        case "homealarm"      : return Device.Other;
        case "kettle"         : return Device.Kettle;
        case "light"          : return Device.Light;
        case "lock"           : return Device.Openable;
        case "other"          : return Device.Other;
        case "remote"         : return Device.Tv;
        case "sensor"         : return Device.Sensor;
        case "socket"         : return Device.Socket;
        case "speaker"        : return Device.Media;
        case "solarpanel"     : return Device.Other;
        case "sunshade"       : return Device.Curtain;
        case "thermostat"     : return Device.Thermostat;
        case "tv"             : return Device.Tv;
        case "vacuumcleaner"  : return Device.VacuumCleaner;
        case "windowcoverings": return Device.Curtain
        default               : return Device.Other;
    }
}