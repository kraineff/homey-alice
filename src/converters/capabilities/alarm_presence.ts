import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_presence")
    .createEvent("motion", run => run
        .setParams({ events: ["not_detected", "detected"] })
        .getHomey<boolean>("alarm_presence", value => ["not_detected", "detected"][Number(value)]));