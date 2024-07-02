import { HomeyConverter } from "../converter";

export const CapabilityConverters = {
    onoff: HomeyConverter
        .create("onoff")
        .createState(run => run
            .getHomey<boolean>("onoff")
            .setHomey<boolean>("onoff")),
    
    dim: HomeyConverter
        .create("dim")
        .createRange("brightness", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 },
            })
            .getHomey<number>("dim", value => value * 100)
            .setHomey<number>("dim", value => value / 100)),
    
    light_hue: HomeyConverter
        .create("light_hue")
        .createColor("hsv", run => run
            .getHomey<number>("light_hue", value => ({ h: Math.round(value * 360), s: 100, v: 100 }))
            .getHomey<number>("light_saturation", value => ({ s: Math.round(value * 100), v: 100 }))
            .getHomey<string>("light_mode", value => value === "color" && "@prev" || "@break")
            .setHomey<number>("light_hue", value => value.h / 360)
            .setHomey<number>("light_saturation", value => value.s / 100)
            .setHomey<string>("light_mode", () => "color")),
    
    light_temperature: HomeyConverter
        .create("light_temperature")
        .createColor("temperature_k", run => run
            .setParams({ temperature_k: { min: 1500, max: 9000 } })
            .getHomey<number>("light_temperature", value => Math.round(((((1 - value) - 0) * (9000 - 1500)) / (1 - 0)) + 1500))
            .getHomey<string>("light_mode", value => value === "temperature" && "@prev" || "@break")
            .setHomey<number>("light_temperature", value => 1 - ((((value - 1500) * (1 - 0)) / (9000 - 1500)) + 0))
            .setHomey<string>("light_mode", () => "temperature")),
    
    thermostat_mode: HomeyConverter
        .create("thermostat_mode")
        .createState(run => run
            .getHomey<string>("thermostat_mode", value => ["heat", "auto", "cool"].includes(value))
            .setHomey<string>("thermostat_mode", value => ["off", "heat"][Number(value)]))
        .createMode("thermostat", run => run
            .setParams({ modes: ["auto", "heat", "cool"] })
            .getHomey<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
            .setHomey<string>("thermostat_mode")),
    
    target_temperature: HomeyConverter
        .create("target_temperature")
        .createRange("temperature", run => run
            .setParams({
                unit: "temperature.celsius",
                parse: ({ target_temperature }) => ({
                    range: {
                        min: target_temperature.min ?? 4,
                        max: target_temperature.max ?? 35,
                        precision: target_temperature.step ?? 0.5
                    }
                }),
            })
            .getHomey<number>("target_temperature")
            .setHomey<number>("target_temperature")),
    
    measure_temperature: HomeyConverter
        .create("measure_temperature")
        .createFloat("temperature", run => run
            .setParams({ unit: "temperature.celsius" })
            .getHomey<number>("measure_temperature")),
    
    measure_co: HomeyConverter
        .create("measure_co")
        .createFloat("co2_level", run => run
            .setParams({ unit: "ppm" })
            .getHomey<number>("measure_co")),
    
    measure_co2: HomeyConverter
        .create("measure_co2")
        .createFloat("co2_level", run => run
            .setParams({ unit: "ppm" })
            .getHomey<number>("measure_co2")),
    
    measure_pm25: HomeyConverter
        .create("measure_pm25")
        .createFloat("pm2.5_density", run => run
            .setParams({ unit: "density.mcg_m3" })
            .getHomey<number>("measure_pm25")),
    
    measure_humidity: HomeyConverter
        .create("measure_humidity")
        .createFloat("humidity", run => run
            .setParams({ unit: "percent" })
            .getHomey<number>("measure_humidity")),
    
    measure_pressure: HomeyConverter
        .create("measure_pressure")
        .createFloat("pressure", run => run
            .setParams({ unit: "pressure.bar" })
            .getHomey<number>("measure_pressure", value => value / 1000)),
    
    measure_battery: HomeyConverter
        .create("measure_battery")
        .createFloat("battery_level", run => run
            .setParams({ unit: "percent" })
            .getHomey<number>("measure_battery")),
    
    measure_power: HomeyConverter
        .create("measure_power")
        .createFloat("power", run => run
            .setParams({ unit: "watt" })
            .getHomey<number>("measure_power")),
    
    measure_voltage: HomeyConverter
        .create("measure_voltage")
        .createFloat("voltage", run => run
            .setParams({ unit: "volt" })
            .getHomey<number>("measure_voltage")),
    
    measure_current: HomeyConverter
        .create("measure_current")
        .createFloat("amperage", run => run
            .setParams({ unit: "ampere" })
            .getHomey<number>("measure_current")),
    
    measure_luminance: HomeyConverter
        .create("measure_luminance")
        .createFloat("illumination", run => run
            .setParams({ unit: "illumination.lux" })
            .getHomey<number>("measure_luminance")),
    
    alarm_motion: HomeyConverter
        .create("alarm_motion")
        .createEvent("motion", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey<boolean>("alarm_motion", value => ["not_detected", "detected"][Number(value)])),
    
    alarm_contact: HomeyConverter
        .create("alarm_contact")
        .createEvent("open", run => run
            .setParams({ events: ["closed", "opened"] })
            .getHomey<boolean>("alarm_contact", value => ["closed", "opened"][Number(value)])),
    
    alarm_co: HomeyConverter
        .create("alarm_co")
        .createEvent("gas", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey<boolean>("alarm_co", value => ["not_detected", "detected"][Number(value)])),
    
    alarm_co2: HomeyConverter
        .create("alarm_co2")
        .createEvent("gas", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey<boolean>("alarm_co2", value => ["not_detected", "detected"][Number(value)])),
    
    alarm_tamper: HomeyConverter
        .create("alarm_tamper")
        .createEvent("open", run => run
            .setParams({ events: ["closed", "opened"] })
            .getHomey<boolean>("alarm_tamper", value => ["closed", "opened"][Number(value)])),
    
    alarm_smoke: HomeyConverter
        .create("alarm_smoke")
        .createEvent("smoke", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey<boolean>("alarm_smoke", value => ["not_detected", "detected"][Number(value)])),
    
    alarm_water: HomeyConverter
        .create("alarm_water")
        .createEvent("water_leak", run => run
            .setParams({ events: ["dry", "leak"] })
            .getHomey<boolean>("alarm_water", value => ["dry", "leak"][Number(value)])),
    
    alarm_battery: HomeyConverter
        .create("alarm_battery")
        .createEvent("battery_level", run => run
            .setParams({ events: ["normal", "low"] })
            .getHomey<boolean>("alarm_battery", value => ["normal", "low"][Number(value)])),
    
    meter_power: HomeyConverter
        .create("meter_power")
        .createFloat("electricity_meter", run => run
            .setParams({ unit: "kilowatt_hour" })
            .getHomey<number>("meter_power")),
    
    meter_water: HomeyConverter
        .create("meter_water")
        .createFloat("water_meter", run => run
            .setParams({ unit: "cubic_meter" })
            .getHomey<number>("meter_water")),
    
    meter_gas: HomeyConverter
        .create("meter_gas")
        .createFloat("gas_meter", run => run
            .setParams({ unit: "cubic_meter" })
            .getHomey<number>("meter_gas")),
    
    volume_set: HomeyConverter
        .create("volume_set")
        .createRange("volume", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getHomey<number>("volume_set", value => value * 100)
            .setHomey<number>("volume_set", value => value / 100)),
    
    volume_up: HomeyConverter
        .create("volume_up")
        .createRange("volume", run => run
            .setParams({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
            .setHomey<boolean>("volume_up", value => value === 1 && true || "@break")
            .setHomey<boolean>("volume_down", value => value === 0 && true || "@break")),
    
    volume_mute: HomeyConverter
        .create("volume_mute")
        .createToggle("mute", run => run
            .getHomey<boolean>("volume_mute")
            .setHomey<boolean>("volume_mute")),
    
    channel_up: HomeyConverter
        .create("channel_up")
        .createRange("channel", run => run
            .setParams({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
            .setHomey<boolean>("channel_up", value => value === 1 && true || "@break")
            .setHomey<boolean>("channel_down", value => value === 0 && true || "@break")),
    
    locked: HomeyConverter
        .create("locked")
        .createState(run => run
            .getHomey<boolean>("locked", value => !value)
            .setHomey<boolean>("locked", value => !value)),
    
    garagedoor_closed: HomeyConverter
        .create("garagedoor_closed")
        .createState(run => run
            .getHomey<boolean>("garagedoor_closed", value => !value)
            .setHomey<boolean>("garagedoor_closed", value => !value)),
    
    windowcoverings_closed: HomeyConverter
        .create("windowcoverings_closed")
        .createState(run => run
            .getHomey<boolean>("windowcoverings_closed", value => !value)
            .setHomey<boolean>("windowcoverings_closed", value => !value)),
    
    windowcoverings_set: HomeyConverter
        .create("windowcoverings_set")
        .createRange("open", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getHomey<number>("windowcoverings_set", value => value * 100)
            .setHomey<number>("windowcoverings_set", value => value / 100)),
    
    button: HomeyConverter
        .create("button")
        .createState(run => run
            .setParams({ split: true, retrievable: false })
            .getHomey<boolean>("button", () => false)
            .setHomey<boolean>("button", value => value === true && value || "@break")),
    
    speaker_playing: HomeyConverter
        .create("speaker_playing")
        .createState(run => run
            .getHomey<boolean>("speaker_playing")
            .setHomey<boolean>("speaker_playing")),
};