import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("meter_gas")
    .createFloat("gas_meter", run => run
        .setParams({ unit: "cubic_meter" })
        .getHomey<number>("meter_gas"));