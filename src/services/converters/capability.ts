import { HomeyConverter } from "../converter";

export const CapabilityConverters = {
    onoff: new HomeyConverter()
        .createState(run => run
            .getHomey("onoff")
            .setHomey("onoff")),
    
    dim: new HomeyConverter()
        .createRange("brightness", "percent", [0, 100, 1], run => run
            .getHomey("dim", state => state.value * 100)
            .setHomey("dim", value => value / 100)),
    
    light_hue: new HomeyConverter()
        .createColor(run => run
            .getHomey("light_hue", state => ({ h: Math.round(state.value * 360), s: 100, v: 100 }))
            .getHomey("light_saturation", state => ({ s: Math.round(state.value * 100), v: 100 }))
            .setHomey("light_hue", value => value.h / 360)
            .setHomey("light_saturation", value => value.s / 100)),
    
    thermostat_mode: new HomeyConverter()
        .createState(run => run
            .getHomey("thermostat_mode", state => ["heat", "auto", "cool"].includes(state.value))
            .setHomey("thermostat_mode", value => ["off", "heat"][Number(value)]))
        .createMode("thermostat", ["auto", "heat", "cool"], run => run
            .getHomey("thermostat_mode", state => ["auto", "heat", "cool"].includes(state.value) && state.value || null)
            .setHomey("thermostat_mode")),
        
    target_temperature: new HomeyConverter()
        .createRange("temperature", "temperature.celsius", [4, 35, 0.5], run => run
            .getHomey("target_temperature")
            .setHomey("target_temperature")),

    measure_temperature: new HomeyConverter()
        .createFloat("temperature", "temperature.celsius", run => run
            .getHomey("measure_temperature")),

    measure_co: new HomeyConverter()
        .createFloat("co2_level", "ppm", run => run
            .getHomey("measure_co")),

    measure_co2: new HomeyConverter()
        .createFloat("co2_level", "ppm", run => run
            .getHomey("measure_co2")),

    measure_pm25: new HomeyConverter()
        .createFloat("pm2.5_density", "density.mcg_m3", run => run
            .getHomey("measure_pm25")),

    measure_humidity: new HomeyConverter()
        .createFloat("humidity", "percent", run => run
            .getHomey("measure_humidity")),

    measure_pressure: new HomeyConverter()
        .createFloat("pressure", "pressure.bar", run => run
            .getHomey("measure_pressure", state => state.value * 0.001)),

    measure_battery: new HomeyConverter()
        .createFloat("battery_level", "percent", run => run
            .getHomey("measure_battery")),

    measure_power: new HomeyConverter()
        .createFloat("power", "watt", run => run
            .getHomey("measure_power")),

    measure_voltage: new HomeyConverter()
        .createFloat("voltage", "volt", run => run
            .getHomey("measure_voltage")),

    measure_current: new HomeyConverter()
        .createFloat("amperage", "ampere", run => run
            .getHomey("measure_current")),

    measure_luminance: new HomeyConverter()
        .createFloat("illumination", "illumination.lux", run => run
            .getHomey("measure_luminance")),

    alarm_motion: new HomeyConverter()
        .createEvent("motion", ["not_detected", "detected"], run => run
            .getHomey("alarm_motion", state => ["not_detected", "detected"][Number(state.value)])),

    alarm_contact: new HomeyConverter()
        .createEvent("open", ["closed", "opened"], run => run
            .getHomey("alarm_contact", state => ["closed", "opened"][Number(state.value)])),

    alarm_co: new HomeyConverter()
        .createEvent("gas", ["not_detected", "detected"], run => run
            .getHomey("alarm_co", state => ["not_detected", "detected"][Number(state.value)])),

    alarm_co2: new HomeyConverter()
        .createEvent("gas", ["not_detected", "detected"], run => run
            .getHomey("alarm_co2", state => ["not_detected", "detected"][Number(state.value)])),

    alarm_tamper: new HomeyConverter()
        .createEvent("open", ["closed", "opened"], run => run
            .getHomey("alarm_tamper", state => ["closed", "opened"][Number(state.value)])),

    alarm_smoke: new HomeyConverter()
        .createEvent("smoke", ["not_detected", "detected"], run => run
            .getHomey("alarm_smoke", state => ["not_detected", "detected"][Number(state.value)])),

    alarm_water: new HomeyConverter()
        .createEvent("water_leak", ["dry", "leak"], run => run
            .getHomey("alarm_water", state => ["dry", "leak"][Number(state.value)])),

    alarm_battery: new HomeyConverter()
        .createEvent("battery_level", ["normal", "low"], run => run
            .getHomey("alarm_battery", state => ["normal", "low"][Number(state.value)])),

    meter_power: new HomeyConverter()
        .createFloat("electricity_meter", "kilowatt_hour", run => run
            .getHomey("meter_power")),

    meter_water: new HomeyConverter()
        .createFloat("water_meter", "cubic_meter", run => run
            .getHomey("meter_water")),

    meter_gas: new HomeyConverter()
        .createFloat("gas_meter", "cubic_meter", run => run
            .getHomey("meter_gas")),

    volume_set: new HomeyConverter()
        .createRange("volume", "percent", [0, 100, 1], run => run
            .getHomey("volume_set", state => state.value * 100)
            .setHomey("volume_set", value => value / 100)),
    
    volume_mute: new HomeyConverter()
        .createToggle("mute", run => run
            .getHomey("volume_mute")
            .setHomey("volume_mute")),

    locked: new HomeyConverter()
        .createState(run => run
            .getHomey("locked", state => !state.value)
            .setHomey("locked", value => !value)),

    garagedoor_closed: new HomeyConverter()
        .createState(run => run
            .getHomey("garagedoor_closed")
            .setHomey("garagedoor_closed")),

    windowcoverings_closed: new HomeyConverter()
        .createState(run => run
            .getHomey("windowcoverings_closed")
            .setHomey("windowcoverings_closed")),
    
    windowcoverings_set: new HomeyConverter()
        .createRange("open", "percent", [0, 100, 1], run => run
            .getHomey("windowcoverings_set", state => state.value * 100)
            .setHomey("windowcoverings_set", value => value / 100)),

    button: new HomeyConverter()
        .createState(run => run
            .getHomey("button", () => false)
            .setHomey("button", value => value && value || null)),

    speaker_playing: new HomeyConverter()
        .createState(run => run
            .getHomey("speaker_playing")
            .setHomey("speaker_playing")),
};