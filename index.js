const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { loadCommands } = require("./handlers/commandsLoader");
const { loadEvents } = require("./handlers/eventsLoader");
const { handleError } = require("./handlers/errorsHandler");
const { watchUpdates } = require("./handlers/updates");

const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials)
});

client.commands = new Collection();
client.config = require("./config");

process.on("unhandledRejection", err => handleError(err));
process.on("uncaughtException", err => handleError(err));

(async () => {
    await loadCommands(client);
    await loadEvents(client);
    watchUpdates(client);
    client.login(client.config.token);
})();
