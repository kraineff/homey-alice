import { Elysia } from "elysia";
import { providerRoute } from "./routes/provider";
import { PrismaClient } from "@prisma/client";

const clientId = Bun.env.HOMEY_ID;
const clientSecret = Bun.env.HOMEY_SECRET;
const prisma = new PrismaClient();
await prisma.$connect();

if (!clientId || !clientSecret)
    throw new Error("Нет переменных окружения");

new Elysia()
    .all("/", () => {})
    .use(providerRoute(clientId, clientSecret))
    .listen(Bun.env.SERVER_PORT ?? 3000);