import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("meter_gas")
    .createFloat("gas_meter", run => run
        .onGetParameters({ unit: "cubic_meter" })
        .onGetCapability<number>("meter_gas"));