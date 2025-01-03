import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("swing_mode")
    .createMode("cleanup_mode", run => run
        .onGetParameters({ modes: ["vertical", "horizontal", "auto"] })
        .onGetCapability<string>("swing_mode", value => ["vertical", "horizontal"].includes(value) && value || value === "both" && "auto" || "@break")
        .onSetCapability<string>("swing_mode", value => value === "auto" && "both" || value));