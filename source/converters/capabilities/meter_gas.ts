import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("meter_gas")
    .createFloat("gas_meter", run => run
        .setParameters({ unit: "cubic_meter" })
        .getCapability<number>("meter_gas"));