import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("meter_water")
    .createFloat("water_meter", run => run
        .setParameters({ unit: "cubic_meter" })
        .getCapability<number>("meter_water"));