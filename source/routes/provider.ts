import { Elysia, t } from "elysia";
import { ProviderService } from "../services/provider";

const userHeaders = t.Object({
    "authorization": t.TemplateLiteral("Bearer ${string}"),    
    "x-request-id":  t.String({ format: "uuid", default: "" }),
    "user-agent":    t.String({ pattern: "Yandex LLC", default: "" })
});

export const providerRoute = async (clientId: string, clientSecret: string) => {
    const service = new ProviderService(clientId, clientSecret);
    
    return new Elysia({ prefix: "/v1.0" })
        .head("/", () => {})
        .group("/user", { headers: userHeaders }, app => app
            .resolve(({ headers }) => {
                const token = headers["authorization"].slice(7);
                const requestId = headers["x-request-id"];
                return { token, requestId };
            })
            .onError(({ path, error }) => {
                console.log(`[Провайдер: ${path}] -> Ошибка: ${error}`);
            })
            .onAfterResponse(() => Bun.gc(true))
            .post("/unlink", async ({ token, requestId }) => {
                await service.userRemove(token);
                return { request_id: requestId };
            })
            .group("/devices", app => app
                .get("/", async ({ token, requestId }) => {
                    const payload = await service.getDevices(token);
                    return { request_id: requestId, payload };
                })
                .post("/query", async ({ token, requestId, body }) => {
                    const payload = await service.getStates(token, <any>body);
                    return { request_id: requestId, payload };
                })
                .post("/action", async ({ token, requestId, body }) => {
                    const payload = await service.setStates(token, <any>body);
                    return { request_id: requestId, payload };
                })
            )
        );
};