import { Elysia } from "elysia";
import { providerRoute } from "./routes/provider";

const clientId = Bun.env.CLIENT_ID;
const clientSecret = Bun.env.CLIENT_SECRET;
const oauthToken = Bun.env.OAUTH_TOKEN;

if (!clientId || !clientSecret || !oauthToken)
    throw new Error("Нет переменных окружения");

new Elysia()
    .all("/", () => {})
    .use(providerRoute(clientId, clientSecret))
    // .use(callbackRoute(oauthToken))
    .listen(Bun.env.SERVER_PORT ?? 3000);