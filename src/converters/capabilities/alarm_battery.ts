import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_battery")
    .createEvent("battery_level", run => run
        .setParams({ events: ["normal", "low"] })
        .getHomey<boolean>("alarm_battery", value => ["normal", "low"][Number(value)]));