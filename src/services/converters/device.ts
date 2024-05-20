import { HomeyConverter } from "../converter";

export const DeviceConverters = {
    "com.irobot:roomba_vacuum": HomeyConverter
        .create("com.irobot:roomba_vacuum")
        .createState(run => run
            .getHomey<string>("vacuum_state", value => ["clean", "quick", "spot", "train", "manual", "paused", "stopped"].includes(value))
            .setHomey<boolean>("command_start_clean", value => value === true && true || undefined)
            .setHomey<boolean>("command_dock", value => value === false && true || undefined))
        .createToggle("pause", run => run
            .getHomey<string>("vacuum_state", value => ["paused", "stopped"].includes(value))
            .setHomey<boolean>("command_pause", value => value === true && true || undefined)
            .setHomey<boolean>("command_resume", value => value === false && true || undefined))
        .createFloat("meter", run => run
            .getHomey<number>("measure_mission_minutes"))
        .createEvent("open", run => run
            .setParams({ events: ["opened", "closed"] })
            .getHomey<boolean>("alarm_bin_removed", value => ["closed", "opened"][Number(value)])),
    
    "com.nokia.health:user": HomeyConverter
        .create("com.nokia.health:user")
        .createFloat("temperature", run => run
            .setParams({ unit: "temperature.celsius" })
            .getHomey<number>("nh_measure_body_temperature"))
        .createFloat("pressure", run => run
            .setParams({ unit: "pressure.mmhg" })
            .getHomey<number>("nh_measure_systolic_blood_pressure"))
        .createFloat("food_level", run => run
            .setParams({ unit: "percent" })
            .getHomey<number>("nh_measure_fat_ratio"))
        .createFloat("meter", run => run
            .getHomey<number>("nh_measure_weight")),

    // иногда dim иногда windowcoverings_set
    "com.fibaro:FGR-223": HomeyConverter
        .create("com.fibaro:FGR-223")
        .createRange("open", run => run
            .setParams({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getHomey<number>("windowcoverings_set", value => value * 100)
            .setHomey<number>("windowcoverings_set", value => value / 100)
            .getHomey<number>("dim", value => value * 100)
            .setHomey<number>("dim", value => value / 100)),

    "net.schmidt-cisternas.pcc-alt:aircon": HomeyConverter
        .create("net.schmidt-cisternas.pcc-alt:aircon")
        .createMode("fan_speed", run => run
            .setParams({ modes: ["auto", "low", "medium", "high"] })
            .getHomey<string>("fan_speed", value => (({ Auto: "auto", Low: "low", Mid: "medium", High: "high" } as any)[value]))
            .setHomey<string>("fan_speed", value => ({ auto: "Auto", low: "Low", medium: "Mid", high: "High" }[value])))
        .createMode("program", run => run
            .setParams({ modes: ["auto", "dry", "cool", "heat", "fan_only"] })
            .getHomey<string>("operation_mode", value => (({ Auto: "auto", Dry: "dry", Cool: "cool", Heat: "heat", Fan: "fan_only" } as any)[value]))
            .setHomey<string>("operation_mode", value => ({ auto: "Auto", dry: "Dry", cool: "Cool", heat: "Heat", fan_only: "Fan" }[value])))
};