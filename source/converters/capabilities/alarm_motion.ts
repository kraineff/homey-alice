import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_motion")
    .createEvent("motion", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_motion", value => ["not_detected", "detected"][Number(value)]));