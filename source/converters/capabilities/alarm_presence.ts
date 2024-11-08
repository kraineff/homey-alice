import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_presence")
    .createEvent("motion", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_presence", value => ["not_detected", "detected"][Number(value)]));