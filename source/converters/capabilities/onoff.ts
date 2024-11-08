import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("onoff")
    .createState(run => run
        .getCapability<boolean>("onoff")
        .setCapability<boolean>("onoff"));