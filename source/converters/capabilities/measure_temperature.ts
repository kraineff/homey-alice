import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_temperature")
    .createFloat("temperature", run => run
        .onGetParameters({ unit: "temperature.celsius" })
        .onGetCapability<number>("measure_temperature"));