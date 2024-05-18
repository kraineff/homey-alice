import { HomeyConverter } from "../converter";
import { CapabilityConverters } from "./capability";

export const DeviceConverters = {
    "com.irobot:roomba_vacuum": new HomeyConverter()
        .use(CapabilityConverters.measure_battery)
        .createState(run => run
            .getHomey("vacuum_state", state => ["clean", "quick", "spot", "train", "manual", "paused", "stopped"].includes(state.value))
            .setHomey("command_dock", value => !value && true || null)
            .setHomey("command_start_clean", value => value && true || null))
        .createToggle("pause", run => run
            .getHomey("vacuum_state", state => ["paused", "stopped"].includes(state.value))
            .setHomey("command_resume", value => !value && true || null)
            .setHomey("command_pause", value => value && true || null))
        .createFloat("meter", run => run
            .getHomey("measure_mission_minutes"))
        .createEvent("open", run => run
            .setParams({ events: ["opened", "closed"] })
            .getHomey("alarm_bin_removed", state => ["closed", "opened"][Number(state.value)])),
    
    "com.nokia.health:user": new HomeyConverter()
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
    "com.fibaro:FGR-223": new HomeyConverter()
        .use(CapabilityConverters.meter_power)
        .use(CapabilityConverters.measure_power)
        .createRange("open", run => run
            .setParams({
                unit: "percent",
                range: [0, 100, 1]
            })
            .getHomey("windowcoverings_set", state => state.value * 100)
            .setHomey("windowcoverings_set", value => value / 100)
            .getHomey("dim", state => state.value * 100)
            .setHomey("dim", value => value / 100)),

    "net.schmidt-cisternas.pcc-alt:aircon": new HomeyConverter()
        .use(CapabilityConverters.onoff)
        .use(CapabilityConverters.measure_temperature)
        .use(CapabilityConverters.target_temperature)
        .createMode("fan_speed", run => run
            .setParams({ modes: ["auto", "low", "medium", "high"] })
            .getHomey("fan_speed", state => {
                const values: any = { Auto: "auto", Low: "low", Mid: "medium", High: "high" };
                return values[state.value];
            })
            .setHomey("fan_speed", value => {
                const values: any = { auto: "Auto", low: "Low", medium: "Mid", high: "High" };
                return values[value];
            }))
        .createMode("program", run => run
            .setParams({ modes: ["auto", "dry", "cool", "heat", "fan_only"] })
            .getHomey("operation_mode", state => {
                const values: any = { Auto: "auto", Dry: "dry", Cool: "cool", Heat: "heat", Fan: "fan_only" };
                return values[state.value];
            })
            .setHomey("operation_mode", value => {
                const values: any = { auto: "Auto", dry: "Dry", cool: "Cool", heat: "Heat", fan_only: "Fan" };
                return values[value];
            }))
};