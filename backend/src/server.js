const app = require("./app");
const { ensurePostgresSchema } = require("./db/connection");
const { seedIfEmpty } = require("./db/seed");

const PORT = Number(process.env.PORT) || 5000;

async function ready() {
  await ensurePostgresSchema();
  await seedIfEmpty();
}

async function start() {
  try {
    await ready();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Ganesh CRM API listening on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  start();
}

module.exports = app;
module.exports.ready = ready;
