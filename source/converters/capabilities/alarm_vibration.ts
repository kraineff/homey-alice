import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_vibration")
    .createEvent("vibration", run => run
        .setParameters({ events: ["vibration"] })
        .getCapability<boolean>("alarm_vibration", value => value && "vibration" || "@break"));