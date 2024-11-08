import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_water")
    .createEvent("water_leak", run => run
        .setParameters({ events: ["dry", "leak"] })
        .getCapability<boolean>("alarm_water", value => ["dry", "leak"][Number(value)]));