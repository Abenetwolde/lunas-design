// List all unclosed JSX elements via babel recovery AST
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import parser from '@babel/parser';
import _traverse from '@babel/traverse';

// babel/traverse is CJS
const traverse = _traverse.default;

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/app/admin/AdminClient.tsx');
const src = readFileSync(FILE, 'utf8');

const ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx', 'typescript'], errorRecovery: true });

const issues = [];
traverse(ast, {
  JSXElement: (path) => {
    const node = path.node;
    if (!node.closingElement && !/^<[A-Za-z]/.test('')) {
      const name = node.openingElement.name;
      const nm = name.name || (name.property && name.property.name) || 'unknown';
      // self-closing handled by babel (opening.selfClosing)
      if (!node.openingElement.selfClosing && !node.closingElement) {
        issues.push({ nm, line: node.openingElement.loc.start.line });
      }
    }
  },
});

if (issues.length === 0) console.log('✓ no unclosed JSX elements found');
else {
  console.log('Unclosed elements:');
  issues.forEach((i) => console.log('  -', i.nm, '@ line', i.line));
}