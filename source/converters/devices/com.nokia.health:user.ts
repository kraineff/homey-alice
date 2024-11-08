import { HomeyConverter } from "../converter";
import { DeviceType } from "../../typings";

export default () => HomeyConverter
    .create("com.nokia.health:user", DeviceType.Meter)
    .createFloat("temperature", run => run
        .setParameters({ unit: "temperature.celsius" })
        .getCapability<number>("nh_measure_body_temperature"))
    .createFloat("pressure", run => run
        .setParameters({ unit: "pressure.mmhg" })
        .getCapability<number>("nh_measure_systolic_blood_pressure"))
    .createFloat("food_level", run => run
        .setParameters({ unit: "percent" })
        .getCapability<number>("nh_measure_fat_ratio"))
    .createFloat("meter", run => run
        .getCapability<number>("nh_measure_weight"));