import { HomeyConverter } from "../converter";

export const CapabilityConverters = {
    onoff: HomeyConverter
        .create("onoff")
        .createState(run => run
            .getHomey("onoff")
            .setHomey("onoff")),
    
    dim: HomeyConverter
        .create("dim")
        .createRange("brightness", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 },
            })
            .getHomey("dim", state => state.value * 100)
            .setHomey("dim", value => value / 100)),
    
    light_hue: HomeyConverter
        .create("light_hue")
        .createColor("hsv", run => run
            .getHomey("light_hue", state => ({ h: Math.round(state.value * 360), s: 100, v: 100 }))
            .setHomey("light_hue", value => value.h / 360)
            .getHomey("light_saturation", state => ({ s: Math.round(state.value * 100), v: 100 }))
            .setHomey("light_saturation", value => value.s / 100)
            .getHomey("light_mode", state => state.value !== "color" && "@break" || null)
            .setHomey("light_mode", () => "color")),

    light_temperature: HomeyConverter
        .create("light_temperature")
        .createColor("temperature_k", run => run
            .setParams({ temperature_k: { min: 1500, max: 9000 } })
            .getHomey("light_temperature", state => Math.round(((((1 - state.value) - 0) * (9000 - 1500)) / (1 - 0)) + 1500))
            .setHomey("light_temperature", value => 1 - ((((<any>value - 1500) * (1 - 0)) / (9000 - 1500)) + 0))
            .getHomey("light_mode", state => state.value !== "temperature" && "@break" || null)
            .setHomey("light_mode", () => "temperature")),
    
    thermostat_mode: HomeyConverter
        .create("thermostat_mode")
        .createState(run => run
            .getHomey("thermostat_mode", state => ["heat", "auto", "cool"].includes(state.value))
            .setHomey("thermostat_mode", value => ["off", "heat"][Number(value)]))
        .createMode("thermostat", run => run
            .setParams({ modes: ["auto", "heat", "cool"] })
            .getHomey("thermostat_mode", state => ["auto", "heat", "cool"].includes(state.value) && state.value || null)
            .setHomey("thermostat_mode")),
        
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
            .getHomey("target_temperature")
            .setHomey("target_temperature")),

    measure_temperature: HomeyConverter
        .create("measure_temperature")
        .createFloat("temperature", run => run
            .setParams({ unit: "temperature.celsius" })
            .getHomey("measure_temperature")),

    measure_co: HomeyConverter
        .create("measure_co")
        .createFloat("co2_level", run => run
            .setParams({ unit: "ppm" })
            .getHomey("measure_co")),

    measure_co2: HomeyConverter
        .create("measure_co2")
        .createFloat("co2_level", run => run
            .setParams({ unit: "ppm" })
            .getHomey("measure_co2")),

    measure_pm25: HomeyConverter
        .create("measure_pm25")
        .createFloat("pm2.5_density", run => run
            .setParams({ unit: "density.mcg_m3" })
            .getHomey("measure_pm25")),

    measure_humidity: HomeyConverter
        .create("measure_humidity")
        .createFloat("humidity", run => run
            .setParams({ unit: "percent" })
            .getHomey("measure_humidity")),

    measure_pressure: HomeyConverter
        .create("measure_pressure")
        .createFloat("pressure", run => run
            .setParams({ unit: "pressure.bar" })
            .getHomey("measure_pressure", state => state.value / 1000)),

    measure_battery: HomeyConverter
        .create("measure_battery")
        .createFloat("battery_level", run => run
            .setParams({ unit: "percent" })
            .getHomey("measure_battery")),

    measure_power: HomeyConverter
        .create("measure_power")
        .createFloat("power", run => run
            .setParams({ unit: "watt" })
            .getHomey("measure_power")),

    measure_voltage: HomeyConverter
        .create("measure_voltage")
        .createFloat("voltage", run => run
            .setParams({ unit: "volt" })
            .getHomey("measure_voltage")),

    measure_current: HomeyConverter
        .create("measure_current")
        .createFloat("amperage", run => run
            .setParams({ unit: "ampere" })
            .getHomey("measure_current")),

    measure_luminance: HomeyConverter
        .create("measure_luminance")
        .createFloat("illumination", run => run
            .setParams({ unit: "illumination.lux" })
            .getHomey("measure_luminance")),

    alarm_motion: HomeyConverter
        .create("alarm_motion")
        .createEvent("motion", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey("alarm_motion", state => ["not_detected", "detected"][Number(state.value)])),

    alarm_contact: HomeyConverter
        .create("alarm_contact")
        .createEvent("open", run => run
            .setParams({ events: ["closed", "opened"] })
            .getHomey("alarm_contact", state => ["closed", "opened"][Number(state.value)])),

    alarm_co: HomeyConverter
        .create("alarm_co")
        .createEvent("gas", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey("alarm_co", state => ["not_detected", "detected"][Number(state.value)])),

    alarm_co2: HomeyConverter
        .create("alarm_co2")
        .createEvent("gas", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey("alarm_co2", state => ["not_detected", "detected"][Number(state.value)])),

    alarm_tamper: HomeyConverter
        .create("alarm_tamper")
        .createEvent("open", run => run
            .setParams({ events: ["closed", "opened"] })
            .getHomey("alarm_tamper", state => ["closed", "opened"][Number(state.value)])),

    alarm_smoke: HomeyConverter
        .create("alarm_smoke")
        .createEvent("smoke", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey("alarm_smoke", state => ["not_detected", "detected"][Number(state.value)])),

    alarm_water: HomeyConverter
        .create("alarm_water")
        .createEvent("water_leak", run => run
            .setParams({ events: ["dry", "leak"] })
            .getHomey("alarm_water", state => ["dry", "leak"][Number(state.value)])),

    alarm_battery: HomeyConverter
        .create("alarm_battery")
        .createEvent("battery_level", run => run
            .setParams({ events: ["normal", "low"] })
            .getHomey("alarm_battery", state => ["normal", "low"][Number(state.value)])),

    meter_power: HomeyConverter
        .create("meter_power")
        .createFloat("electricity_meter", run => run
            .setParams({ unit: "kilowatt_hour" })
            .getHomey("meter_power")),

    meter_water: HomeyConverter
        .create("meter_water")
        .createFloat("water_meter", run => run
            .setParams({ unit: "cubic_meter" })
            .getHomey("meter_water")),

    meter_gas: HomeyConverter
        .create("meter_gas")
        .createFloat("gas_meter", run => run
            .setParams({ unit: "cubic_meter" })
            .getHomey("meter_gas")),

    volume_set: HomeyConverter
        .create("volume_set")
        .createRange("volume", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getHomey("volume_set", state => state.value * 100)
            .setHomey("volume_set", value => value / 100)),
    
    volume_mute: HomeyConverter
        .create("volume_mute")
        .createToggle("mute", run => run
            .getHomey("volume_mute")
            .setHomey("volume_mute")),

    locked: HomeyConverter
        .create("locked")
        .createState(run => run
            .getHomey("locked", state => !state.value)
            .setHomey("locked", value => !value)),

    garagedoor_closed: HomeyConverter
        .create("garagedoor_closed")
        .createState(run => run
            .getHomey("garagedoor_closed", state => !state.value)
            .setHomey("garagedoor_closed", value => !value)),

    windowcoverings_closed: HomeyConverter
        .create("windowcoverings_closed")
        .createState(run => run
            .getHomey("windowcoverings_closed", state => !state.value)
            .setHomey("windowcoverings_closed", value => !value)),
    
    windowcoverings_set: HomeyConverter
        .create("windowcoverings_set")
        .createRange("open", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getHomey("windowcoverings_set", state => state.value * 100)
            .setHomey("windowcoverings_set", value => value / 100)),

    button: HomeyConverter
        .create("button")
        .createState(run => run
            .setParams({ split: true, retrievable: false })
            .getHomey("button", () => false)
            .setHomey("button", value => value === true && value || null)),

    speaker_playing: HomeyConverter
        .create("speaker_playing")
        .createState(run => run
            .getHomey("speaker_playing")
            .setHomey("speaker_playing")),
};