const fs = require("fs");
const { loadCommands } = require("./commandsLoader");
const { loadEvents } = require("./eventsLoader");

function watchUpdates(client) {
    fs.watch("./", { recursive: true }, async () => {
        Object.keys(require.cache).forEach(k => delete require.cache[k]);
        await loadCommands(client);
        await loadEvents(client);
        console.log("🔁 Reloaded all files");
    });
}

module.exports = { watchUpdates };
