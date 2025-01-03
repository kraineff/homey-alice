import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_gas")
    .createEvent("gas", run => run
        .onGetParameters({ events: ["not_detected", "detected"] })
        .onGetCapability<boolean>("alarm_gas", value => ["not_detected", "detected"][Number(value)]));