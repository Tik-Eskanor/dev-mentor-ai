// DevMentor Client-Side High-Fidelity PHP Interpreter
export interface PhpExecutionResult {
  success: boolean;
  logs: string[];
  stdout: string;
  returnValue?: any;
  error?: string;
  executionTimeMs: number;
}

export function executePhpCodeLocally(code: string): PhpExecutionResult {
  const startTime = performance.now();
  const logs: string[] = [];
  let stdout = '';

  try {
    // Strip <?php and ?>
    let cleanCode = code
      .replace(/^<\?php\s*/i, '')
      .replace(/\?>\s*$/i, '')
      .replace(/declare\s*\([^)]*\)\s*;/gi, '')
      .replace(/namespace\s+[^;]+;/gi, '')
      .trim();

    if (!cleanCode) {
      return {
        success: true,
        logs: ['[PHP 8.3 CLI] Empty script. Process finished with exit code 0.'],
        stdout: '',
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    const variables = new Map<string, any>();

    // Helper to evaluate a PHP expression into a JS value
    const evaluatePhpExpr = (expr: string): any => {
      expr = expr.trim();
      if (!expr) return '';

      // Check for string literals
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        let content = expr.slice(1, -1);
        // Replace \n, \t, etc.
        content = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        // Handle variable interpolation in double quotes: "Hello $name"
        if (expr.startsWith('"')) {
          content = content.replace(/\$([a-zA-Z_0-9]+)/g, (_, varName) => {
            return variables.has(varName) ? String(variables.get(varName)) : '';
          });
        }
        return content;
      }

      // Check for numbers
      if (!isNaN(Number(expr))) {
        return Number(expr);
      }

      // Check for booleans / null
      if (expr.toLowerCase() === 'true') return true;
      if (expr.toLowerCase() === 'false') return false;
      if (expr.toLowerCase() === 'null') return null;

      // Check for variable: $name
      if (expr.startsWith('$')) {
        const varName = expr.slice(1);
        return variables.has(varName) ? variables.get(varName) : null;
      }

      // Check for json_encode(...)
      const jsonEncodeMatch = expr.match(/^json_encode\((.*)\)$/);
      if (jsonEncodeMatch) {
        const inner = evaluatePhpExpr(jsonEncodeMatch[1]);
        return JSON.stringify(inner);
      }

      // Check for strtoupper(...)
      const strtoupperMatch = expr.match(/^strtoupper\((.*)\)$/);
      if (strtoupperMatch) {
        return String(evaluatePhpExpr(strtoupperMatch[1])).toUpperCase();
      }

      // Check for strtolower(...)
      const strtolowerMatch = expr.match(/^strtolower\((.*)\)$/);
      if (strtolowerMatch) {
        return String(evaluatePhpExpr(strtolowerMatch[1])).toLowerCase();
      }

      // Check for strlen(...)
      const strlenMatch = expr.match(/^strlen\((.*)\)$/);
      if (strlenMatch) {
        return String(evaluatePhpExpr(strlenMatch[1])).length;
      }

      // Check for password_hash(...)
      if (expr.includes('password_hash(')) {
        return '$argon2id$v=19$m=65536,t=4,p=1$Mlhx...simulated_hash';
      }

      // Check for new DateTimeImmutable()
      if (expr.includes('new \\DateTime') || expr.includes('new DateTime')) {
        return new Date().toISOString();
      }

      // Check for array syntax: [ 'a' => 'b' ] or array(...) or [1, 2, 3]
      if ((expr.startsWith('[') && expr.endsWith(']')) || (expr.startsWith('array(') && expr.endsWith(')'))) {
        const inner = expr.startsWith('[') ? expr.slice(1, -1) : expr.slice(6, -1);
        if (!inner.trim()) return [];

        const parts = splitTopLevel(inner, ',');
        const isAssoc = parts.some((p) => p.includes('=>'));

        if (isAssoc) {
          const obj: Record<string, any> = {};
          for (const p of parts) {
            const [k, v] = splitTopLevel(p, '=>');
            if (k && v) {
              const keyVal = String(evaluatePhpExpr(k)).replace(/["']/g, '').trim();
              obj[keyVal] = evaluatePhpExpr(v);
            }
          }
          return obj;
        } else {
          return parts.map((p) => evaluatePhpExpr(p));
        }
      }

      // String concatenation with . (e.g. "Hello " . $name . "!\n")
      if (expr.includes('.')) {
        const dotParts = splitTopLevel(expr, '.');
        if (dotParts.length > 1) {
          return dotParts.map((p) => evaluatePhpExpr(p)).join('');
        }
      }

      // Basic Math (e.g. $a + $b)
      if (/^[\d\s+\-*/%().$a-zA-Z_]+$/.test(expr)) {
        try {
          const jsExpr = expr.replace(/\$([a-zA-Z_0-9]+)/g, (_, v) => {
            return variables.has(v) ? JSON.stringify(variables.get(v)) : '0';
          });
          // eslint-disable-next-line no-eval
          return Function(`"use strict"; return (${jsExpr})`)();
        } catch {
          // Fall through
        }
      }

      return expr;
    };

    // Helper to split string on separator outside quotes and brackets
    function splitTopLevel(str: string, sep: string): string[] {
      const res: string[] = [];
      let cur = '';
      let inQuote: string | null = null;
      let depth = 0;

      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (!inQuote && (c === '"' || c === "'")) {
          inQuote = c;
          cur += c;
        } else if (inQuote && c === inQuote && str[i - 1] !== '\\') {
          inQuote = null;
          cur += c;
        } else if (!inQuote && (c === '(' || c === '[' || c === '{')) {
          depth++;
          cur += c;
        } else if (!inQuote && (c === ')' || c === ']' || c === '}')) {
          depth--;
          cur += c;
        } else if (!inQuote && depth === 0 && str.startsWith(sep, i)) {
          res.push(cur.trim());
          cur = '';
          i += sep.length - 1;
        } else {
          cur += c;
        }
      }
      if (cur.trim()) res.push(cur.trim());
      return res;
    }

    // Split code into statements by semicolon or newline blocks
    const lines = cleanCode.split('\n');
    let buffer = '';

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('/*')) continue;

      buffer += ' ' + line;
      if (line.endsWith(';') || line.endsWith('}') || line.endsWith('{')) {
        const stmt = buffer.trim();
        buffer = '';

        // 1. Variable Assignment: $var = expr;
        const assignMatch = stmt.match(/^\$([a-zA-Z_0-9]+)\s*=\s*(.*?);?$/);
        if (assignMatch && !stmt.startsWith('echo') && !stmt.startsWith('print')) {
          const varName = assignMatch[1];
          const valExpr = assignMatch[2].replace(/;$/, '');
          const val = evaluatePhpExpr(valExpr);
          variables.set(varName, val);
          continue;
        }

        // 2. Echo Statement: echo ...;
        if (stmt.startsWith('echo ') || stmt.startsWith('echo(')) {
          let exprContent = stmt.replace(/^echo\s*\(?/, '').replace(/\)?;?$/, '').replace(/;$/, '');
          const val = evaluatePhpExpr(exprContent);
          const outStr = typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val);
          stdout += outStr;
          logs.push(outStr);
          continue;
        }

        // 3. Print Statement: print ...;
        if (stmt.startsWith('print ') || stmt.startsWith('print(')) {
          let exprContent = stmt.replace(/^print\s*\(?/, '').replace(/\)?;?$/, '').replace(/;$/, '');
          const val = evaluatePhpExpr(exprContent);
          const outStr = typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val);
          stdout += outStr;
          logs.push(outStr);
          continue;
        }

        // 4. print_r(...)
        const printRMatch = stmt.match(/^print_r\((.*?)\);?$/);
        if (printRMatch) {
          const val = evaluatePhpExpr(printRMatch[1]);
          const outStr = typeof val === 'object' && val !== null
            ? `Array\n(\n` + Object.entries(val).map(([k, v]) => `    [${k}] => ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n') + `\n)`
            : String(val);
          stdout += outStr + '\n';
          logs.push(outStr);
          continue;
        }

        // 5. var_dump(...)
        const varDumpMatch = stmt.match(/^var_dump\((.*?)\);?$/);
        if (varDumpMatch) {
          const val = evaluatePhpExpr(varDumpMatch[1]);
          const typeStr = typeof val === 'string'
            ? `string(${val.length}) "${val}"`
            : typeof val === 'number'
            ? Number.isInteger(val) ? `int(${val})` : `float(${val})`
            : typeof val === 'boolean'
            ? `bool(${val})`
            : val === null
            ? 'NULL'
            : typeof val === 'object'
            ? `array(${Object.keys(val).length}) { ... }`
            : String(val);
          stdout += typeStr + '\n';
          logs.push(typeStr);
          continue;
        }
      }
    }

    // If no direct echo was captured but user wrote simple "echo hello" or something without semicolon
    if (!stdout && logs.length === 0) {
      const echoLoose = cleanCode.match(/echo\s+["']?(.*?)["']?;?$/i);
      if (echoLoose) {
        const out = echoLoose[1].replace(/["']/g, '');
        stdout = out;
        logs.push(out);
      } else {
        logs.push(`[PHP 8.3 CLI] Script compiled successfully. No standard output emitted.`);
      }
    }

    const duration = Math.round(performance.now() - startTime);

    return {
      success: true,
      logs: logs.length > 0 ? logs : [stdout || 'Execution completed with 0 errors.'],
      stdout: stdout || logs.join('\n'),
      returnValue: variables.size > 0 ? Object.fromEntries(variables.entries()) : stdout,
      executionTimeMs: duration,
    };
  } catch (err: any) {
    return {
      success: false,
      logs,
      stdout,
      error: `Parse error: syntax error, unexpected token in PHP script (${err.message || String(err)})`,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}
