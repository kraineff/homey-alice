import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_contact")
    .createEvent("open", run => run
        .setParameters({ events: ["closed", "opened"] })
        .getCapability<boolean>("alarm_contact", value => ["closed", "opened"][Number(value)]));