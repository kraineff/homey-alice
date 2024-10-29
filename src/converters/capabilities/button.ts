import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("button")
    .createState(run => run
        .setParams({ split: true, retrievable: false })
        .getHomey<boolean>("button", () => false)
        .setHomey<boolean>("button", value => value === true && value || "@break"));