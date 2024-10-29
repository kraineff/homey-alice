import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("child_lock")
    .createToggle("controls_locked", run => run
        .getHomey<boolean>("child_lock")
        .setHomey<boolean>("child_lock"));