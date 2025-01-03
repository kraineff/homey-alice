import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("oscillating")
    .createToggle("oscillation", run => run
        .onGetCapability<boolean>("oscillating")
        .onSetCapability<boolean>("oscillating"));