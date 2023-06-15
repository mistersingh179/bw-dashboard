import pino from "pino";

export default pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  // transport: {
  //   targets: [
  //     {
  //       level: process.env.PINO_LOG_LEVEL || "info",
  //       target: "pino-pretty",
  //       options: {},
  //     },
  //     {
  //       level: process.env.PINO_LOG_LEVEL || "info",
  //       target: "pino-file",
  //       options: { destination: `${__dirname}/app.log` },
  //     },
  //   ],
  // },
});
