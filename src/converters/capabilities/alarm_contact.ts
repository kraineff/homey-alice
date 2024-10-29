import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_contact")
    .createEvent("open", run => run
        .setParams({ events: ["closed", "opened"] })
        .getHomey<boolean>("alarm_contact", value => ["closed", "opened"][Number(value)]));