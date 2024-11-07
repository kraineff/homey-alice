import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("swing_mode")
    .createMode("cleanup_mode", run => run
        .setParams({ modes: ["vertical", "horizontal", "auto"] })
        .getHomey<string>("swing_mode", value => ["vertical", "horizontal"].includes(value) && value || value === "both" && "auto" || "@break")
        .setHomey<string>("swing_mode", value => value === "auto" && "both" || value));