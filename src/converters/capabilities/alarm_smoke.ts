import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_smoke")
    .createEvent("smoke", run => run
        .setParams({ events: ["not_detected", "detected"] })
        .getHomey<boolean>("alarm_smoke", value => ["not_detected", "detected"][Number(value)]));