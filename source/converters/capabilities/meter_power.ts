import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("meter_power")
    .createFloat("electricity_meter", run => run
        .onGetParameters({ unit: "kilowatt_hour" })
        .onGetCapability<number>("meter_power"));