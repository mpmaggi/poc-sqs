const chalk = require('chalk');

const head = (log) => console.log(chalk.grey(log));
const error = (log) => console.log(chalk.redBright(log));
const warn = (log) => console.log(chalk.yellowBright(log));
const info = (log) => console.log(chalk.greenBright(log));
const cyan = (log) => console.log(chalk.cyanBright(log));

module.exports = { head, error, warn, info, cyan };