import { HomeyConverter } from "../converter";
import { DeviceType } from "../../typings";

export default HomeyConverter
    .create("com.nokia.health:user", DeviceType.Meter)
    .createFloat("temperature", run => run
        .onGetParameters({ unit: "temperature.celsius" })
        .onGetCapability<number>("nh_measure_body_temperature"))
    .createFloat("pressure", run => run
        .onGetParameters({ unit: "pressure.mmhg" })
        .onGetCapability<number>("nh_measure_systolic_blood_pressure"))
    .createFloat("food_level", run => run
        .onGetParameters({ unit: "percent" })
        .onGetCapability<number>("nh_measure_fat_ratio"))
    .createFloat("meter", run => run
        .onGetCapability<number>("nh_measure_weight"));