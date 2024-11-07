import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_tank_open")
    .createEvent("open", run => run
        .setParams({ events: ["closed", "opened"] })
        .getHomey<boolean>("alarm_tank_open", value => ["closed", "opened"][Number(value)]));