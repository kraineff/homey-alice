import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_motion")
    .createEvent("motion", run => run
        .onGetParameters({ events: ["not_detected", "detected"] })
        .onGetCapability<boolean>("alarm_motion", value => ["not_detected", "detected"][Number(value)]));