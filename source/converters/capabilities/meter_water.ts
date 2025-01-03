import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("meter_water")
    .createFloat("water_meter", run => run
        .onGetParameters({ unit: "cubic_meter" })
        .onGetCapability<number>("meter_water"));