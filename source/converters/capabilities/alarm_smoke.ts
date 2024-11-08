import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_smoke")
    .createEvent("smoke", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_smoke", value => ["not_detected", "detected"][Number(value)]));