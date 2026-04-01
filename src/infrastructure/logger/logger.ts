import fs from 'node:fs';
import path from 'node:path';
import { addColors, createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from '../../config/environment';
import { colors, levels } from './levels';
import { consoleFormat, jsonFormat, redactFormat } from './formats';

addColors(colors);

const logDir = path.resolve(process.cwd(), env.log.dir);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const rotateTransportOptions = {
  dirname: logDir,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
};

export const logger = createLogger({
  level: env.log.level,
  levels,
  format: format.combine(redactFormat(), jsonFormat),
  defaultMeta: { service: env.app.name },
  transports: [
    new DailyRotateFile({
      ...rotateTransportOptions,
      filename: 'application-%DATE%.log',
    }),
    new DailyRotateFile({
      ...rotateTransportOptions,
      level: 'error',
      filename: 'error-%DATE%.log',
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ],
});

if (env.isDevelopment) {
  logger.add(
    new transports.Console({
      format: format.combine(redactFormat(), consoleFormat),
    }),
  );
}
