/**
 * Mock implementation of the 'ora' spinner package
 * This simplifies CLI-like output in a browser context
 */

interface Spinner {
  start: () => Spinner;
  stop: () => Spinner;
  succeed: (text?: string | { text: string }) => Spinner;
  fail: (text?: string | { text: string }) => Spinner;
  warn: (text?: string | { text: string }) => Spinner;
  info: (text?: string | { text: string }) => Spinner;
  error: (text?: string | { text: string }) => Spinner;
  text: string;
}

/**
 * Creates a spinner for terminal output
 * In browser contexts, this is a no-op that just logs to console
 */
export default function ora(options: string | { text: string }): Spinner {
  const text = typeof options === 'string' ? options : options.text;
  
  const spinner: Spinner = {
    text,
    start: () => {
      console.log(`🔄 ${text}`);
      return spinner;
    },
    stop: () => {
      console.log(`⏹️ ${text}`);
      return spinner;
    },
    succeed: (newText?: string | { text: string }) => {
      let message = text;
      if (newText) {
        message = typeof newText === 'string' ? newText : newText.text;
      }
      console.log(`✅ ${message}`);
      return spinner;
    },
    fail: (newText?: string | { text: string }) => {
      let message = text;
      if (newText) {
        message = typeof newText === 'string' ? newText : newText.text;
      }
      console.log(`❌ ${message}`);
      return spinner;
    },
    warn: (newText?: string | { text: string }) => {
      let message = text;
      if (newText) {
        message = typeof newText === 'string' ? newText : newText.text;
      }
      console.log(`⚠️ ${message}`);
      return spinner;
    },
    info: (newText?: string | { text: string }) => {
      let message = text;
      if (newText) {
        message = typeof newText === 'string' ? newText : newText.text;
      }
      console.log(`ℹ️ ${message}`);
      return spinner;
    },
    error: (newText?: string | { text: string }) => {
      let message = text;
      if (newText) {
        message = typeof newText === 'string' ? newText : newText.text;
      }
      console.log(`🔴 ${message}`);
      return spinner;
    }
  };
  
  return spinner;
} 