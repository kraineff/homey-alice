import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_contact")
    .createEvent("open", run => run
        .onGetParameters({ events: ["closed", "opened"] })
        .onGetCapability<boolean>("alarm_contact", value => ["closed", "opened"][Number(value)]));