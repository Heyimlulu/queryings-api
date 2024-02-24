import winston, { createLogger, format } from "winston";
import dayjs from "dayjs";

const defaultFormat = format.printf(({ level, message }) => {
  return `${dayjs().format("YYYY-MM-DD")} ${level}: ${message}`;
});

export const logger = createLogger({
  format: winston.format.combine(winston.format.colorize(), defaultFormat),
  transports: [new winston.transports.Console()],
});
