import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_gas")
    .createEvent("gas", run => run
        .setParams({ events: ["not_detected", "detected"] })
        .getHomey<boolean>("alarm_gas", value => ["not_detected", "detected"][Number(value)]));