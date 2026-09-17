/* ============================================================
   SCIENTIFIC CALCULATOR – script.js
   Supports: Arithmetic, Trigonometry (DEG/RAD), Powers, Roots,
             Logarithms, Factorials, Parentheses, Memory (MC/MR/M+/M-),
             Constants (π, e), Ans, Live Preview, and Full Keyboard.
============================================================ */

'use strict';

// ─── State ────────────────────────────────────────────────
const state = {
  expression: '',       // The full formula being typed (e.g. "12 + 5 × (3 ^ 2)")
  currentInput: '0',    // The current number token being entered
  lastAnswer: '0',      // Previous result (Ans)
  memory: 0,            // Stored memory value (M)
  angleMode: 'DEG',     // 'DEG' or 'RAD'
  evaluated: false,     // True right after "=" was pressed
};

// ─── DOM Elements ─────────────────────────────────────────
const elCurrent     = document.getElementById('current');
const elHistory     = document.getElementById('history');
const elPreview     = document.getElementById('live-preview');
const elDegRadBtn   = document.getElementById('btn-deg-rad');
const elMemoryBadge = document.getElementById('badge-memory');
const buttonsGrid   = document.getElementById('buttons-grid');

// ─── Math Utilities ───────────────────────────────────────

/** Factorial calculation with safety bounds */
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS Number limit
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/** Convert angle based on current mode */
function toRadians(val) {
  return state.angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
}

/** Clean floating point inaccuracies (e.g. 0.1 + 0.2 => 0.3) */
function formatResult(num) {
  if (num === null || num === undefined || Number.isNaN(num)) return 'Error';
  if (!Number.isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Fix precision quirks like sin(180 deg) yielding 1.22e-16 instead of 0
  if (Math.abs(num) < 1e-14) return '0';

  // Cap display length while preserving precision
  const prec = parseFloat(num.toPrecision(12));
  return prec.toString();
}

/** Check if character is an arithmetic operator */
function isOperator(char) {
  return ['+', '−', '×', '÷', '^', 'mod'].includes(char);
}

// ─── Tokenizer & Shunting-Yard Evaluator ───────────────────

/**
 * Safely parse and evaluate mathematical expressions supporting:
 * +, −, ×, ÷, ^, mod, and parentheses ()
 */
function evaluateExpression(expr) {
  if (!expr || expr.trim() === '') return 0;

  // Replace friendly symbols with standard tokens
  let str = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/mod/g, '%');

  // Tokenize numbers, operators, parens
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including decimals and negative numbers at start or after operator/paren)
    if (
      /[\d.]/.test(ch) ||
      (ch === '-' && (i === 0 || ['(', '+', '-', '*', '/', '%', '^'].includes(tokens[tokens.length - 1])))
    ) {
      let numStr = ch;
      i++;
      while (i < str.length && /[\d.]/.test(str[i])) {
        numStr += str[i];
        i++;
      }
      tokens.push(parseFloat(numStr));
      continue;
    }

    if (['+', '-', '*', '/', '%', '^', '(', ')'].includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }

    i++;
  }

  // Precedence map
  const precedence = {
    '+': 1, '-': 1,
    '*': 2, '/': 2, '%': 2,
    '^': 3
  };

  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (typeof token === 'number') {
      outputQueue.push(token);
    } else if (token === '^') {
      operatorStack.push(token); // Right-associative
    } else if (token in precedence) {
      while (
        operatorStack.length &&
        operatorStack[operatorStack.length - 1] in precedence &&
        ((token !== '^' && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) ||
         (token === '^' && precedence[operatorStack[operatorStack.length - 1]] > precedence[token]))
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop());
      }
      if (operatorStack.length && operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop();
      }
    }
  }

  while (operatorStack.length) {
    outputQueue.push(operatorStack.pop());
  }

  // Evaluate Reverse Polish Notation (RPN)
  const evalStack = [];
  for (const item of outputQueue) {
    if (typeof item === 'number') {
      evalStack.push(item);
    } else {
      const b = evalStack.pop();
      const a = evalStack.pop();
      if (a === undefined || b === undefined) return NaN;

      let res = 0;
      switch (item) {
        case '+': res = a + b; break;
        case '-': res = a - b; break;
        case '*': res = a * b; break;
        case '/':
          if (b === 0) return Infinity;
          res = a / b;
          break;
        case '%':
          if (b === 0) return NaN;
          res = a % b;
          break;
        case '^': res = Math.pow(a, b); break;
        default: return NaN;
      }
      evalStack.push(res);
    }
  }

  return evalStack.length === 1 ? evalStack[0] : NaN;
}

// ─── Display & UI Updates ─────────────────────────────────

function updateDisplay() {
  // Update Current input display
  let text = state.currentInput;
  elCurrent.classList.remove('shrink-sm', 'shrink-xs', 'error');

  if (text === 'Error' || text === 'NaN') {
    elCurrent.classList.add('error');
    elCurrent.textContent = 'Error';
  } else {
    if (text.length >= 16) elCurrent.classList.add('shrink-xs');
    else if (text.length >= 11) elCurrent.classList.add('shrink-sm');
    elCurrent.textContent = text;
  }

  // Update Expression History display
  elHistory.textContent = state.expression;

  // Real-time live evaluation preview
  updateLivePreview();

  // Update Memory badge
  if (state.memory !== 0) {
    elMemoryBadge.classList.add('active');
  } else {
    elMemoryBadge.classList.remove('active');
  }
}

function updateLivePreview() {
  if (!state.expression || state.evaluated) {
    elPreview.textContent = '';
    return;
  }

  // Construct potential expression
  let testExpr = state.expression;
  if (state.currentInput !== '0' && state.currentInput !== '') {
    testExpr += ' ' + state.currentInput;
  }

  // Auto-close open parentheses for the preview
  const openCount = (testExpr.match(/\(/g) || []).length;
  const closeCount = (testExpr.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    testExpr += ')'.repeat(openCount - closeCount);
  }

  try {
    const val = evaluateExpression(testExpr);
    if (!Number.isNaN(val) && Number.isFinite(val)) {
      elPreview.textContent = '= ' + formatResult(val);
    } else {
      elPreview.textContent = '';
    }
  } catch {
    elPreview.textContent = '';
  }
}

function flashDisplay() {
  elCurrent.classList.remove('result-flash');
  void elCurrent.offsetWidth;
  elCurrent.classList.add('result-flash');
}

// ─── Calculator Actions ───────────────────────────────────

function inputDigit(digit) {
  if (state.evaluated || state.currentInput === 'Error') {
    state.currentInput = digit;
    state.evaluated = false;
  } else {
    if (state.currentInput === '0') {
      state.currentInput = digit;
    } else {
      if (state.currentInput.length >= 18) return;
      state.currentInput += digit;
    }
  }
  updateDisplay();
}

function inputDot() {
  if (state.evaluated || state.currentInput === 'Error') {
    state.currentInput = '0.';
    state.evaluated = false;
    updateDisplay();
    return;
  }

  if (!state.currentInput.includes('.')) {
    state.currentInput += '.';
    updateDisplay();
  }
}

function toggleSign() {
  if (state.currentInput === '0' || state.currentInput === 'Error') return;
  if (state.currentInput.startsWith('-')) {
    state.currentInput = state.currentInput.slice(1);
  } else {
    state.currentInput = '-' + state.currentInput;
  }
  updateDisplay();
}

function inputOperator(op) {
  if (state.currentInput === 'Error') clearAll();

  if (state.evaluated) {
    state.expression = state.currentInput + ' ' + op;
    state.currentInput = '0';
    state.evaluated = false;
  } else {
    if (state.currentInput !== '') {
      state.expression = (state.expression ? state.expression + ' ' : '') + state.currentInput + ' ' + op;
      state.currentInput = '0';
    } else if (state.expression !== '') {
      // Replace trailing operator if user taps a different operator
      const tokens = state.expression.trim().split(' ');
      if (isOperator(tokens[tokens.length - 1])) {
        tokens[tokens.length - 1] = op;
        state.expression = tokens.join(' ');
      }
    }
  }
  updateDisplay();
}

function inputParenthesis(p) {
  if (p === '(') {
    if (state.evaluated) {
      state.expression = '(';
      state.currentInput = '0';
      state.evaluated = false;
    } else {
      state.expression = (state.expression ? state.expression + ' ' : '') + '(';
      state.currentInput = '0';
    }
  } else if (p === ')') {
    if (state.currentInput !== '0' && state.currentInput !== '') {
      state.expression = (state.expression ? state.expression + ' ' : '') + state.currentInput + ' )';
      state.currentInput = '0';
    } else {
      state.expression = (state.expression ? state.expression + ' ' : '') + ')';
    }
  }
  updateDisplay();
}

function inputConstant(constName) {
  let val = 0;
  if (constName === 'pi') val = Math.PI;
  if (constName === 'e') val = Math.E;

  state.currentInput = formatResult(val);
  state.evaluated = false;
  updateDisplay();
}

function inputAns() {
  state.currentInput = state.lastAnswer;
  state.evaluated = false;
  updateDisplay();
}

/** Execute immediate Unary / Scientific functions on currentInput */
function executeUnary(fnName) {
  const val = parseFloat(state.currentInput);
  if (Number.isNaN(val)) return;

  let result = 0;
  switch (fnName) {
    case 'sin':
      result = Math.sin(toRadians(val));
      break;
    case 'cos':
      result = Math.cos(toRadians(val));
      break;
    case 'tan':
      if (state.angleMode === 'DEG' && Math.abs(val % 180) === 90) {
        result = NaN; // undefined for tan 90, 270
      } else {
        result = Math.tan(toRadians(val));
      }
      break;
    case 'ln':
      result = val > 0 ? Math.log(val) : NaN;
      break;
    case 'log':
      result = val > 0 ? Math.log10(val) : NaN;
      break;
    case 'sqr':
      result = Math.pow(val, 2);
      break;
    case 'cube':
      result = Math.pow(val, 3);
      break;
    case 'sqrt':
      result = val >= 0 ? Math.sqrt(val) : NaN;
      break;
    case 'inv':
      result = val !== 0 ? 1 / val : NaN;
      break;
    case 'fact':
      result = factorial(val);
      break;
    case 'abs':
      result = Math.abs(val);
      break;
    default:
      return;
  }

  state.currentInput = formatResult(result);
  state.evaluated = false;
  flashDisplay();
  updateDisplay();
}

function executePercent() {
  const val = parseFloat(state.currentInput);
  if (Number.isNaN(val)) return;
  state.currentInput = formatResult(val / 100);
  updateDisplay();
}

function backspace() {
  if (state.evaluated) {
    state.expression = '';
    state.evaluated = false;
    updateDisplay();
    return;
  }

  if (state.currentInput.length > 1) {
    state.currentInput = state.currentInput.slice(0, -1);
  } else {
    state.currentInput = '0';
  }
  updateDisplay();
}

function clearAll() {
  state.expression = '';
  state.currentInput = '0';
  state.evaluated = false;
  elPreview.textContent = '';
  updateDisplay();
}

function calculateEquals() {
  let fullExpr = state.expression;
  if (state.currentInput !== '0' && state.currentInput !== '') {
    fullExpr = (fullExpr ? fullExpr + ' ' : '') + state.currentInput;
  } else if (!fullExpr) {
    fullExpr = state.currentInput;
  }

  if (!fullExpr) return;

  // Auto-close any unclosed parens
  const openCount = (fullExpr.match(/\(/g) || []).length;
  const closeCount = (fullExpr.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    fullExpr += ' )'.repeat(openCount - closeCount);
  }

  try {
    const res = evaluateExpression(fullExpr);
    const formatted = formatResult(res);

    state.expression = fullExpr + ' =';
    state.currentInput = formatted;
    state.lastAnswer = formatted === 'Error' ? '0' : formatted;
    state.evaluated = true;
    flashDisplay();
  } catch {
    state.currentInput = 'Error';
    state.evaluated = true;
  }

  updateDisplay();
}

// ─── Memory Functions ─────────────────────────────────────

function handleMemory(action) {
  const currentVal = parseFloat(state.currentInput) || 0;

  switch (action) {
    case 'mem-clear':
      state.memory = 0;
      break;
    case 'mem-recall':
      state.currentInput = formatResult(state.memory);
      state.evaluated = false;
      break;
    case 'mem-add':
      state.memory += currentVal;
      flashDisplay();
      break;
    case 'mem-sub':
      state.memory -= currentVal;
      flashDisplay();
      break;
  }
  updateDisplay();
}

// ─── Angle Mode (DEG / RAD) ───────────────────────────────

elDegRadBtn.addEventListener('click', () => {
  state.angleMode = state.angleMode === 'DEG' ? 'RAD' : 'DEG';
  elDegRadBtn.textContent = state.angleMode;
  updateLivePreview();
});

// ─── Click Event Delegator ────────────────────────────────

buttonsGrid.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  // Ripple / press animation
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 140);

  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit':      inputDigit(value); break;
    case 'dot':        inputDot(); break;
    case 'sign':       toggleSign(); break;
    case 'operator':   inputOperator(value); break;
    case 'paren':      inputParenthesis(value); break;
    case 'unary':      executeUnary(value); break;
    case 'percent':    executePercent(); break;
    case 'constant':   inputConstant(value); break;
    case 'ans':        inputAns(); break;
    case 'backspace':  backspace(); break;
    case 'clear':      clearAll(); break;
    case 'equals':     calculateEquals(); break;
    case 'mem-clear':
    case 'mem-recall':
    case 'mem-add':
    case 'mem-sub':
      handleMemory(action);
      break;
  }
});

// ─── Complete Keyboard Support ────────────────────────────

const KEY_MAPPINGS = {
  '0': () => inputDigit('0'),
  '1': () => inputDigit('1'),
  '2': () => inputDigit('2'),
  '3': () => inputDigit('3'),
  '4': () => inputDigit('4'),
  '5': () => inputDigit('5'),
  '6': () => inputDigit('6'),
  '7': () => inputDigit('7'),
  '8': () => inputDigit('8'),
  '9': () => inputDigit('9'),
  '.': () => inputDot(),
  ',': () => inputDot(),
  '+': () => inputOperator('+'),
  '-': () => inputOperator('−'),
  '*': () => inputOperator('×'),
  'x': () => inputOperator('×'),
  '/': () => inputOperator('÷'),
  '^': () => inputOperator('^'),
  '(': () => inputParenthesis('('),
  ')': () => inputParenthesis(')'),
  '%': () => executePercent(),
  '!': () => executeUnary('fact'),
  'p': () => inputConstant('pi'),
  'P': () => inputConstant('pi'),
  'e': () => inputConstant('e'),
  'E': () => inputConstant('e'),
  'r': () => executeUnary('sqrt'),
  'R': () => executeUnary('sqrt'),
  's': () => executeUnary('sqr'),
  'S': () => executeUnary('sqr'),
  'l': () => executeUnary('ln'),
  'L': () => executeUnary('ln'),
  'Enter':      () => calculateEquals(),
  '=':          () => calculateEquals(),
  'Backspace':  () => backspace(),
  'Delete':     () => backspace(),
  'Escape':     () => clearAll(),
  'c':          () => clearAll(),
  'C':          () => clearAll(),
};

/** Map keys to button IDs for visual press animation */
const KEY_TO_BTN_ID = {
  '0': 'btn-0', '1': 'btn-1', '2': 'btn-2', '3': 'btn-3', '4': 'btn-4',
  '5': 'btn-5', '6': 'btn-6', '7': 'btn-7', '8': 'btn-8', '9': 'btn-9',
  '.': 'btn-dot', ',': 'btn-dot',
  '+': 'btn-add', '-': 'btn-sub', '*': 'btn-mul', 'x': 'btn-mul', '/': 'btn-div',
  '^': 'btn-pow', '(': 'btn-lparen', ')': 'btn-rparen',
  '%': 'btn-pct', '!': 'btn-fact',
  'p': 'btn-pi', 'P': 'btn-pi',
  'e': 'btn-e',  'E': 'btn-e',
  'r': 'btn-sqrt', 'R': 'btn-sqrt',
  's': 'btn-sqr', 'S': 'btn-sqr',
  'l': 'btn-ln', 'L': 'btn-ln',
  'Enter': 'btn-eq', '=': 'btn-eq',
  'Backspace': 'btn-backspace', 'Delete': 'btn-backspace',
  'Escape': 'btn-clear', 'c': 'btn-clear', 'C': 'btn-clear',
};

document.addEventListener('keydown', e => {
  // Ignore inside inputs/textareas if any are added
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  // Prevent browser quick-find or default scroll on slash/space
  if (e.key === '/' || e.key === "'") {
    e.preventDefault();
  }

  const handler = KEY_MAPPINGS[e.key];
  if (handler) {
    if (e.key === 'Enter') e.preventDefault();
    handler();

    const btnId = KEY_TO_BTN_ID[e.key];
    if (btnId) {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 140);
      }
    }
  }
});

// ─── Initial Render ───────────────────────────────────────
updateDisplay();
