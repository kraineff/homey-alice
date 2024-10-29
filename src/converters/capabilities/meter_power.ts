import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("meter_power")
    .createFloat("electricity_meter", run => run
        .setParams({ unit: "kilowatt_hour" })
        .getHomey<number>("meter_power"));