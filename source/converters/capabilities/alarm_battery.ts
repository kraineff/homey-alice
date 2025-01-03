import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_battery")
    .createEvent("battery_level", run => run
        .onGetParameters({ events: ["normal", "low"] })
        .onGetCapability<boolean>("alarm_battery", value => ["normal", "low"][Number(value)]));