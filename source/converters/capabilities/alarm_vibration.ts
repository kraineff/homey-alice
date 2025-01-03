import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_vibration")
    .createEvent("vibration", run => run
        .onGetParameters({ events: ["vibration"] })
        .onGetCapability<boolean>("alarm_vibration", value => value && "vibration" || "@break"));