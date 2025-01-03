import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("thermostat_mode")
    .createState(run => run
        .onGetCapability<string>("thermostat_mode", value => ["heat", "auto", "cool"].includes(value))
        .onSetCapability<string>("thermostat_mode", value => ["off", "heat"][Number(value)]))
    .createMode("thermostat", run => run
        .onGetParameters({ modes: ["auto", "heat", "cool"] })
        .onGetCapability<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
        .onSetCapability<string>("thermostat_mode"));