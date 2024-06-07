import { HomeyAPIV2 } from "homey-api";
import { DeviceType } from "../typings";

export function makeStateBody(type: string, instance: string, params: any) {
    return { type, state: { instance, ...params } };
}

export function getDeviceType(device: HomeyAPIV2.ManagerDevices.Device) {
    const virtualClass = device.virtualClass;
    const icon = device.iconOverride;

    if (virtualClass) {
        return ((virtualClass === "light" && icon) && getDeviceTypeByIcon(icon))
            || getDeviceTypeByClass(virtualClass);
    }

    return (icon && getDeviceTypeByIcon(icon))
        || getDeviceTypeByClass(device.class);
}

function getDeviceTypeByClass(deviceClass: string) {
    switch (deviceClass) {
        case "amplifier"      : return DeviceType.Media;
        case "blinds"         : return DeviceType.OpenableCurtain;
        case "button"         : return DeviceType.SensorButton;
        case "camera"         : return DeviceType.Camera;
        case "coffeemachine"  : return DeviceType.CookingCoffee;
        case "curtain"        : return DeviceType.OpenableCurtain;
        case "doorbell"       : return DeviceType.Other;
        case "fan"            : return DeviceType.VentilationFan;
        case "garagedoor"     : return DeviceType.Openable;
        case "heater"         : return DeviceType.Thermostat;
        case "homealarm"      : return DeviceType.Other;
        case "kettle"         : return DeviceType.CookingKettle;
        case "light"          : return DeviceType.Light;
        case "lock"           : return DeviceType.Openable;
        case "other"          : return DeviceType.Other;
        case "remote"         : return DeviceType.MediaTv;
        case "sensor"         : return DeviceType.Sensor;
        case "socket"         : return DeviceType.Socket;
        case "speaker"        : return DeviceType.Media;
        case "solarpanel"     : return DeviceType.Other;
        case "sunshade"       : return DeviceType.OpenableCurtain;
        case "thermostat"     : return DeviceType.Thermostat;
        case "tv"             : return DeviceType.MediaTv;
        case "vacuumcleaner"  : return DeviceType.VacuumCleaner;
        case "windowcoverings": return DeviceType.OpenableCurtain
        default               : return DeviceType.Other;
    }
}

function getDeviceTypeByIcon(icon: string) {
    if (["light-led-strip", "christmas-lights"].includes(icon))
        return DeviceType.LightStrip;

    if (icon.startsWith("light-hanging"))
        return DeviceType.LightCeiling;

    if (icon.startsWith("light-"))
        return DeviceType.Light;

    switch (icon) {
        // coverings
        case "window"     : return DeviceType.Openable;
        case "window2"    : return DeviceType.Openable;
        case "window3"    : return DeviceType.Openable;
        case "blinds"     : return DeviceType.OpenableCurtain;
        case "sunshade"   : return DeviceType.OpenableCurtain;
        case "sunshade2"  : return DeviceType.OpenableCurtain;
        case "curtains"   : return DeviceType.OpenableCurtain;
        case "door"       : return DeviceType.Openable;
        case "garage-door": return DeviceType.Openable;

        // security
        case "camera"            : return DeviceType.Camera;
        case "smoke-detector"    : return DeviceType.SensorSmoke;
        case "motion-sensor"     : return DeviceType.SensorMotion;
        case "door-window-sensor": return DeviceType.SensorOpen;

        // appliances
        case "coffee-machine" : return DeviceType.CookingCoffee;
        case "coffee-machine2": return DeviceType.CookingCoffee;
        case "kettle"         : return DeviceType.CookingKettle;
        case "airfryer"       : return DeviceType.Cooking;
        case "microwave"      : return DeviceType.Cooking;
        case "blender"        : return DeviceType.Cooking;
        case "toaster"        : return DeviceType.Cooking;
        case "cooking-plate"  : return DeviceType.Cooking;
        case "extractor-hood" : return DeviceType.VentilationFan;
        case "oven"           : return DeviceType.Cooking;
        case "fridge"         : return DeviceType.Cooking;
        case "vacuum-cleaner" : return DeviceType.VacuumCleaner;

        // climate
        case "climate"    : return DeviceType.ThermostatAc;
        case "climate2"   : return DeviceType.ThermostatAc;
        case "climate3"   : return DeviceType.ThermostatAc;
        case "fan"        : return DeviceType.VentilationFan;
        case "fan2"       : return DeviceType.VentilationFan;
        case "thermostat" : return DeviceType.Thermostat;
        case "heating"    : return DeviceType.Thermostat;
        case "cv"         : return DeviceType.Thermostat;
        case "ventilation": return DeviceType.VentilationFan;

        // switching
        case "switch-single": return DeviceType.Switch;
        case "switch-double": return DeviceType.Switch;
        case "plug"         : return DeviceType.Socket;
        case "plug2"        : return DeviceType.Socket;
        case "socket"       : return DeviceType.Socket;

        // audio
        // multimedia

        // household
        case "smart-meter2": return DeviceType.Meter;
        case "smart-meter3": return DeviceType.Meter;

        // various
    }
}