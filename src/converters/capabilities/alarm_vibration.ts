import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_vibration")
    .createEvent("vibration", run => run
        .setParams({ events: ["vibration"] })
        .getHomey<boolean>("alarm_vibration", value => value && "vibration" || "@break"));