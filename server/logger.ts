type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
  [key: string]: unknown;
}

function log(level: LogLevel, msg: string, meta?: LogMeta) {
  const entry = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (msg: string, meta?: LogMeta) => log("info", msg, meta),
  warn: (msg: string, meta?: LogMeta) => log("warn", msg, meta),
  error: (msg: string, meta?: LogMeta) => log("error", msg, meta),
  debug: (msg: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV !== "production") log("debug", msg, meta);
  },
  audit: (action: string, userId: string, meta?: LogMeta) =>
    log("info", "AUDIT", { action, userId, ...meta }),
};
