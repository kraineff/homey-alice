import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("child_lock")
    .createToggle("controls_locked", run => run
        .onGetCapability<boolean>("child_lock")
        .onSetCapability<boolean>("child_lock"));