import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_co")
    .createEvent("gas", run => run
        .onGetParameters({ events: ["not_detected", "detected"] })
        .onGetCapability<boolean>("alarm_co", value => ["not_detected", "detected"][Number(value)]));