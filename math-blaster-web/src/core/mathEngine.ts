import { parse, evaluate, compile } from 'mathjs';

/**
 * Parses and compiles a user-input mathematical expression into a safely callable function.
 * Supports parameters (e.g. x, y, t) natively through user context.
 */
export function compileExpression(expression: string) {
  try {
    const node = parse(expression);
    const code = node.compile();
    
    return {
      isValid: true,
      evaluate: (scope: Record<string, number>) => code.evaluate(scope),
      error: null
    };
  } catch (err) {
    return {
      isValid: false,
      evaluate: () => 0,
      error: err instanceof Error ? err.message : 'Invalid mathematical expression'
    };
  }
}
