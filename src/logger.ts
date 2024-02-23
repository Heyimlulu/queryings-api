import winston, { createLogger, format } from "winston";
import dayjs from "dayjs";

const defaultFormat = format.printf(({ level, message, label }) => {
  return `${dayjs().format("YYYY-MM-DD")} [${label}] ${level}: ${message}`;
});

export const logger = (label: string) =>
  createLogger({
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.colorize(),
      defaultFormat
    ),
    transports: [new winston.transports.Console()],
  });
