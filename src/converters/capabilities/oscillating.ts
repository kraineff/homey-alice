import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("oscillating")
    .createToggle("oscillation", run => run
        .getHomey<boolean>("oscillating")
        .setHomey<boolean>("oscillating"));