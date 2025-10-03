import { removeMatchingSurroundingQuotes, stringIsQuote } from "./stringManipulation";

type TokenType = "OPERATOR" | "CONDITION" | "VALUE" | "QUESTION" | "COLON" | "PAREN";

interface Token {
  type: TokenType;
  value: string;
}

type OperatorFunction = (conditionValue: string, comparisonValue: string) => boolean;

interface Operator {
  title: string;
  operator: string;
  func: OperatorFunction;
}

interface Operators {
  [key: string]: Operator;
}

const operators: Operators = {
  "*=": {
    title: "Contains",
    operator: "*=",
    func: (conditionValue, comparisonValue) => conditionValue.includes(comparisonValue),
  },
  "~~~": {
    title: "Case Insensitive Equality",
    operator: "~~~",
    func: (conditionValue, comparisonValue) => conditionValue.toLowerCase() === comparisonValue.toLowerCase(),
  },
  "===": {
    title: "Strict Equality",
    operator: "===",
    func: (conditionValue, comparisonValue) => conditionValue === comparisonValue,
  },
  "==": {
    title: "Loose Equality",
    operator: "==",
    func: (conditionValue, comparisonValue) => conditionValue == comparisonValue,
  },
  "=": {
    title: "Synonym for Strict Equality",
    operator: "=",
    func: (conditionValue, comparisonValue) => conditionValue === comparisonValue,
  },
  "!==": {
    title: "Strict Inequality",
    operator: "!==",
    func: (conditionValue, comparisonValue) => conditionValue !== comparisonValue,
  },
  "!=": {
    title: "Synonym for Strict Inequality",
    operator: "!=",
    func: (conditionValue, comparisonValue) => conditionValue !== comparisonValue,
  },
  "!~~": {
    title: "Case Insensitive Inequality",
    operator: "!~~",
    func: (conditionValue, comparisonValue) => conditionValue.toLowerCase() !== comparisonValue.toLowerCase(),
  },
  ">": {
    title: "Greater Than",
    operator: ">",
    func: (conditionValue, comparisonValue) => parseFloat(conditionValue) > parseFloat(comparisonValue),
  },
  "<": {
    title: "Less Than",
    operator: "<",
    func: (conditionValue, comparisonValue) => parseFloat(conditionValue) < parseFloat(comparisonValue),
  },
  ">=": {
    title: "Greater Than or Equal To",
    operator: ">=",
    func: (conditionValue, comparisonValue) => parseFloat(conditionValue) >= parseFloat(comparisonValue),
  },
  "<=": {
    title: "Less Than or Equal To",
    operator: "<=",
    func: (conditionValue, comparisonValue) => parseFloat(conditionValue) <= parseFloat(comparisonValue),
  },
};

/**
 * Tokenizes the input expression into an array of tokens.
 * @param {string} expression - The input expression to tokenize.
 * @returns {Token[]} An array of tokens.
 */
const lex = (expression: string): Token[] => {
  //remove leading
  const tokens: Token[] = [];
  let i = 0;
  let match;

  while (i < expression.length) {
    let value = "";
    let inQuotesChar = "";
    let gotANonSpace = false;

    while (i < expression.length) {
      const char = expression[i];
      if (char.match(/\s/) && !inQuotesChar && !gotANonSpace) {
        //skip leading spaces
        i++;
        continue;
      }
      if (char.match(/\s/) && !inQuotesChar && gotANonSpace) {
        //end of value
        i++;
        break;
      }
      //a non whitespace character
      if (!char.match(/\s/)) {
        //we got a non space character
        gotANonSpace = true;
        if (stringIsQuote(char)) {
          //start or end of quoted value
          if (!inQuotesChar) {
            //start of quoted value
            inQuotesChar = char;
          } else {
            //end of quoted value
            inQuotesChar = "";
            value += char;
            i++;
            //stop the loop
            break;
          }
        }
      }
      //content of value
      value += char;
      i++;
    }

    value = removeMatchingSurroundingQuotes(value);

    let type: TokenType;

    if (Object.keys(operators).includes(value)) {
      type = "OPERATOR";
    } else {
      switch (value) {
        case "?":
          type = "QUESTION";
          break;
        case ":":
          type = "COLON";
          break;
        case "(":
        case ")":
          type = "PAREN";
          break;
        default:
          type = "VALUE";
      }
    }

    tokens.push({ type, value });
  }

  return tokens;
};

interface ASTNode {
  type: "CONDITIONAL_EXPRESSION" | "VALUE";
  operator?: string;
  condition?: ASTNode;
  comparison?: ASTNode;
  trueValue?: ASTNode;
  falseValue?: ASTNode;
  value?: string;
}

/**
 * Parses an array of tokens into an AST.
 * @param tokens - The array of tokens to parse.
 * @returns The root AST node.
 */
const parse = (tokens: Token[]): ASTNode | null => {
  let currentIndex = 0;

  const parseExpression = (): ASTNode | null => {
    if (currentIndex >= tokens.length) return null;

    const token = tokens[currentIndex];

    if (token.type === "VALUE") {
      currentIndex++;
      const nextToken = tokens[currentIndex];
      if (nextToken && nextToken.type === "OPERATOR") {
        // its root level or possibly nested conditional expression
        return parseConditionalExpression(token, nextToken);
      }

      return { type: "VALUE", value: token.value };
    } else if (token.type === "PAREN" && token.value === "(") {
      currentIndex++;
      const expression = parseConditionalExpression();
      if (currentIndex < tokens.length && tokens[currentIndex].type === "PAREN" && tokens[currentIndex].value === ")") {
        currentIndex++;
        return expression;
      }
    }

    return null;
  };

  const parseConditionalExpression = (preFoundValueToken?: Token, preFoundOperatorToken?: Token): ASTNode | null => {
    const condition = preFoundValueToken ? ({ type: "VALUE", value: preFoundValueToken.value } as ASTNode) : parseExpression();
    if (!condition) return null;

    if (currentIndex >= tokens.length) return null;
    const operatorToken = preFoundOperatorToken ?? tokens[currentIndex];
    if (operatorToken.type !== "OPERATOR") return null;
    currentIndex++;

    const comparison = parseExpression();
    if (!comparison) return null;

    let questionToken = undefined;
    let trueValue: ASTNode | null = { type: "VALUE", value: "true" };
    let colonToken = undefined;
    let falseValue: ASTNode | null = { type: "VALUE", value: "false" };

    if (currentIndex < tokens.length) {
      questionToken = tokens[currentIndex];
      if (questionToken.type !== "QUESTION") return null;
      currentIndex++;

      trueValue = parseExpression();
      if (!trueValue) return null;

      if (currentIndex >= tokens.length) return null;
      colonToken = tokens[currentIndex];
      if (colonToken.type !== "COLON") return null;
      currentIndex++;

      falseValue = parseExpression();
      if (!falseValue) return null;
    }

    return {
      type: "CONDITIONAL_EXPRESSION",
      operator: operatorToken.value,
      condition,
      comparison,
      trueValue,
      falseValue,
    };
  };

  return parseExpression();
};

/**
 * Evaluates the AST to produce a result string.
 * @param ast - The root AST node.
 * @param fallbackValue - The fallback value to return if evaluation fails.
 * @returns The evaluated result string.
 */
const evaluate = (ast: ASTNode | string, fallbackValue?: string): string => {
  if (typeof ast === "string") {
    return ast;
  }
  if (ast.type === "VALUE") {
    return ast.value!;
  }

  if (ast.type === "CONDITIONAL_EXPRESSION") {
    const conditionValue = evaluate(ast.condition as ASTNode, fallbackValue);
    const comparisonValue = evaluate(ast.comparison as ASTNode, fallbackValue);

    let conditionMet = false;

    if (Object.keys(operators).includes(ast.operator!)) {
      conditionMet = operators[ast.operator!].func(conditionValue, comparisonValue);
    } else {
      return conditionValue; // Unknown operator, return the original value
    }

    return conditionMet ? evaluate(ast.trueValue!) : evaluate(ast.falseValue!);
  }

  return ""; // Unknown AST node type, return an empty string
};

/**
 * Evaluates a given expression string and returns the result.
 * @param expression - The expression to evaluate. such as "They === 'They' ? 'Dr. Smith' : 'Dr. Smitha'}" , the result would be "Dr. Smith",
 * @param fallbackValue - The fallback value to return if evaluation fails.
 * @returns The evaluated result string.
 */
export const evaluateExpression = (expression: string, fallbackValue: string): string => {
  if (!expression) return fallbackValue; // Return the original value if no expression is provided
  //debugger;
  try {
    const tokens = lex(expression);
    const ast = parse(tokens);
    if (ast === null) {
      return fallbackValue; // Return the original value if parsing fails
    }
    let evalResult = evaluate(ast, fallbackValue);
    return removeMatchingSurroundingQuotes(evalResult);
  } catch (error) {
    return fallbackValue; // Return the original value if any error occurs
  }
};

// Example usage
/*
const expression = "They *= They ? are : is";
const fallbackValue = "They";

const result = evaluateExpression(expression, fallbackValue);
console.log(result); // Expected output: "are"
*/
