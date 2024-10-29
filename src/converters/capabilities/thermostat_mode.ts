import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("thermostat_mode")
    .createState(run => run
        .getHomey<string>("thermostat_mode", value => ["heat", "auto", "cool"].includes(value))
        .setHomey<string>("thermostat_mode", value => ["off", "heat"][Number(value)]))
    .createMode("thermostat", run => run
        .setParams({ modes: ["auto", "heat", "cool"] })
        .getHomey<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
        .setHomey<string>("thermostat_mode"));