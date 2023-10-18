// const winston = require('winston');

// // Define log levels and colors
// const logLevels = {
//   error: 'error',
//   warn: 'warn',
//   info: 'info',
//   verbose: 'verbose',
//   debug: 'debug',
// };

// const logColors = {
//   error: 'red',
//   warn: 'yellow',
//   info: 'green',
//   verbose: 'cyan',
//   debug: 'blue',
// };

// // Create the logger
// const logger = winston.createLogger({
//   levels: logLevels,
//   format: winston.format.simple(), // You can customize the log format
//   transports: [
//     new winston.transports.Console({
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.simple()
//       ),
//       level: 'debug', // Set the desired log level
//     }),
//     new winston.transports.File({
//       filename: 'error.log',
//       level: 'error',
//     }),
//     new winston.transports.File({ filename: 'combined.log' }),
//   ],
// });

// // Define custom log function
// logger.stream = {
//   write: (message) => {
//     logger.info(message.trim());
//   },
// };

// module.exports = logger;


const winston = require('winston');

// Define log levels and colors
const logLevels = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  verbose: 'verbose',
  debug: 'debug',
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  verbose: 'cyan',
  debug: 'blue',
};

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.simple(), // You can customize the log format
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'info', // Set the desired log level
    }),
    new winston.transports.Stream({
      stream: process.stdout, // Use stdout for general logs
      level: 'warn', // Set the desired log level
    }),
    new winston.transports.Stream({
      stream: process.stderr, // Use stderr for error logs
      level: 'error', // Set the error log level
    }),
  ],
});

// Define custom log function
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;

