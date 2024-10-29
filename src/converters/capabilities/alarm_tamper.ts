import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_tamper")
    .createEvent("open", run => run
        .setParams({ events: ["closed", "opened"] })
        .getHomey<boolean>("alarm_tamper", value => ["closed", "opened"][Number(value)]));