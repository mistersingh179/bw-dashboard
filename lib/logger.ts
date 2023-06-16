import pino from "pino";

const pinoOptions:pino.LoggerOptions = {
  level: process.env.PINO_LOG_LEVEL || "info",
};

if(process.env.NODE_ENV === "development"){
  pinoOptions.transport = {
    target: "pino-pretty",
  };
}

export default pino(pinoOptions);
