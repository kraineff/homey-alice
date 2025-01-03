import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("com.irobot:roomba_vacuum")
    .createState(run => run
        .onGetCapability<string>("vacuum_state", value => ["clean", "quick", "spot", "train", "manual", "paused", "stopped"].includes(value))
        .onSetCapability<boolean>("command_start_clean", value => value === true && true || "@break")
        .onSetCapability<boolean>("command_dock", value => value === false && true || "@break"))
    .createToggle("pause", run => run
        .onGetCapability<string>("vacuum_state", value => ["paused", "stopped"].includes(value))
        .onSetCapability<boolean>("command_pause", value => value === true && true || "@break")
        .onSetCapability<boolean>("command_resume", value => value === false && true || "@break"))
    .createFloat("meter", run => run
        .onGetCapability<number>("measure_mission_minutes"))
    .createEvent("open", run => run
        .onGetParameters({ events: ["opened", "closed"] })
        .onGetCapability<boolean>("alarm_bin_removed", value => ["closed", "opened"][Number(value)]));