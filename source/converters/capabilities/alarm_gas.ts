import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_gas")
    .createEvent("gas", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_gas", value => ["not_detected", "detected"][Number(value)]));