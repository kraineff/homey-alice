import { HomeyConverter } from "../converter";

export const DeviceConverters = {
    "com.irobot:roomba_vacuum": HomeyConverter
        .create("com.irobot:roomba_vacuum")
        .createState(run => run
            .getHomey("vacuum_state", state => ["clean", "quick", "spot", "train", "manual", "paused", "stopped"].includes(state.value))
            .setHomey("command_start_clean", value => value === true && true || null)
            .setHomey("command_dock", value => value === false && true || null))
        .createToggle("pause", run => run
            .getHomey("vacuum_state", state => ["paused", "stopped"].includes(state.value))
            .setHomey("command_pause", value => value === true && true || null)
            .setHomey("command_resume", value => value === false && true || null))
        .createFloat("meter", run => run
            .getHomey("measure_mission_minutes"))
        .createEvent("open", run => run
            .setParams({ events: ["opened", "closed"] })
            .getHomey("alarm_bin_removed", state => ["closed", "opened"][Number(state.value)])),
    
    "com.nokia.health:user": HomeyConverter
        .create("com.nokia.health:user")
        .createFloat("temperature", run => run
            .setParams({ unit: "temperature.celsius" })
            .getHomey("nh_measure_body_temperature"))
        .createFloat("pressure", run => run
            .setParams({ unit: "pressure.mmhg" })
            .getHomey("nh_measure_systolic_blood_pressure"))
        .createFloat("food_level", run => run
            .setParams({ unit: "percent" })
            .getHomey("nh_measure_fat_ratio"))
        .createFloat("meter", run => run
            .getHomey("nh_measure_weight")),

    // иногда dim иногда windowcoverings_set
    "com.fibaro:FGR-223": HomeyConverter
        .create("com.fibaro:FGR-223")
        .createRange("open", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getHomey("windowcoverings_set", state => state.value * 100)
            .setHomey("windowcoverings_set", value => value / 100)
            .getHomey("dim", state => state.value * 100)
            .setHomey("dim", value => value / 100)),

    "net.schmidt-cisternas.pcc-alt:aircon": HomeyConverter
        .create("net.schmidt-cisternas.pcc-alt:aircon")
        .createMode("fan_speed", run => run
            .setParams({ modes: ["auto", "low", "medium", "high"] })
            .getHomey("fan_speed", state => (({ Auto: "auto", Low: "low", Mid: "medium", High: "high" } as any)[state.value]))
            .setHomey("fan_speed", value => ({ auto: "Auto", low: "Low", medium: "Mid", high: "High" }[value])))
        .createMode("program", run => run
            .setParams({ modes: ["auto", "dry", "cool", "heat", "fan_only"] })
            .getHomey("operation_mode", state => (({ Auto: "auto", Dry: "dry", Cool: "cool", Heat: "heat", Fan: "fan_only" } as any)[state.value]))
            .setHomey("operation_mode", value => ({ auto: "Auto", dry: "Dry", cool: "Cool", heat: "Heat", fan_only: "Fan" }[value])))
};