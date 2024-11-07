import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("com.xiaomi-mi:airrtc.agl001")
    .createState(run => run
        .getHomey<string>("thermostat_mode_AqaraTRV", value => ({ "off": false, "manual": true })[value] ?? "@break")
        .setHomey<string>("thermostat_mode_AqaraTRV", value => ["off", "manual"][Number(value)]))
    .createMode("thermostat", run => run
        .setParams({ modes: ["auto"] })
        .getHomey<string>("thermostat_mode_AqaraTRV", value => value === "away" && "auto" || "@break")
        .setHomey<string>("thermostat_mode_AqaraTRV", value => value === "auto" && "away" || "@break"))
    .createEvent("open", run => run
        .setParams({ events: ["closed", "opened"] })
        .getHomey<boolean>("alarm_window", value => ["closed", "opened"][Number(value)]));