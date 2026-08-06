const colors = { reset: "\x1b[0m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", cyan: "\x1b[36m" };
function ts() { return new Date().toISOString().replace("T", " ").slice(0, 19); }
module.exports = {
  info: (...a) => console.log(`${colors.cyan}[${ts()}]${colors.reset} ${colors.green}[INFO]${colors.reset}`, ...a),
  warn: (...a) => console.log(`${colors.yellow}[${ts()}]${colors.reset} ${colors.yellow}[WARN]${colors.reset}`, ...a),
  error: (...a) => console.log(`${colors.red}[${ts()}]${colors.reset} ${colors.red}[ERROR]${colors.reset}`, ...a),
  success: (...a) => console.log(`${colors.green}[${ts()}]${colors.reset} ${colors.green}[OK]${colors.reset}`, ...a),
};
