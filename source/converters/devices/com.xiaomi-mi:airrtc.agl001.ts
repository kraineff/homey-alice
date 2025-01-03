import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("com.xiaomi-mi:airrtc.agl001")
    .createState(run => run
        .onGetCapability<string>("thermostat_mode_AqaraTRV", value => ({ "off": false, "manual": true })[value] ?? "@break")
        .onSetCapability<string>("thermostat_mode_AqaraTRV", value => ["off", "manual"][Number(value)]))
    .createMode("thermostat", run => run
        .onGetParameters({ modes: ["auto"] })
        .onGetCapability<string>("thermostat_mode_AqaraTRV", value => value === "away" && "auto" || "@break")
        .onSetCapability<string>("thermostat_mode_AqaraTRV", value => value === "auto" && "away" || "@break"))
    .createEvent("open", run => run
        .onGetParameters({ events: ["closed", "opened"] })
        .onGetCapability<boolean>("alarm_window", value => ["closed", "opened"][Number(value)]));