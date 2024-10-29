import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("com.sensibo:Sensibo")
    .createState(run => run
        .getHomey<boolean>("se_onoff")
        .setHomey<boolean>("se_onoff"))
    .createMode("thermostat", run => run
        .setParams({ modes: ["auto", "heat", "cool"] })
        .getHomey<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
        .setHomey<string>("thermostat_mode"))
    .createMode("fan_speed", run => run
        .setParams({ modes: ["quiet", "auto", "low", "medium", "high"] })
        .getHomey<string>("se_fanlevel", value => ["quiet", "auto", "low", "medium", "high"].includes(value) && value || "@break")
        .setHomey<string>("se_fanlevel"));