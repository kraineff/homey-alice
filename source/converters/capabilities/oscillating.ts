import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("oscillating")
    .createToggle("oscillation", run => run
        .getCapability<boolean>("oscillating")
        .setCapability<boolean>("oscillating"));