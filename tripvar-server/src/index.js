require("dotenv").config();
const app = require("./app");
const { info, error } = require("./utils/logger");

const PORT = process.env.PORT || 8000;

process.on("uncaughtException", (err) => {
  error("Uncaught Exception", { error: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  error("Unhandled Rejection", { error: err.stack });
  process.exit(1);
});

app.listen(PORT, () => {
  info(`Server is running on port ${PORT}`, {
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});
