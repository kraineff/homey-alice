import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("locked")
    .createState(run => run
        .getCapability<boolean>("locked", value => !value)
        .setCapability<boolean>("locked", value => !value));