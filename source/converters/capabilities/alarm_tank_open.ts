import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("alarm_tank_open")
    .createEvent("open", run => run
        .setParameters({ events: ["closed", "opened"] })
        .getCapability<boolean>("alarm_tank_open", value => ["closed", "opened"][Number(value)]));