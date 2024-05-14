import { Elysia } from "elysia";
import { providerRoute } from "./routes/provider";
import { callbackRoute } from "./routes/callback";

const clientId = Bun.env.CLIENT_ID;
const clientSecret = Bun.env.CLIENT_SECRET;
const oauthToken = Bun.env.OAUTH_TOKEN;
const serverPort = Bun.env.SERVER_PORT;

if (!clientId || !clientSecret || !oauthToken || !serverPort)
    throw new Error("Нет переменных окружения");

new Elysia()
    .all("/", () => {})
    .use(providerRoute(clientId, clientSecret))
    .use(callbackRoute(oauthToken))
    .listen(serverPort);