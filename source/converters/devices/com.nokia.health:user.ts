import { HomeyConverter } from "../converter";
import { DeviceType } from "../../typings";

export default () => HomeyConverter
    .create("com.nokia.health:user", DeviceType.Meter)
    .createFloat("temperature", run => run
        .setParams({ unit: "temperature.celsius" })
        .getHomey<number>("nh_measure_body_temperature"))
    .createFloat("pressure", run => run
        .setParams({ unit: "pressure.mmhg" })
        .getHomey<number>("nh_measure_systolic_blood_pressure"))
    .createFloat("food_level", run => run
        .setParams({ unit: "percent" })
        .getHomey<number>("nh_measure_fat_ratio"))
    .createFloat("meter", run => run
        .getHomey<number>("nh_measure_weight"));