/**
 * Tiny ANSI-colored logger — no dependency, works in macOS Terminal & VS Code.
 *
 * Usage:
 *   log.info('api', 'listening on :4000');
 *   log.ok('mongo', 'connected to cluster0');
 *   log.warn('cache', 'redis miss');
 *   log.err('worker', 'job failed', err);
 */

/* eslint-disable no-console */
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
};

const TAG_COLORS: Record<string, string> = {
  api: C.cyan,
  mongo: C.green,
  redis: C.red,
  queue: C.magenta,
  worker: C.magenta,
  ws: C.blue,
  socket: C.blue,
  llm: C.yellow,
  cache: C.gray,
  pdf: C.cyan,
  env: C.gray,
  http: C.cyan,
};

function ts(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${C.dim}${hh}:${mm}:${ss}${C.reset}`;
}

function fmtTag(tag: string): string {
  const color = TAG_COLORS[tag] ?? C.white;
  return `${color}${C.bold}[${tag}]${C.reset}`;
}

function out(level: string, tag: string, msg: string, extra?: unknown) {
  const line = `${ts()} ${level} ${fmtTag(tag)} ${msg}`;
  if (extra !== undefined) console.log(line, extra);
  else console.log(line);
}

export const log = {
  info: (tag: string, msg: string, extra?: unknown) =>
    out(`${C.blue}ℹ${C.reset}`, tag, msg, extra),
  ok: (tag: string, msg: string, extra?: unknown) =>
    out(`${C.green}✓${C.reset}`, tag, msg, extra),
  warn: (tag: string, msg: string, extra?: unknown) =>
    out(`${C.yellow}⚠${C.reset}`, tag, msg, extra),
  err: (tag: string, msg: string, extra?: unknown) =>
    out(`${C.red}✗${C.reset}`, tag, msg, extra),
  step: (tag: string, msg: string, extra?: unknown) =>
    out(`${C.magenta}→${C.reset}`, tag, msg, extra),

  banner(lines: string[]) {
    const width = Math.max(...lines.map((l) => stripAnsi(l).length)) + 4;
    const top = `${C.cyan}╔${'═'.repeat(width)}╗${C.reset}`;
    const bot = `${C.cyan}╚${'═'.repeat(width)}╝${C.reset}`;
    console.log('\n' + top);
    for (const l of lines) {
      const pad = width - stripAnsi(l).length - 2;
      console.log(`${C.cyan}║${C.reset}  ${l}${' '.repeat(pad)}${C.cyan}║${C.reset}`);
    }
    console.log(bot + '\n');
  },
};

function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

export const colors = C;
