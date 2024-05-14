import { Elysia, t } from "elysia";
import { ProviderController } from "../controllers/provider";

const userHeaders = t.Object({
    "authorization": t.TemplateLiteral("Bearer ${string}"),    
    "x-request-id":  t.String({ format: "uuid", default: "" }),
    "user-agent":    t.String({ pattern: "Yandex LLC", default: "" })
});

export const providerRoute = (clientId: string, clientSecret: string) => {
    const storageFile = Bun.file("storage.json");
    const controller = new ProviderController(clientId, clientSecret, storageFile);
    
    return new Elysia({ prefix: "/v1.0" })
        .head("/", () => {})
        .group("/user", { headers: userHeaders }, app => app
            .resolve(({ headers }) => {
                const token = headers["authorization"].slice(7);
                const requestId = headers["x-request-id"];
                return { token, requestId };
            })
            .post("/unlink", async ({ token, requestId }) => {
                await controller.unlinkAccount(token);
                return { request_id: requestId };
            })
            .group("/devices", app => app
                .get("/", async ({ token, requestId }) => {
                    const payload = await controller.getDevices(token);
                    return { request_id: requestId, payload };
                })
                .post("/query", async ({ token, requestId, body }) => {
                    const payload = await controller.getStates(token, <any>body);
                    return { request_id: requestId, payload };
                })
                .post("/action", async ({ token, requestId, body }) => {
                    const payload = await controller.setStates(token, <any>body);
                    return { request_id: requestId, payload };
                })
            )
        );
};