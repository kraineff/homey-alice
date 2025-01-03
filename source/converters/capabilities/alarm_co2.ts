import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_co2")
    .createEvent("gas", run => run
        .onGetParameters({ events: ["not_detected", "detected"] })
        .onGetCapability<boolean>("alarm_co2", value => ["not_detected", "detected"][Number(value)]));