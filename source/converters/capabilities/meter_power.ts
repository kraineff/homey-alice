import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("meter_power")
    .createFloat("electricity_meter", run => run
        .setParameters({ unit: "kilowatt_hour" })
        .getCapability<number>("meter_power"));