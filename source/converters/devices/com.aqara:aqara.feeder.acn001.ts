import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("com.aqara:aqara.feeder.acn001")
    .createState(run => run
        .setParams({ split: true, retrievable: false })
        .getHomey<boolean>("feeder_action", () => false)
        .setHomey<boolean>("feeder_action", value => value === true && value || "@break"));