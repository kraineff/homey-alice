import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("meter_water")
    .createFloat("water_meter", run => run
        .setParams({ unit: "cubic_meter" })
        .getHomey<number>("meter_water"));