# Prettier Configuration Guide for withme.travel

This document explains our Prettier configuration choices and why they've been selected to maintain consistent code style across the project.

## Configuration Options

Our `.prettierrc.json` file contains the following settings:

### Core Formatting Options

- **`printWidth: 100`**  
  Specifies the line length that Prettier will wrap at. We've chosen 100 characters as a compromise between readability and making good use of screen space.

- **`tabWidth: 2`**  
  Defines the number of spaces per indentation level. Two spaces is commonly used in JavaScript/TypeScript projects and keeps code compact.

- **`useTabs: false`**  
  Uses spaces instead of tabs for indentation. This ensures consistent rendering across different editors and environments.

- **`semi: true`**  
  Adds semicolons at the end of statements. This helps prevent potential issues with Automatic Semicolon Insertion (ASI) and improves code clarity.

- **`singleQuote: true`**  
  Uses single quotes instead of double quotes for string literals. This is common in JavaScript/TypeScript projects and reduces clutter.

### JSX and React Specific Options

- **`jsxSingleQuote: false`**  
  Uses double quotes for JSX attributes while using single quotes for regular strings. This provides a visual distinction between JSX attributes and regular JavaScript strings.

- **`bracketSameLine: false`**  
  Places the closing bracket of JSX elements on a new line. This improves readability for multi-line JSX elements by making them more distinctly structured.

- **`singleAttributePerLine: false`**  
  Allows multiple attributes on the same line in JSX if they fit within the `printWidth`. This creates a good balance between compactness and readability.

### Punctuation and Syntax Options

- **`trailingComma: "es5"`**  
  Adds trailing commas where valid in ES5 (objects, arrays, etc.). This creates cleaner git diffs when adding new elements and is compatible with older browsers.

- **`bracketSpacing: true`**  
  Prints spaces between brackets in object literals, making them easier to read: `{ foo: bar }` instead of `{foo: bar}`.

- **`arrowParens: "always"`**  
  Adds parentheses around arrow function parameters even when they're not needed, ensuring consistency: `(x) => x` instead of sometimes `x => x`.

### File Format Options

- **`endOfLine: "lf"`**  
  Uses LF (Line Feed) as the line ending. This is standard on Unix-based systems (Linux/macOS) and prevents issues with mixed line endings.

- **`embeddedLanguageFormatting: "auto"`**  
  Formats embedded code (like CSS-in-JS or markdown code blocks) if a Prettier parser exists for that language.

### Special Case Options

- **`quoteProps: "as-needed"`**  
  Only adds quotes around object properties when needed for syntactical reasons, keeping the code clean.

- **`htmlWhitespaceSensitivity: "css"`**  
  Respects the CSS display property in HTML formatting, making formatting more natural for HTML content.

- **`proseWrap: "preserve"`**  
  Doesn't change wrapping in markdown files, respecting the original author's intent.

## Integration with the Project

This configuration has been chosen to align with our Next.js project structure and the team's preferences. It balances:

1. **Readability** - Ensuring code is easy to read and understand
2. **Efficiency** - Keeping the code reasonably compact without sacrificing clarity
3. **Consistency** - Maintaining a uniform style across the entire codebase
4. **Modern practices** - Following contemporary JavaScript/TypeScript conventions

## Using Prettier in your workflow

### Command Line

Format a specific file:

```bash
npx prettier --write components/navbar.tsx
```

Format all TypeScript files in a directory:

```bash
npx prettier --write "components/**/*.{ts,tsx}"
```

Format all TypeScript files in the project:

```bash
npx prettier --write "**/*.{ts,tsx}"
```

### Editor Integration

For the best development experience, install the Prettier extension for your editor:

- **VS Code**: [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- **WebStorm**: Built-in support
- **Vim/Neovim**: [vim-prettier](https://github.com/prettier/vim-prettier)

Configure your editor to format on save for the most seamless experience.

### Pre-commit Hook

Consider adding a pre-commit hook with husky and lint-staged to automatically format code before committing:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": "prettier --write"
  }
}
```
