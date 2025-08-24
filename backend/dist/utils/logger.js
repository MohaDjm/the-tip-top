"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequest = exports.logDebug = exports.logWarn = exports.logInfo = exports.logError = exports.morganStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Tell winston about our colors
winston_1.default.addColors(colors);
// Define format for logs
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define transports
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }),
    // File transport for errors
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
    }),
    // File transport for all logs
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'combined.log'),
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
    }),
];
// Create the logger
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    levels,
    format,
    transports,
    exitOnError: false,
});
// Create a stream object for Morgan HTTP logger
exports.morganStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
// Helper functions for common logging patterns
const logError = (message, error) => {
    if (error) {
        exports.logger.error(`${message}: ${error.message}`, { stack: error.stack });
    }
    else {
        exports.logger.error(message);
    }
};
exports.logError = logError;
const logInfo = (message, meta) => {
    exports.logger.info(message, meta);
};
exports.logInfo = logInfo;
const logWarn = (message, meta) => {
    exports.logger.warn(message, meta);
};
exports.logWarn = logWarn;
const logDebug = (message, meta) => {
    exports.logger.debug(message, meta);
};
exports.logDebug = logDebug;
// Request logging middleware
const logRequest = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
        if (res.statusCode >= 400) {
            exports.logger.warn(message);
        }
        else {
            exports.logger.http(message);
        }
    });
    next();
};
exports.logRequest = logRequest;
//# sourceMappingURL=logger.js.map