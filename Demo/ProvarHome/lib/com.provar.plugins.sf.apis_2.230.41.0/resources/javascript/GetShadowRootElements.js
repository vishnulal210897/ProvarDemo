const contextNode = arguments[0];
const ast = arguments[1];
const result = new XpathAstExecutor().evaluate(contextNode, ast);
console.log(result);
return result;