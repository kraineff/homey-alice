import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_water")
    .createEvent("water_leak", run => run
        .onGetParameters({ events: ["dry", "leak"] })
        .onGetCapability<boolean>("alarm_water", value => ["dry", "leak"][Number(value)]));