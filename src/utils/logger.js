// src/utils/logger.js

const timestamp = () => new Date().toISOString();

export function createLogger() {
    return {
        info: (message, ...args) => console.log(`[${timestamp()}] [INFO]`, message, ...args),
        warn: (message, ...args) => console.warn(`[${timestamp()}] [WARN]`, message, ...args),
        error: (message, ...args) => console.error(`[${timestamp()}] [ERROR]`, message, ...args),
        debug: (message, ...args) => {
            if (process.env.NODE_ENV === 'development') {
                console.debug(`[${timestamp()}] [DEBUG]`, message, ...args);
            }
        },
    };
}
