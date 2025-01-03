import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_tamper")
    .createEvent("open", run => run
        .onGetParameters({ events: ["closed", "opened"] })
        .onGetCapability<boolean>("alarm_tamper", value => ["closed", "opened"][Number(value)]));