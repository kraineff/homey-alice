import { HomeyConverter } from "../converter";

export const DeviceConverters = {
    "com.irobot:roomba_vacuum": new HomeyConverter()
        .createState(run => run
            .getHomey("vacuum_state", state => ["clean", "quick", "spot", "train", "manual", "paused", "stopped"].includes(state.value))
            .setHomey("command_dock", value => !value && true || null)
            .setHomey("command_start_clean", value => value && true || null))
        .createToggle("pause", run => run
            .getHomey("vacuum_state", state => ["paused", "stopped"].includes(state.value))
            .setHomey("command_resume", value => !value && true || null)
            .setHomey("command_pause", value => value && true || null))
        .createFloat("water_level", "percent", run => run
            .getHomey("tank_level"))
        .createEvent("open", ["opened", "closed"], run => run
            .getHomey("alarm_tank_lid_open", state => ["closed", "opened"][Number(state.value)])),
    
    "com.nokia.health:user": new HomeyConverter()
        .createFloat("temperature", "temperature.celsius", run => run
            .getHomey("nh_measure_body_temperature"))
        .createFloat("pressure", "pressure.mmhg", run => run
            .getHomey("nh_measure_diastolic_blood_pressure")),

    // иногда dim иногда windowcoverings_set
    "com.fibaro:FGR-223": new HomeyConverter()
        .createRange("open", "percent", [0, 100, 1], run => run
            .getHomey("windowcoverings_set", state => state.value * 100)
            .setHomey("windowcoverings_set", value => value / 100)
            .getHomey("dim", state => state.value * 100)
            .setHomey("dim", value => value / 100))
        .createFloat("electricity_meter", "kilowatt_hour", run => run
            .getHomey("meter_power"))
        .createFloat("power", "watt", run => run
            .getHomey("measure_power")),
};