export type ActionResult = {
    status: "DONE" | "ERROR";
    error_code?: string;
    error_message?: string;
};

export * from "./capability";
export * from "./provider";
export * from "./device";