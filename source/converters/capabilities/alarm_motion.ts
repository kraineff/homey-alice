import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_motion")
    .createEvent("motion", run => run
        .setParams({ events: ["not_detected", "detected"] })
        .getHomey<boolean>("alarm_motion", value => ["not_detected", "detected"][Number(value)]));