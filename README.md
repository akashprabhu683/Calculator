# 🧮 Modern Scientific & Arithmetic Calculator

A sleek, wide-format scientific calculator crafted with **Vanilla HTML5, CSS3 (Glassmorphism), and JavaScript (ES6+)**. Engineered for seamless daily arithmetic and advanced scientific calculations with comprehensive keyboard shortcuts and real-time evaluation.

---

## ✨ Features

- **Wide Ergonomic Layout**: 6-column keypad designed for effortless interaction on both desktop and mobile screens.
- **Glassmorphic Aesthetic**: Deep cosmic background, floating ambient gradient orbs, frosted glass surface, and micro-press animations.
- **Real-Time Live Preview**: Computes and displays the answer dynamically as you construct mathematical expressions.
- **Scientific Operations**:
  - **Trigonometry**: `sin`, `cos`, `tan` with instant **DEG / RAD** angle mode switching.
  - **Powers & Roots**: $x^2$, $x^3$, $x^y$ (power), $\sqrt{x}$ (square root), $1/x$ (reciprocal).
  - **Logarithms**: Natural Log ($\ln$) and Log Base 10 ($\log$).
  - **Factorial**: $n!$ with overflow and non-integer bounds safety.
  - **Absolute Value**: $|x|$
- **Memory Functions**: Full hardware-style memory register (`MC`, `MR`, `M+`, `M-`) with active indicator badge.
- **Grouping & Expressions**: Full parentheses `(` and `)` support parsed with mathematical operator precedence.
- **Constants**: One-tap access to Pi ($\pi$) and Euler's number ($e$).
- **Previous Answer (`Ans`)**: Reuse your last evaluated calculation instantly.
- **Floating-Point Precision**: Sanitizes JavaScript floating-point quirks (e.g., `0.1 + 0.2 = 0.3`).

---

## ⌨️ Keyboard Shortcuts

Enjoy full, hands-on-keyboard calculations without needing to touch the mouse:

| Key | Operation |
| :--- | :--- |
| `0` – `9` | Digits |
| `.` or `,` | Decimal point |
| `+` | Addition |
| `-` | Subtraction |
| `*` or `X` | Multiplication |
| `/` | Division |
| `^` | Power / Exponent ($x^y$) |
| `(` and `)` | Parentheses grouping |
| `%` | Percentage |
| `!` | Factorial ($n!$) |
| `P` | $\pi$ (Pi $\approx 3.14159$) |
| `E` | $e$ (Euler's Constant $\approx 2.71828$) |
| `R` | Square Root ($\sqrt{x}$) |
| `S` | Square ($x^2$) |
| `L` | Natural Log ($\ln$) |
| `Enter` or `=` | Calculate result |
| `Backspace` or `Del` | Delete last character |
| `Esc` or `C` | All Clear (`AC`) |

---

## 🚀 Getting Started

No build tools, bundlers, or package installations required!

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/calculator.git
   cd calculator
   ```

2. **Run the application**:
   - Simply double-click `index.html` to open it in any modern web browser.
   - Or launch with a live preview server (e.g., VS Code Live Server):
     ```bash
     npx serve .
     ```

---

## 📁 Project Structure

```text
calculator/
├── index.html       # Semantic HTML5 structure & UI layout
├── style.css        # Glassmorphic CSS3 styling, responsive grid & animations
├── script.js        # Expression parsing, math logic & keyboard event handling
└── README.md        # Documentation & usage guide
```

---

## 🛠️ Built With

- **HTML5** – Semantic markup and accessibility attributes (`aria-*`).
- **CSS3** – Custom properties (variables), CSS Grid, Flexbox, backdrop-filter glassmorphism, and keyframe animations.
- **JavaScript (ES6+)** – Tokenizer, shunting-yard style arithmetic parser, and unified keyboard listener.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal and educational use.
