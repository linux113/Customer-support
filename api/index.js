const app = require("../backend/src/app");
const { ready } = require("../backend/src/server");

let boot;

module.exports = async (req, res) => {
  if (!boot) boot = ready();
  await boot;
  return app(req, res);
};
