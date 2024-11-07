import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_co2")
    .createEvent("gas", run => run
        .setParams({ events: ["not_detected", "detected"] })
        .getHomey<boolean>("alarm_co2", value => ["not_detected", "detected"][Number(value)]));