import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("button")
    .createState(run => run
        .onGetParameters({ split: true, retrievable: false })
        .onGetCapability<boolean>("button", () => false)
        .onSetCapability<boolean>("button", value => value === true && value || "@break"));