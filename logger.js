const winston = require('winston');

class Logger {


    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'user-service' },
            transports: [
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log', level: 'info' }),
            ],
        });
    }

    info(message) {
        this.logger.log({ level: 'info', message: message });
    }

    error(message) {
        this.logger.log({ level: 'error', message: message });
    }

}

module.exports = Logger;
