import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("vacuumcleaner_job_mode")
    .createMode("cleanup_mode", run => run
        .onGetParameters({ modes: ["normal", "high", "turbo", "wet_cleaning", "auto"] })
        .onGetCapability<string>("vacuumcleaner_job_mode", value => ["normal", "high", "turbo", "auto"].includes(value) && value || value === "mop" && "wet_cleaning" || "@break")
        .onSetCapability<string>("vacuumcleaner_job_mode", value => value === "wet_cleaning" && "mop" || value));