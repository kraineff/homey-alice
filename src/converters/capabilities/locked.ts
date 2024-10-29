import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("locked")
    .createState(run => run
        .getHomey<boolean>("locked", value => !value)
        .setHomey<boolean>("locked", value => !value));