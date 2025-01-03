import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_presence")
    .createEvent("motion", run => run
        .onGetParameters({ events: ["not_detected", "detected"] })
        .onGetCapability<boolean>("alarm_presence", value => ["not_detected", "detected"][Number(value)]));