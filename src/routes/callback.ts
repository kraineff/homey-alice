import { Elysia } from "elysia";

export const callbackRoute = (oauthToken: string) => {    
    return new Elysia({ prefix: "/callback" });
};