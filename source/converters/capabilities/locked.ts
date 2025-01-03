import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("locked")
    .createState(run => run
        .onGetCapability<boolean>("locked", value => !value)
        .onSetCapability<boolean>("locked", value => !value));