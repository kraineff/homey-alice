import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("light_hue")
    .createColor("hsv", run => run
        .getHomey<number>("light_hue", value => ({ h: Math.round(value * 360), s: 100, v: 100 }))
        .getHomey<number>("light_saturation", value => ({ s: Math.round(value * 100), v: 100 }))
        .getHomey<string>("light_mode", value => value === "color" && "@prev" || "@break")
        .setHomey<number>("light_hue", value => value.h / 360)
        .setHomey<number>("light_saturation", value => value.s / 100)
        .setHomey<string>("light_mode", () => "color"));