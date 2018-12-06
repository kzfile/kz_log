const winston = require("winston");
const {
    createLogger,
    format,
    transports
} = winston;
const {
    combine,
    printf
} = format;
require("winston-daily-rotate-file");
const moment = require("moment");
//default config
const default_config = {
    timestamp: false,
    console: false,
    timestamp_format: "YYYY-MM-DD HH:mm",
    log_folder: 'logs',
    err: {
        filename: "/error/%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxFiles: "14d",
        level: "error"
    },
    info: {
        filename: `/info/%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxFiles: "7d",
        level: "info"
    }
}

class logger {
    constructor(config) {
        if (global.iskzlog) return global.iskzlog;
        if (!config)
            config = default_config;
        else
            config = Object.assign(default_config, config)
        this.config = config;
        //if app is running in cluster,there will be more than one process 
        const procIndex =
            process.env.NODE_APP_INSTANCE == null ? 0 : process.env.NODE_APP_INSTANCE;

        //put all errors only into error logs 
        const filter = level =>
            format((info, opts) => {
                if (info.level != level) return false;
                return info;
            });

        config.info.format = combine(this.formatter(), filter("info")());
        let rootpath = process.cwd();
        config.info.filename = `${rootpath}/${config.log_folder}/p_${procIndex}${
            config.info.filename
            }`;
        config.err.format = combine(this.formatter(), filter("error")());
        config.err.filename = `${rootpath}/${config.log_folder}/p_${procIndex}${
            config.err.filename
            }`;

        let _transports = [
            new transports.DailyRotateFile(config.info),
            new transports.DailyRotateFile(config.err)
        ];
        let logger = createLogger({
            levels: winston.config.syslevels,
            transports: _transports,
            exitOnError: false
        });

        if (config.console) logger.add(new transports.Console());
        global.iskzlog = logger;
        return global.iskzlog;
    }

    formatter() {
        if (this.config.timestamp)
            //add timestamp to info
            return printf(info => {
                let timestamp = moment().format(
                    this.config.timestamp_format
                );
                if (typeof info.message == "string") {
                    info.message = `${info.level}:${info.message} (${timestamp})`;
                    return info.message;
                } else {
                    info.message.timestamp = info.message.timestamp ? info.message.timestamp : timestamp;
                    return JSON.stringify(info.message);
                }
            });
        else return printf(info => {
            if (typeof info.message == "string") {
                return info.message;
            } else {
                return JSON.stringify(info.message);
            };
        });
    }
}
module.exports = logger;