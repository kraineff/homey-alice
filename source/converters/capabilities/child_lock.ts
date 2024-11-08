import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("child_lock")
    .createToggle("controls_locked", run => run
        .getCapability<boolean>("child_lock")
        .setCapability<boolean>("child_lock"));