import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("alarm_tank_open")
    .createEvent("open", run => run
        .onGetParameters({ events: ["closed", "opened"] })
        .onGetCapability<boolean>("alarm_tank_open", value => ["closed", "opened"][Number(value)]));