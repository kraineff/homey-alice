import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_water")
    .createEvent("water_leak", run => run
        .setParams({ events: ["dry", "leak"] })
        .getHomey<boolean>("alarm_water", value => ["dry", "leak"][Number(value)]));