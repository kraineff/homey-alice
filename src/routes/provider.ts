import { Elysia, t } from "elysia";
import { ProviderController } from "../controllers/provider";

const userHeaders = t.Object({
    "authorization": t.TemplateLiteral("Bearer ${string}"),    
    "x-request-id":  t.String({ format: "uuid", default: "" }),
    "user-agent":    t.String({ pattern: "Yandex LLC", default: "" })
});

export const providerRoute = async (clientId: string, clientSecret: string) => {
    const storageFile = Bun.file("storage.json");
    const controller = new ProviderController(clientId, clientSecret, storageFile);

    // Инициализация файла хранилища
    const storageExists = await storageFile.exists();
    !storageExists && await Bun.write(storageFile, JSON.stringify([]));
    
    return new Elysia({ prefix: "/v1.0" })
        .head("/", () => {})
        .group("/user", { headers: userHeaders }, app => app
            .resolve(({ headers }) => {
                const token = headers["authorization"].slice(7);
                const requestId = headers["x-request-id"];
                return { token, requestId };
            })
            .onError(({ path, error }) => {
                console.log(`[Провайдер: ${path}] -> Ошибка: ${error.message}`);
            })
            .post("/unlink", async ({ token, requestId }) => {
                await controller.userRemove(token);
                return { request_id: requestId };
            })
            .group("/devices", app => app
                .get("/", async ({ token, requestId }) => {
                    const payload = await controller.devicesDiscovery(token);
                    return { request_id: requestId, payload };
                })
                .post("/query", async ({ token, requestId, body }) => {
                    const payload = await controller.devicesQuery(token, <any>body);
                    return { request_id: requestId, payload };
                })
                .post("/action", async ({ token, requestId, body }) => {
                    const payload = await controller.devicesAction(token, <any>body);
                    return { request_id: requestId, payload };
                })
            )
        );
};