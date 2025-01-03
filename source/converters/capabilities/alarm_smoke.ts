import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_smoke")
    .createEvent("smoke", run => run
        .onGetParameters({ events: ["not_detected", "detected"] })
        .onGetCapability<boolean>("alarm_smoke", value => ["not_detected", "detected"][Number(value)]));