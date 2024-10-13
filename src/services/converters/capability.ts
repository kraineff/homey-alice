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
    
    // vacuumcleaner_state: HomeyConverter
    //     .create("vacuumcleaner_state"),

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
    
    // measure_noise: HomeyConverter
    //     .create("measure_noise"),
    
    // measure_rain: HomeyConverter
    //     .create("measure_rain"),
    
    // measure_wind_strength: HomeyConverter
    //     .create("measure_wind_strength"),
    
    // measure_wind_angle: HomeyConverter
    //     .create("measure_wind_angle"),
    
    // measure_gust_strength: HomeyConverter
    //     .create("measure_gust_strength"),
    
    // measure_gust_angle: HomeyConverter
    //     .create("measure_gust_angle"),
    
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
    
    // measure_ultraviolet: HomeyConverter
    //     .create("measure_ultraviolet"),
    
    // measure_water: HomeyConverter
    //     .create("measure_water"),
    
    // alarm_generic: HomeyConverter
    //     .create("alarm_generic"),
    
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
    
    // alarm_pm25: HomeyConverter
    //     .create("alarm_pm25"),
    
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
    
    // alarm_fire: HomeyConverter
    //     .create("alarm_fire"),
    
    // alarm_heat: HomeyConverter
    //     .create("alarm_heat"),
    
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
    
    // alarm_night: HomeyConverter
    //     .create("alarm_night"),
    
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
    
    // meter_rain: HomeyConverter
    //     .create("meter_rain"),
    
    // homealarm_state: HomeyConverter
    //     .create("homealarm_state"),
    
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
    
    // windowcoverings_state: HomeyConverter
    //     .create("windowcoverings_state"),
    
    // windowcoverings_tilt_up: HomeyConverter
    //     .create("windowcoverings_tilt_up"),
    
    // windowcoverings_tilt_down: HomeyConverter
    //     .create("windowcoverings_tilt_down"),
    
    // windowcoverings_tilt_set: HomeyConverter
    //     .create("windowcoverings_tilt_set"),
    
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
    
    // speaker_next: HomeyConverter
    //     .create("speaker_next"),
    
    // speaker_prev: HomeyConverter
    //     .create("speaker_prev"),
    
    // speaker_shuffle: HomeyConverter
    //     .create("speaker_shuffle"),
    
    // speaker_repeat: HomeyConverter
    //     .create("speaker_repeat"),
    
    // speaker_artist: HomeyConverter
    //     .create("speaker_artist"),
    
    // speaker_album: HomeyConverter
    //     .create("speaker_album"),
    
    // speaker_track: HomeyConverter
    //     .create("speaker_track"),
    
    // speaker_duration: HomeyConverter
    //     .create("speaker_duration"),
    
    // speaker_position: HomeyConverter
    //     .create("speaker_position"),
    
    // alarm_bin_full: HomeyConverter
    //     .create("alarm_bin_full"),

    // alarm_bin_missing: HomeyConverter
    //     .create("alarm_bin_missing"),

    // alarm_cleaning_pad_missing: HomeyConverter
    //     .create("alarm_cleaning_pad_missing"),

    // alarm_cold: HomeyConverter
    //     .create("alarm_cold"),

    // alarm_connectivity: HomeyConverter
    //     .create("alarm_connectivity"),

    // alarm_door_fault: HomeyConverter
    //     .create("alarm_door_fault"),

    alarm_gas: HomeyConverter
        .create("alarm_gas")
        .createEvent("gas", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey<boolean>("alarm_gas", value => ["not_detected", "detected"][Number(value)])),
        
    // alarm_light: HomeyConverter
    //     .create("alarm_light"),

    // alarm_lost: HomeyConverter
    //     .create("alarm_lost"),

    // alarm_moisture: HomeyConverter
    //     .create("alarm_moisture"),

    // alarm_noise: HomeyConverter
    //     .create("alarm_noise"),

    // alarm_occupancy: HomeyConverter
    //     .create("alarm_occupancy"),

    // alarm_pm01: HomeyConverter
    //     .create("alarm_pm01"),

    // alarm_pm1: HomeyConverter
    //     .create("alarm_pm1"),

    // alarm_pm10: HomeyConverter
    //     .create("alarm_pm10"),

    // alarm_power: HomeyConverter
    //     .create("alarm_power"),

    alarm_presence: HomeyConverter
        .create("alarm_presence")
        .createEvent("motion", run => run
            .setParams({ events: ["not_detected", "detected"] })
            .getHomey<boolean>("alarm_presence", value => ["not_detected", "detected"][Number(value)])),

    // alarm_problem: HomeyConverter
    //     .create("alarm_problem"),

    // alarm_pump_device: HomeyConverter
    //     .create("alarm_pump_device"),

    // alarm_pump_supply: HomeyConverter
    //     .create("alarm_pump_supply"),

    // alarm_running: HomeyConverter
    //     .create("alarm_running"),

    // alarm_safety: HomeyConverter
    //     .create("alarm_safety"),

    // alarm_stuck: HomeyConverter
    //     .create("alarm_stuck"),

    // alarm_tank_empty: HomeyConverter
    //     .create("alarm_tank_empty"),

    // alarm_tank_missing: HomeyConverter
    //     .create("alarm_tank_missing"),
        
    alarm_tank_open: HomeyConverter
        .create("alarm_tank_open")
        .createEvent("open", run => run
            .setParams({ events: ["closed", "opened"] })
            .getHomey<boolean>("alarm_tank_open", value => ["closed", "opened"][Number(value)])),

    alarm_vibration: HomeyConverter
        .create("alarm_vibration")
        .createEvent("vibration", run => run
            .setParams({ events: ["vibration"] })
            .getHomey<boolean>("alarm_vibration", value => value && "vibration" || "@break")),

    // audio_output: HomeyConverter
    //     .create("audio_output"),

    // battery_charging_state: HomeyConverter
    //     .create("battery_charging_state"),

    // dishwasher_program: HomeyConverter
    //     .create("dishwasher_program"),

    // docked: HomeyConverter
    //     .create("docked"),

    // fan_mode: HomeyConverter
    //     .create("fan_mode"),

    // fan_speed: HomeyConverter
    //     .create("fan_speed"),

    // heater_operation_mode: HomeyConverter
    //     .create("heater_operation_mode"),

    // measure_hepa_filter: HomeyConverter
    //     .create("measure_hepa_filter"),

    // hot_water_mode: HomeyConverter
    //     .create("hot_water_mode"),

    // laundry_washer_cycles: HomeyConverter
    //     .create("laundry_washer_cycles"),

    // laundry_washer_program: HomeyConverter
    //     .create("laundry_washer_program"),

    // laundry_washer_speed: HomeyConverter
    //     .create("laundry_washer_speed"),

    // level_aqi: HomeyConverter
    //     .create("level_aqi"),

    // level_carbon_filter: HomeyConverter
    //     .create("level_carbon_filter"),

    // level_ch2o: HomeyConverter
    //     .create("level_ch2o"),

    // level_co: HomeyConverter
    //     .create("level_co"),

    // level_co2: HomeyConverter
    //     .create("level_co2"),

    // level_nox: HomeyConverter
    //     .create("level_nox"),

    // level_o3: HomeyConverter
    //     .create("level_o3"),

    // level_pm1: HomeyConverter
    //     .create("level_pm1"),

    // level_pm01: HomeyConverter
    //     .create("level_pm01"),

    // level_pm10: HomeyConverter
    //     .create("level_pm10"),

    // level_pm25: HomeyConverter
    //     .create("level_pm25"),

    // level_radon: HomeyConverter
    //     .create("level_radon"),

    // level_so2: HomeyConverter
    //     .create("level_so2"),

    // level_tvoc: HomeyConverter
    //     .create("level_tvoc"),

    // measure_aqi: HomeyConverter
    //     .create("measure_aqi"),

    // measure_carbon_filter: HomeyConverter
    //     .create("measure_carbon_filter"),

    // measure_ch2o: HomeyConverter
    //     .create("measure_ch2o"),

    // measure_content_volume: HomeyConverter
    //     .create("measure_content_volume"),

    // measure_data_rate: HomeyConverter
    //     .create("measure_data_rate"),

    // measure_data_size: HomeyConverter
    //     .create("measure_data_size"),

    // measure_distance: HomeyConverter
    //     .create("measure_distance"),

    // measure_frequency: HomeyConverter
    //     .create("measure_frequency"),

    // level_hepa_filter: HomeyConverter
    //     .create("level_hepa_filter"),

    // measure_moisture: HomeyConverter
    //     .create("measure_moisture"),

    // measure_monetary: HomeyConverter
    //     .create("measure_monetary"),

    // measure_nox: HomeyConverter
    //     .create("measure_nox"),

    // measure_o3: HomeyConverter
    //     .create("measure_o3"),

    // measure_odor: HomeyConverter
    //     .create("measure_odor"),

    // measure_ph: HomeyConverter
    //     .create("measure_ph"),
    
    measure_pm1: HomeyConverter
        .create("measure_pm1")
        .createFloat("pm1_density", run => run
            .setParams({ unit: "density.mcg_m3" })
            .getHomey<number>("measure_pm1")),

    // measure_pm01: HomeyConverter
    //     .create("measure_pm01"),

    measure_pm10: HomeyConverter
        .create("measure_pm10")
        .createFloat("pm10_density", run => run
            .setParams({ unit: "density.mcg_m3" })
            .getHomey<number>("measure_pm10")),

    // measure_radon: HomeyConverter
    //     .create("measure_radon"),
    
    // measure_rain_intensity: HomeyConverter
    //     .create("measure_rain_intensity"),
    
    // measure_rotation: HomeyConverter
    //     .create("measure_rotation"),
    
    // measure_signal_strength: HomeyConverter
    //     .create("measure_signal_strength"),
    
    // measure_so2: HomeyConverter
    //     .create("measure_so2"),
    
    // measure_speed: HomeyConverter
    //     .create("measure_speed"),
    
    measure_tvoc: HomeyConverter
        .create("measure_tvoc")
        .createFloat("tvoc", run => run
            .setParams({ unit: "density.mcg_m3" })
            .getHomey<number>("measure_tvoc")),
    
    // measure_tvoc_index: HomeyConverter
    //     .create("measure_tvoc_index"),
    
    // measure_weight: HomeyConverter
    //     .create("measure_weight"),
    
    // media_input: HomeyConverter
    //     .create("media_input"),
    
    // mower_state: HomeyConverter
    //     .create("mower_state"),
    
    // operational_state: HomeyConverter
    //     .create("operational_state"),
    
    oscillating: HomeyConverter
        .create("oscillating")
        .createToggle("oscillation", run => run
            .getHomey<boolean>("oscillating")
            .setHomey<boolean>("oscillating")),
    
    // pump_mode: HomeyConverter
    //     .create("pump_mode"),
    
    // pump_setpoint: HomeyConverter
    //     .create("pump_setpoint"),
    
    // refrigerator_mode: HomeyConverter
    //     .create("refrigerator_mode"),
    
    // speaker_stop: HomeyConverter
    //     .create("speaker_stop"),
    
    swing_mode: HomeyConverter
        .create("swing_mode")
        .createMode("cleanup_mode", run => run
            .setParams({ modes: ["vertical", "horizontal", "auto"] })
            .getHomey<string>("swing_mode", value => ["vertical", "horizontal"].includes(value) && value || value === "both" && "auto" || "@break")
            .setHomey<string>("swing_mode", value => value === "auto" && "both" || value)),
    
    // target_humidity_max: HomeyConverter
    //     .create("target_humidity_max"),
    
    // target_humidity_min: HomeyConverter
    //     .create("target_humidity_min"),
    
    // target_humidity: HomeyConverter
    //     .create("target_humidity"),
    
    // target_temperature_level: HomeyConverter
    //     .create("target_temperature_level"),
    
    // target_temperature_max: HomeyConverter
    //     .create("target_temperature_max"),
    
    // target_temperature_min: HomeyConverter
    //     .create("target_temperature_min"),
    
    vacuumcleaner_job_mode: HomeyConverter
        .create("vacuumcleaner_job_mode")
        .createMode("cleanup_mode", run => run
            .setParams({ modes: ["normal", "high", "turbo", "wet_cleaning", "auto"] })
            .getHomey<string>("vacuumcleaner_job_mode", value => ["normal", "high", "turbo", "auto"].includes(value) && value || value === "mop" && "wet_cleaning" || "@break")
            .setHomey<string>("vacuumcleaner_job_mode", value => value === "wet_cleaning" && "mop" || value)),

    valve_position: HomeyConverter
        .create("valve_position")
        .createRange("open", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getHomey<number>("valve_position", value => value * 100)
            .setHomey<number>("valve_position", value => value / 100)),
};
