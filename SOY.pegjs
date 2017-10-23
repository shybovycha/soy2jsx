SOY = Namespace+;

Namespace =
  ns:NamespaceDecl WS* templates:TemplateDef* {
    return { templates: templates.map(tpl => Object.assign(tpl, { name: ns + tpl.name })) };
  };

WS = [\r\n \t];

TemplateDef =
  comments:SoyComment* WS* "{template " name:TemplateName "}" WS+ body:TemplateBodyElement* "{/template}" WS* {
    return {
      type: "Template",
        comments,
        name,
        body
    };
  };

TemplateName =
  name:(LocalTemplateName / FullTemplateName) {
    return name;
  };

LocalTemplateName = ShortIdentifier;

ShortIdentifier = ids:("." Identifier)+ {
    return ids.map(t => t.join('')).join('');
  };

ComplexIdentifier = head:Identifier tail:ShortIdentifier? {
    return head + tail;
  };

FullTemplateName = ComplexIdentifier;

TemplateBodyElement =
  SingleElement / PairElement / HtmlComment / SoyComment / SoyBodyExpr / BlankLine;

BlankLine =
  chars:WS+ {
    return {
      type: 'BlankLine',
      children: chars.join(''),
      attributes: []
    };
  };

HtmlComment = "<!--" chars:(!"-->" .)* "-->" { return chars.map(c => c[1]).join(""); };

SoyComment = SoyInlineComment / SoyMultilineComment;

SoyInlineComment = "//" chars:[^\n]+ { return chars.join(''); };
SoyMultilineComment = "/*" chars:(!"*/" .)* "*/" { return chars.map(c => c[1]).join(""); };

NamespaceDecl =
  SoyComment* WS* "{namespace" WS+ name:NamespaceName "}" {
    return name;
  };

NamespaceName = ComplexIdentifier;

Identifier =
  head:IdentifierFirstChar tail:IdentifierChar* {
    return head + tail.join('');
  };

IdentifierFirstChar = [a-zA-Z];
IdentifierChar = [a-zA-Z0-9_];

SoyBodyExpr =
  SoyVariableInterpolation /
  SoyFunctionCall /
  SoyTemplateCall /
  SoyLetOperator /
  SoyIfOperator /
  SoyForeachOperator /
  SoyForOperator /
  SoySwitchOperator;

SoyStringInterpolateableExpr = FloatNumber / IntegerNumber / SoyVariableInterpolation / SoyFunctionCall;

SoyCapableString = str:(DoubleQuotedSoyCapableString / SingleQuotedSoyCapableString) {
  return str;
};

DoubleQuotedSoyCapableString = '"' content:(SoyStringInterpolateableExpr / EscapeableDoubleQuoteText)* '"' { return content; };
SingleQuotedSoyCapableString = "'" content:(SoyStringInterpolateableExpr / EscapeableSingleQuoteText)* "'" { return content; };

EscapeableDoubleQuoteText = chars:[^"]+ { return chars.join(''); };
EscapeableSingleQuoteText = chars:[^']+ { return chars.join(''); };

SoySwitchOperator =
  "{switch" WS+ expression:SoyValueExpr WS* "}" WS* clauses:SoySwitchOperatorBody WS* "{/switch}" {
    return {
      type: "SwitchOperator",
      expression,
      clauses
    };
  };

SoySwitchOperatorBody = SoySwithWithDefault / SoySwitchBodyWithNoDefault;

SoySwitchBodyWithNoDefault = clauses:SoySwitchOperatorCase* {
  return clauses;
};

SoySwithWithDefault = clauses:SoySwitchOperatorCase* WS* defaultClause:SoySwitchDefaultClause {
  return clauses.concat([ defaultClause ]);
};

SoySwitchOperatorCase = "{case" WS+ clause:SoyCaseValues WS* "}" WS* output:TemplateBodyElement* {
  return {
    clause,
    output
  }
};

SoyCaseValues = ((SoyBinaryExpression / SoyAtomicValue) WS* "," WS* SoyCaseValues) / (SoyBinaryExpression / SoyAtomicValue);

SoySwitchDefaultClause = "{default}" WS* output:TemplateBodyElement* {
  return {
    clause: null,
    output
  }
};

SoyForeachOperator = SoyForeachWithEmptySectionOperator / SoySimpleForeachOperator;

SoySimpleForeachOperator =
  "{" WS* "foreach" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyAtomicValue WS* "}" WS* output:TemplateBodyElement* WS* "{/foreach}" {
    return {
      type: "ForeachOperator",
      range,
      output,
      defaultOutput: []
    };
  };

SoyForeachWithEmptySectionOperator =
  "{" WS* "foreach" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyAtomicValue WS* "}" WS* output:TemplateBodyElement* WS* "{ifempty}" WS* defaultOutput:TemplateBodyElement* WS* "{/foreach}" {
    return {
      type: "ForeachOperator",
      iterator: iterator.name,
      range,
      output,
      defaultOutput
    };
  };


SoyForOperator =
  "{" WS* "for" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyRangeExpr WS* "}" WS* output:TemplateBodyElement* WS* "{/for}" {
    return {
      type: "ForOperator",
      iterator: iterator.name,
      range,
      output
    };
  };

SoyRangeExpr = "range(" WS* rangeParams:SoyRangeParams WS* ")" {
  return rangeParams;
};

SoyRangeParams = BetweenWithStepRangeParams / BetweenTwoValuesRangeParams / FromZeroToHeroRangeParams;

FromZeroToHeroRangeParams = endIndex:IntegerNumber {
  return {
    startIndex: 0,
    endIndex,
    step: 1
  };
};

BetweenTwoValuesRangeParams = startIndex:IntegerNumber WS* "," WS* endIndex:IntegerNumber {
  return {
    startIndex,
    endIndex,
    step: (startIndex < endIndex) ? 1 : -1
  };
};

BetweenWithStepRangeParams = startIndex:IntegerNumber WS* "," WS* endIndex:IntegerNumber WS* "," WS* step:IntegerNumber {
  return {
    startIndex,
    endIndex,
    step
  };
};

SoyAtomicValue =
  FloatNumber /
  IntegerNumber /
  DoubleQuotedString /
  SingleQuotedString /
  VariableReference /
  FunctionCall /
  SoyUnaryExpression;

SoyValueExpr =
  SoyTernaryOperator /
  SoyBinaryExpression /
  SoyAtomicValue;

SoyBinaryExpression =
  leftArg:SoyAtomicValue WS* operator:SoyBinaryOperator WS* rightArg:(SoyBinaryExpression / SoyAtomicValue) {
    return {
      type: "BinaryOperator",
      operator,
      args: [ leftArg, rightArg ]
    };
  };

SoyUnaryExpression =
  operator:SoyUnaryOperator WS* arg:SoyAtomicValue {
    return {
      type: "UnaryOperator",
      operator,
      args: [ arg ]
    };
  };

SoyBinaryOperator =
  WS* operator:(SoyComparisonOperator / SoyArithmeticOperator / SoyLogicOperator) WS* {
    return operator;
  };

SoyArithmeticOperator = "+" / "-" / "*" / "/" / "%";

SoyLogicOperator = "and" / "or";

SoyUnaryOperator = "+" / "-" / "not";

SoyComparisonOperator = "==" / "<" / ">" / "<=" / ">=" / "!=";

SoyAttributeExpr =
  SoyAttributeIfOperator /
  SoyFunctionCall /
  SoyVariableInterpolation;

SoyAttributeIfOperator =
  mainClause:SoyAttributeIfClause otherClauses:SoyAttributeElseifClause* otherwiseClause:SoyAttributeElseClause? SoyEndifOperator {
    const values = [ mainClause, otherwiseClause ].concat(otherClauses).filter(branch => !!branch);

    return {
      type: "IfOperator",
      values
    };
  };

SoyAttributeIfClause =
  "{" WS* "if" WS+ clause:(SoyBinaryExpression / SoyAtomicValue) WS* "}" WS* output:Attribute* {
    return { clause, output };
  };

SoyAttributeElseifClause =
  "{" WS* "elseif" WS+ clause:(SoyBinaryExpression / SoyAtomicValue) WS* "}" WS* output:Attribute* {
    return { clause, output };
  };

SoyAttributeElseClause =
  "{" WS* "else" WS* "}" WS* output:Attribute* {
    return { clause: null, output };
  };

SoyIfOperator =
  mainClause:SoyIfClause otherClauses:SoyElseifClause* otherwiseClause:SoyElseClause? SoyEndifOperator {
    const values = [ mainClause, otherwiseClause ].concat(otherClauses).filter(branch => !!branch);

    return {
      type: "IfOperator",
      values
    };
  };

SoyIfClause =
  "{" WS* "if" WS+ clause:(SoyBinaryExpression / SoyAtomicValue) WS* "}" WS* output:TemplateBodyElement* {
    return { clause, output };
  };

SoyElseifClause =
  "{" WS* "elseif" WS+ clause:(SoyBinaryExpression / SoyAtomicValue) WS* "}" WS* output:TemplateBodyElement* {
    return { clause, output };
  };

SoyElseClause =
  "{" WS* "else" WS* "}" WS* output:TemplateBodyElement* {
    return { clause: null, output };
  };

SoyEndifOperator = "{/if}";

SoyTernaryOperator =
  clause:(SoyBinaryExpression / SoyAtomicValue) WS* "?" WS* trueValue:SoyAtomicValue WS* ":" WS* falseValue:SoyAtomicValue {
    return {
      type: "IfOperator",
      clause,
      values: {
        true: trueValue,
        false: falseValue
      }
    };
  };

SoyLetOperator =
  "{" WS* "let" WS+ "$" name:Identifier WS* ":" WS* value:SoyValueExpr WS* "/}" {
    return {
      type: "VariableDeclaration",
      name,
      value
    };
  };

SoyVariableInterpolation = "{" reference:VariableReference "}" { return reference; };

VariableReference =
  "$" reference:(ObjectPropertyReference / Identifier) {
      return {
          type: "VariableReference",
          reference
        };
    };

ObjectPropertyReference =
  name:Identifier path:(SubObjectPropertyAccessor / SubArrayAccessor)+ {
    return {
      type: "ObjectAccessor",
      name,
      path
    };
  };

SubObjectPropertyAccessor =
  "." prop:Identifier {
    return { property: prop };
  };

SubArrayAccessor =
  "[" idx:SoyValueExpr "]" {
    return { index: idx };
  };

IntegerIndex = [0-9]+ {
    return parseInt(text());
  };

IntegerNumber =
  "0" / ("-"? [1-9] [0-9]*) {
    return parseInt(text());
  };

FloatNumber =
  "-"? [0-9]+ ("." [0-9]+)? {
      return parseFloat(text());
  };

FunctionCallArguments = MultipleFunctionCallArguments / SingleFunctionCallArgument;

SingleFunctionCallArgument =
  first:SoyValueExpr {
      return [ first ];
  };

MultipleFunctionCallArguments =
  first:SoyValueExpr WS* "," WS* rest:FunctionCallArguments {
    return [ first ].concat(rest);
  };

SoyFunctionCall =
  "{" WS* funcCall:FunctionCall WS* "}" {
      return funcCall;
  };

FunctionCall =
  name:Identifier "(" WS* args:FunctionCallArguments? WS* ")" {
      return {
          type: "FunctionCall",
          name,
          args
        };
  };

SoyTemplateCall = InPlaceTemplateCall / MultilineTemplateCall;

InPlaceTemplateCall =
  "{call" WS+ name:TemplateName WS+ params:TemplateCallInlineParams? WS* "/}" {
      return {
        type: "TemplateRef",
        name: name,
        attributes: params || {},
        content: []
      };
  };

TemplateCallInlineParams =
  MultipleTemplateCallInlineParams / SingleTemplateCallInlineParams;

MultipleTemplateCallInlineParams =
  first:TemplateCallInlineParam WS+ rest:TemplateCallInlineParams { return [ first ].concat(rest); };

SingleTemplateCallInlineParams = first:TemplateCallInlineParam { return [ first ]; };

TemplateCallInlineParam =
  TemplateCallInlineValueParam / TemplateCallInlineBooleanParam;

TemplateCallInlineBooleanParam = name:Identifier {
    return {
      [name]: true
    };
  };

TemplateCallInlineValueParam =
  name:Identifier WS* "=" WS* value:SoyValueExpr {
      return {
          [name]: value
        };
  };

StringParamValue = SingleQuotedString / DoubleQuotedString;

VariableParamValue = "$" Identifier;

MultilineTemplateCall =
  "{call" WS+ name:TemplateName "}" WS* params:MultilineTemplateCallParams WS* "{/call}" {
      return {
        type: "TemplateReference",
        name: name,
        attributes: params || {},
        content: []
      };
    };

MultilineTemplateCallParams = MultipleMultilineTemplateCallParams / SingleMultilineTemplateCallParams;

MultipleMultilineTemplateCallParams = WS* first:SingleMultilineTemplateCallParams WS* rest:MultilineTemplateCallParams { return [ first ].concat(rest); };

SingleMultilineTemplateCallParams = WS* first:MultilineTemplateCallParam WS* { return [ first ]; };

MultilineTemplateCallParam =
  MultilineTemplateCallValueParam / MultilineTemplateCallBooleanParam;

MultilineTemplateCallBooleanParam =
  "{param" WS+ name:Identifier WS* "/}" {
      return {
        [name]: true
      };
  };

MultilineTemplateCallValueParam =
  MultilineTemplateCallInlineParam / MultilineTemplateCallMultilineParam;

MultilineTemplateCallMultilineParam =
  "{param" WS+ name:Identifier WS* "}" WS* content:TemplateBodyElement* WS* "{/param}" {
      return {
        [name]: {
          name: name,
          attributes: [],
          content: content
        }
      };
    };

MultilineTemplateCallInlineParam =
  "{param" WS+ name:Identifier WS* ":" WS* value:SoyValueExpr WS* "/}" {
      return {
        [name]: value
      };
    };

Attributes =
  MultipleAttributes / SingleAttribute;

SingleAttribute =
  attr:Attribute {
    return [ attr ];
  };

MultipleAttributes =
  first:Attribute WS+ rest:Attributes {
    return [ first ].concat(rest);
  };

Attribute = ValueAttribute / BooleanAttribute / SoyAttributeExpr;

BooleanAttribute =
  attr:AttributeName {
    return { [attr]: attr };
  };

ValueAttribute =
  name:AttributeName "=" value:SoyCapableString {
    return { [name]: value };
  };

AttributeName =
  pre:AttributeNameStartChar post:AttributeNameChar* {
    return pre + post.join('');
  };

AttributeNameStartChar = [a-zA-Z];
AttributeNameChar = [a-zA-Z\-0-9_.];

// AttributeValue =
//    value:(SingleQuotedString / DoubleQuotedString) {
//        return value;
//    };

SingleQuotedString = "'" chars:[^']+ "'" { return chars.join(''); };
DoubleQuotedString = '"' chars:[^"]+ '"' { return chars.join(''); };

ElementContent = MultipleElementContentChildren / SingleElementContentChild;

MultipleElementContentChildren =
  WS* first:ElementContentChild WS* rest:ElementContent WS* { return [ first ].concat(rest); };

SingleElementContentChild = WS* first:ElementContentChild WS* { return [ first ]; };

ElementContentChild =
  WS* content:(SoyBodyExpr / SingleElement / PairElement / Text) WS* {
    return content;
  };

SingleElement =
  "<" name:TagName WS* attributes:Attributes? WS* "/>" {
    return {
      type: "HTMLElement",
      name,
      attributes: attributes || {}, //.reduce((acc, e) => Object.assign(acc, e), {}),
      children: []
    };
  };

PairElement =
  startTag:StartTag children:ElementContent endTag:EndTag {
    if (startTag.name != endTag) {
      throw new Error(
        "Expected </" + JSON.stringify(startTag) + "> but </" + JSON.stringify(endTag) + "> found."
      );
    }

    return {
      type: "HTMLElement",
      name: startTag.name,
      attributes: startTag.attributes || {},
      children,
    };
  };

StartTag =
  "<" name:TagName WS* attributes:Attributes? ">" {
    return {
        name,
        attributes: attributes || {} //.reduce((acc, e) => Object.assign(acc, e), {})
    };
  };

EndTag =
  "</" name:TagName ">" { return name; };

TagName =
  head:[a-zA-Z_] tail:[a-zA-Z\-0-9]* {
      return head + tail.join("");
  };

Text =
  chars:[^<]+  {
  return {
      type: "TextNode",
      attributes: {},
      content: chars.join("")
    };
  };