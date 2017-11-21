SOY
  = namespaces:Namespace+ {
    return {
      type: "Program",
      body: namespaces.reduce((acc, ns) => acc.concat(ns.templates), [])
    };
  };

Namespace
  = name:NamespaceDecl WS* templates:TemplateDef* {
    return {
      templates: templates
        .map(tpl => {
          if (tpl.name.type == "LocalTemplateName")
            tpl.name = Object.assign(tpl.name, { type: "MemberExpression", object: name });

          return {
            type: "ExpressionStatement",
            operator: "=",
            left: tpl.name,
            right: {
              type: "ArrowFunctionExpression",
              id: null,
              body: tpl.body,
              params: {
                type: "ObjectPattern",
                properties: tpl.params
              }
            }
          };
        }),
      name
    };
  };

WS
  = [\r\n \t];

TemplateDef
  = comments:SoyTemplateDefComment* WS* "{template " name:TemplateName WS* attributes:Attributes? "}" WS+ body:TemplateBodyElement* "{/template}" WS* {
    return {
      params: comments.reduce((acc, commentLines) => acc.concat(
        commentLines
          .filter(line => line.type == "TemplateParam")
          .map(param => (
            {
              type: "Property",
              shorthand: true,
              key: {
                type: "Identifier",
                name: param.name
              },
              value: {
                type: "Identifier",
                name: param.name
              }
            }
          )
        )
      ), []),
      name,
      body
    };
  };

TemplateName
  = name:(LocalTemplateName / FullTemplateName) {
    return name;
  };

LocalTemplateName
  = property:SubObjectPropertyAccessor {
    return {
      type: "LocalTemplateName",
      property
    };
  };

FullTemplateName
  = ObjectPropertyReference;

TemplateBodyElement
  = BlankLine
  / HtmlComment
  / SoyComment
  / DoctypeElement
  / GeneratedElement
  / SingleElement
  / PairElement
  / NonClosedElement
  / SoyBodyExpr
  / TemplateBodyText;

TemplateBodyText
  = chars:[^<{]+ { return chars.join(''); };

BlankLine
  = chars:WS+ {
    return {
      type: 'BlankLine',
      children: chars.join(''),
      attributes: []
    };
  };

HtmlComment
  = "<!--" chars:(!"-->" .)* "-->" { return chars.map(c => c[1]).join(""); };

SoyComment
  = SoyInlineComment
  / SoyMultilineComment;

SoyInlineComment
  = "//" chars:[^\n]* { return chars.join(''); };

SoyMultilineComment
  = "/*" chars:(!"*/" .)* "*/" { return chars.map(c => c[1]).join(""); };

SoyTemplateDefComment
  = "/" "*"+ WS* lines:(SoyCommentParamDefinition / SoyCommentText / BlankLine)* WS* "*"+ "/" {
    return lines;
  };

SoyCommentText
  = chars:(!("\n" / "*/") .)* "\n" { return { type: 'CommentText', content: chars.map(e => e[1]).join('') }; };

SoyCommentParamDefinition
  = WS* "*" WS* param:(SoyCommentRequiredParamDef / SoyCommentOptionalParamDef) WS* SoyCommentText? { return param; };

SoyCommentRequiredParamDef
  = "@param" WS+ name:Identifier { return { type: "TemplateParam", name }; };

SoyCommentOptionalParamDef
  = "@param?" WS+ name:Identifier { return { type: "TemplateParam", name }; };

NamespaceDecl
  = SoyComment* WS* "{namespace" WS+ name:ObjectPropertyReference "}" {
    return name;
  };

Identifier
  = head:IdentifierFirstChar tail:IdentifierChar* {
    return {
      type: "Identifier",
      name: head + tail.join('')
    };
  };

IdentifierFirstChar = [a-zA-Z];
IdentifierChar = [a-zA-Z0-9_];

SoyMathEvaluationExpression
  = "{" WS* expression:SoyMathExpression WS* "}" { return { type: "MathExpression", expression }; }

SoyBodyExpr
  = SoyComment
  / SoyMathEvaluationExpression
  / SoySpecialCharacter
  / SoyEvaluatedTernaryOperator
  / SoyVariableInterpolation
  / SoyFunctionCall
  / SoyTemplateCall
  / SoyLetOperator
  / SoyIfOperator
  / SoyForeachOperator
  / SoyForOperator
  / SoySwitchOperator
  / SoyLiteralOperator;

SoyFilterableAtomicValue
  = DoubleQuotedString
  / SingleQuotedString
  / VariableReference
  / FunctionCall
  / SoyMathExpression;

SoySpecialCharacter
  = SoySpecialCharacterSpace
  / SoySpecialCharacterIndentation
  / SoySpecialCharacterCaretReturn
  / SoySpecialCharacterNewline;

SoySpecialCharacterSpace
  = "{sp}" { return { type: "SpecialCharacter", name: "space" }; };

SoySpecialCharacterNewline
  = "{\\n}" { return { type: "SpecialCharacter", name: "newline" }; };

SoySpecialCharacterIndentation
  = "{\\t}" { return { type: "SpecialCharacter", name: "indentation" }; };

SoySpecialCharacterCaretReturn
  = "{\\r}" { return { type: "SpecialCharacter", name: "caret_return" }; };

SoyFilters
  = SoyFilter+;

SoyFilter
  = SoyFilterWithParams
  / SoySimpleFilter;

SoySimpleFilter
  = WS* "|" WS* name:Identifier {
    return {
      type: "Filter",
      name,
      arguments: []
    };
  };

SoyFilterWithParams
  = WS* "|" WS* name:Identifier params:SoyFilterParams? {
    return {
      type: "Filter",
      name,
      params: params || []
    };
  };

SoyFilterParams
  = SoyFilterParam+;

SoyFilterParam
  = WS* ":" WS* value:SoyValueExpr { return value; };

SoyStringInterpolateableExpr
  = FloatNumber
  / IntegerNumber
  / SoyVariableInterpolation
  / SoyFunctionCall;

SoyCapableString
  = str:(DoubleQuotedSoyCapableString / SingleQuotedSoyCapableString) {
    return str;
  };

DoubleQuotedSoyCapableString
  = '"' content:(SoyStringInterpolateableExpr / EscapeableDoubleQuoteText)* '"' { return content; };

SingleQuotedSoyCapableString
  = "'" content:(SoyStringInterpolateableExpr / EscapeableSingleQuoteText)* "'" { return content; };

EscapeableDoubleQuoteText
  = chars:[^"]+ { return chars.join(''); };

EscapeableSingleQuoteText
  = chars:[^']+ { return chars.join(''); };

SoyLiteralOperator
  = "{literal}" value:(!"{/literal}" .)* "{/literal}" {
    return {
      type: "Literal",
      value
    };
  };

SoySwitchOperator
  = "{switch" WS+ expression:SoyValueExpr WS* "}" WS* clauses:SoySwitchOperatorBody WS* "{/switch}" {
    return {
      type: "SwitchOperator",
      expression,
      clauses
    };
  };

SoySwitchOperatorBody
  = SoySwithWithDefault
  / SoySwitchBodyWithNoDefault;

SoySwitchBodyWithNoDefault
  = clauses:SoySwitchOperatorCase* {
    return clauses;
  };

SoySwithWithDefault
  = clauses:SoySwitchOperatorCase* WS* defaultClause:SoySwitchDefaultClause {
    return clauses.concat([ defaultClause ]);
  };

SoySwitchOperatorCase
  = "{case" WS+ clause:SoyCaseValues WS* "}" WS* output:TemplateBodyElement* {
    return {
      clause,
      output
    }
  };

SoyCaseValues
  = SoyValueExpr WS* "," WS* SoyCaseValues
  / SoyValueExpr;

SoySwitchDefaultClause
  = "{default}" WS* output:TemplateBodyElement* {
    return {
      clause: null,
      output
    }
  };

SoyForeachOperator
  = SoyForeachWithEmptySectionOperator
  / SoySimpleForeachOperator;

SoySimpleForeachOperator
  = "{" WS* "foreach" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyAtomicValue WS* "}" WS* output:TemplateBodyElement* WS* "{/foreach}" {
    return {
      type: "ForeachOperator",
      range,
      output,
      defaultOutput: []
    };
  };

SoyForeachWithEmptySectionOperator
  = "{" WS* "foreach" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyAtomicValue WS* "}" WS* output:TemplateBodyElement* WS* "{ifempty}" WS* defaultOutput:TemplateBodyElement* WS* "{/foreach}" {
    return {
      type: "ForeachOperator",
      iterator: iterator.name,
      range,
      output,
      defaultOutput
    };
  };

SoyForOperator
  = "{" WS* "for" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyRangeExpr WS* "}" WS* output:TemplateBodyElement* WS* "{/for}" {
    return {
      type: "ForOperator",
      iterator: iterator.name,
      range,
      output
    };
  };

SoyRangeExpr
  = "range(" WS* rangeParams:SoyRangeParams WS* ")" {
    return rangeParams;
  };

SoyRangeParams
  = BetweenWithStepRangeParams
  / BetweenTwoValuesRangeParams
  / FromZeroToHeroRangeParams
  / InListParams;

InListParams
  = list:SoyValueExpr { return { list }; };

FromZeroToHeroRangeParams
  = endIndex:SoyMathExpression {
    return {
      startIndex: 0,
      endIndex,
      step: 1
    };
  };

BetweenTwoValuesRangeParams
  = startIndex:SoyMathExpression WS* "," WS* endIndex:SoyMathExpression {
    return {
      startIndex,
      endIndex,
      step: (startIndex < endIndex) ? 1 : -1
    };
  };

BetweenWithStepRangeParams
  = startIndex:SoyMathExpression WS* "," WS* endIndex:SoyMathExpression WS* "," WS* step:SoyMathExpression {
    return {
      startIndex,
      endIndex,
      step
    };
  };

SoyAtomicValue
  = FloatNumber
  / IntegerNumber
  / BooleanValue
  / DoubleQuotedString
  / SingleQuotedString
  / VariableReference
  / FunctionCall
  / SoyArrayExpression
  / SoyMapExpression
  / SoyNullValue;

SoyValueExpr
  = SoyTernaryOperator
  / SoyMathExpression;

SoyArrayExpression
  = "[" WS* elements:SoyArrayElements? WS* "]" { return [].concat(elements).reduce((acc, e) => acc.concat(e), []); };

SoyArrayElements
  = SoyArrayMultipleElements
  / SoyArraySingleElement;

SoyArraySingleElement
  = WS* elt:SoyValueExpr WS*  { return [ elt ]; };

SoyArrayMultipleElements
  = first:SoyArraySingleElement "," rest:SoyArrayElements { return [ first ].concat(rest); };

SoyMapExpression
  = "[" WS* entries:SoyMapEntries? WS* "]" { return entries; } //.reduce((acc, e) => Object.assign(acc, { [e.key]: e.value }), {}); };

SoyMapEntries
  = SoyMapMultipleEntry
  / SoyMapSingleEntry;

SoyMapSingleEntry
  = WS* key:SoyValueExpr WS* ":" WS* value:SoyValueExpr WS* { return [{ key, value }]; };

SoyMapMultipleEntry
  = first:SoyMapSingleEntry "," rest:SoyMapEntries { return [ first ].concat(rest); };

SoyNullValue = "null";

SoyMathExpression
  = SoyBinaryExpression
  / SoyUnaryExpression;

SoyBinaryExpression
  = left:SoyPrimaryExpression WS* operator:SoyBinaryOperator WS* right:(SoyBinaryExpression / SoyUnaryExpression) {
      return {
        type: "BinaryExpression",
        operator,
        left,
        right
      };
    }
  / SoyPrimaryExpression;

SoyUnaryExpression
  = operator:SoyUnaryOperator? WS* argument:SoyBinaryExpression {
      return {
        type: "UnaryExpression",
        operator,
        argument,
        prefix: true
      };
    }
  / SoyPrimaryExpression;

SoyBinaryOperator
  = SoyComparisonOperator
  / SoyLogicOperator
  / SoyArithmeticOperator;

SoyPrimaryExpression
  = "(" WS* expr:SoyMathExpression WS* ")" { return expr; }
  / SoyAtomicValue;

SoyArithmeticOperator
  = "+"
  / "-"
  / "*"
  / "/"
  / "%";

SoyLogicOperator
  = "and"
  / "or";

SoyUnaryOperator
  = "+"
  / "-"
  / "not";

SoyComparisonOperator
  = "=="
  / "<="
  / ">="
  / "!="
  / "<"
  / ">";

SoyAttributeExpr
  = SoySpecialCharacter
  / SoyAttributeIfOperator
  / SoyFunctionCall
  / SoyTemplateCall
  / SoyVariableInterpolation
  / SoyAttributeGeneratorValueAttribute
  / SoyAttributeGeneratorBooleanAttribute;

SoyAttributeGeneratorValueAttribute
  = name:SoyGeneratedAttributeNamePart+ "=" value:SoyCapableString {
    return {
      type: "GeneratedAttribute",
      name: {
        type: "TemplateLiteral",
        quasis: name.map(v => ({ type: "TemplateElement", value: v }))
      },
      value: {
        type: "TemplateLiteral",
        quasis: value.map(v => ({ type: "TemplateElement", value: v }))
      }
    };
  };

SoyAttributeGeneratorBooleanAttribute
  = name:SoyGeneratedAttributeNamePart+ {
    return {
      type: "GeneratedAttribute",
      key: {
        type: "TemplateLiteral",
        quasis: name.map(v => ({ type: "TemplateElement", value: v }))
      },
      value: {
        type: "Literal",
        value: true
      }
    };
  };

SoyGeneratedAttributeNamePart
  = SoyFunctionCall
  / SoyVariableInterpolation
  / SoyGeneratedAttributeNameStringPart;

SoyGeneratedAttributeNameStringPart
  = chars:AttributeNameChar+ { return chars.join(''); };

SoyAttributeIfOperator
  = mainClause:SoyAttributeIfClause otherClauses:SoyAttributeElseifClause* otherwiseClause:SoyAttributeElseClause? SoyEndifOperator {
    // TODO: handle if statement inside attributes somehow
    const recursiveReduce = (clauses) => {
      if (clauses && clauses.length < 2) {
        return clauses[0].output;
      } else {
        return {
          type: "IfStatement",
          test: clauses[0].test,
          consequent: clauses[0].output,
          alternate: recursiveReduce(clauses.slice(1))
        };
      }
    };

    return {
      type: "IfStatement",
      test: mainClause.test,
      consequent: mainClause.output,
      alternate: recursiveReduce([].concat(otherClauses || []).concat(otherwiseClause ? [ otherwiseClause ] : [ { output: null } ]))
    };
  };

SoyAttributeIfClause
  = "{" WS* "if" WS+ test:SoyMathExpression WS* "}" WS* output:SoyAttributeIfOperatorOutput {
    return { test, output };
  };

SoyAttributeElseifClause
  = "{" WS* "elseif" WS+ test:SoyMathExpression WS* "}" WS* output:SoyAttributeIfOperatorOutput {
    return { test, output };
  };

SoyAttributeElseClause
  = "{" WS* "else" WS* "}" WS* output:SoyAttributeIfOperatorOutput {
    return { test: null, output };
  };

SoyAttributeIfOperatorOutput
  = outputs:SoyAttributeIfOperatorOutputSingle+ {
    return {
      type: "JSXExpressionContainer",
      expression: {
        type: "TemplateLiteral",
        quasis: outputs.map(v => ({ type: "TemplateElement", value: v }))
      }
    };
  };

SoyAttributeIfOperatorOutputSingle
  = (WS / SoySpecialCharacter)* attr:SoyAttributeExpr (WS / SoySpecialCharacter)* { return attr; };

SoyIfOperator
  = mainClause:SoyIfClause otherClauses:SoyElseifClause* otherwiseClause:SoyElseClause? SoyEndifOperator {
    const recursiveReduce = (clauses) => {
      if (clauses && clauses.length < 2) {
        return clauses[0].output;
      } else {
        return {
          type: "IfStatement",
          test: clauses[0].test,
          consequent: clauses[0].output,
          alternate: recursiveReduce(clauses.slice(1))
        };
      }
    };

    return {
      type: "IfStatement",
      test: mainClause.test,
      consequent: mainClause.output,
      alternate: recursiveReduce([].concat(otherClauses || []).concat(otherwiseClause ? [ otherwiseClause ] : [ { output: null } ]))
    };
  };

SoyIfClause
  = "{" WS* "if" WS+ test:SoyMathExpression WS* "}" WS* output:TemplateBodyElement* {
    return { test, output };
  };

SoyElseifClause
  = "{" WS* "elseif" WS+ test:SoyMathExpression WS* "}" WS* output:TemplateBodyElement* {
    return { test, output };
  };

SoyElseClause
  = "{" WS* "else" WS* "}" WS* output:TemplateBodyElement* {
    return { test: null, output };
  };

SoyEndifOperator
  = "{/if}";

SoyTernaryOperator
  = test:SoyMathExpression WS* "?" WS* consequent:SoyValueExpr WS* ":" WS* alternate:SoyValueExpr {
    return {
      type: "ConditionalExpression",
      test,
      consequent,
      alternate
    };
  };

SoyLetOperator
  = SoyInlineLetOperator
  / SoyMultilineLetOperator;

SoyInlineLetOperator
  = "{" WS* "let" WS+ name:VariableReference WS* ":" WS* value:SoyValueExpr WS* "/}" {
    return {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name
          },
          init: value
        }
      ],
      kind: "let"
    };
  };

SoyMultilineLetOperator
  = "{" WS* "let" WS+ name:VariableReference WS* "}" WS* value:TemplateBodyElement* WS* "{/let}" {
    return {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name
          },
          init: value
        }
      ],
      kind: "let"
    };
  };

SoyVariableInterpolation
  = "{" reference:VariableReference filters:SoyFilters? "}" {
    const recursiveApplyFilters = (filters, expression) => {
      if (filters.length < 1) {
        return expression;
      } else {
        return {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: filters[0].name,
          },
          arguments: [].concat(filters[0].arguments).concat(recursiveApplyFilters(filters.slice(1), expression))
        };
      }
    };

    return {
      type: "JSXExpressionContainer",
      expression: recursiveApplyFilters(filters || [], reference)
    };
  };

SoyEvaluatedTernaryOperator
  = "{" expression:SoyTernaryOperator "}" {
    return {
      type: "JSXExpressionContainer",
      expression
    };
  };

VariableReference
  = "$" identifier:(ObjectPropertyReference / Identifier) {
    return identifier;
  };

ObjectPropertyReference
  = object:Identifier properties:(SubObjectPropertyAccessor / SubArrayAccessor)+ {
    const recursiveAssign = (properties) => {
      if (properties && properties.length < 2) {
        return properties[0];
      } else {
        return {
          type: "MemberExpression",
          property: properties[0],
          object: recursiveAssign(properties.slice(1))
        };
      }
    };

    const props = [ object ].concat(properties);
    props.reverse();

    return recursiveAssign(props);
  };

SubObjectPropertyAccessor
  = "." property:Identifier {
    return Object.assign(
      property,
      { computed: false }
    );
  };

SubArrayAccessor
  = "[" property:SoyValueExpr "]" {
    return Object.assign(
      property,
      { computed: true }
    );
  };

IntegerIndex
  = [0-9]+ {
    return parseInt(text());
  };

IntegerNumber
  = "0"
  / ("-"? [1-9] [0-9]*)
  {
    return {
      type: "Literal",
      value: parseInt(text())
    };
  };

FloatNumber
  = "-"? [0-9]+ ("." [0-9]+)? {
    return {
      type: "Literal",
      value: parseFloat(text())
    };
  };

BooleanValue
  = value:("true" / "false") {
    return {
      type: "Literal",
      value: { "true": true, "false": false }[value]
    };
  };

FunctionCallArguments
  = MultipleFunctionCallArguments
  / SingleFunctionCallArgument;

SingleFunctionCallArgument
  = first:SoyValueExpr {
    return [ first ];
  };

MultipleFunctionCallArguments
  = first:SoyValueExpr WS* "," WS* rest:FunctionCallArguments {
    return [ first ].concat(rest);
  };

SoyFunctionCall
  = "{" WS* funcCall:FunctionCall WS* filters:SoyFilters? WS* "}" {
    const recursiveApplyFilters = (filters, expression) => {
      if (filters.length < 1) {
        return expression;
      } else {
        return {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: filters[0].name,
          },
          arguments: [].concat(filters[0].arguments).concat(recursiveApplyFilters(filters.slice(1), expression))
        };
      }
    };

    return {
      type: "JSXExpressionContainer",
      expression: recursiveApplyFilters(filters || [], funcCall)
    };
  };

FunctionCall
  = callee:Identifier "(" WS* args:FunctionCallArguments? WS* ")" {
    return {
      type: "CallExpression",
      callee,
      arguments: args
    };
  };

SoyTemplateCall
  = InPlaceTemplateCall
  / MultilineTemplateCall
  / MixedTemplateCall;

MixedTemplateCall
  = "{call" WS+ name:TemplateName WS+ inlineParams:TemplateCallInlineParams? WS* "}" WS* bodyParams:MultilineTemplateCallParams? WS* "{/call}" {
    return {
      type: "CallExpression",
      callee: name,
      arguments: [].concat(inlineParams || []).concat(bodyParams || []),
    };
  };

InPlaceTemplateCall
  = "{call" WS+ name:TemplateName WS+ params:TemplateCallInlineParams? WS* "/}" {
    return {
      type: "CallExpression",
      callee: name,
      arguments: params || [],
    };
  };

TemplateCallInlineParams
  = MultipleTemplateCallInlineParams
  / SingleTemplateCallInlineParams;

MultipleTemplateCallInlineParams
  = first:TemplateCallInlineParam WS+ rest:TemplateCallInlineParams { return [ first ].concat(rest); };

SingleTemplateCallInlineParams
  = first:TemplateCallInlineParam { return [ first ]; };

TemplateCallInlineParam
  = TemplateCallInlineValueParam
  / TemplateCallInlineBooleanParam;

TemplateCallInlineBooleanParam
  = name:Identifier {
    return {
      type: "Property",
      key: {
        type: "Identifier",
        name,
      },
      value: {
        type: "Literal",
        value: true
      }
    };
  };

TemplateCallInlineValueParam
  = name:Identifier WS* "=" WS* value:SoyValueExpr {
    return {
      type: "Property",
      key: {
        type: "Identifier",
        name
      },
      value
    };
  };

MultilineTemplateCall
  = "{call" WS+ name:TemplateName WS* "}" WS* params:MultilineTemplateCallParams? WS* "{/call}" {
    return {
      type: "CallExpression",
      callee: name,
      arguments: [
        {
          type: "ObjectExpression",
          properties: params
        }
      ]
    };
  };

MultilineTemplateCallParams
  = MultipleMultilineTemplateCallParams
  / SingleMultilineTemplateCallParams;

MultipleMultilineTemplateCallParams
  = WS* first:SingleMultilineTemplateCallParams WS* rest:MultilineTemplateCallParams { return [ first ].concat(rest); };

SingleMultilineTemplateCallParams
  = WS* first:MultilineTemplateCallParam WS* SoyComment? WS* { return [ first ]; };

MultilineTemplateCallParam
  = MultilineTemplateCallValueParam
  / MultilineTemplateCallBooleanParam;

MultilineTemplateCallBooleanParam
  = "{param" WS+ name:Identifier WS* "/}" {
    return {
      type: "Property",
      key: {
        type: "Identifier",
        name,
      },
      value: {
        type: "Literal",
        value: true,
      }
    };
  };

MultilineTemplateCallValueParam
  = MultilineTemplateCallInlineParam
  / MultilineTemplateCallMultilineParam;

MultilineTemplateCallMultilineParam
  = "{param" WS+ name:Identifier WS* "}" WS* value:TemplateBodyElement* WS* "{/param}" {
    return {
      type: "Property",
      key: {
        type: "Identifier",
        name,
      },
      value
    };
  };

MultilineTemplateCallInlineParam
  = "{param" WS+ name:Identifier WS* ":" WS* value:SoyValueExpr WS* "/}" {
    return {
      type: "Property",
      key: {
        type: "Identifier",
        name,
      },
      value
    };
  };

Attributes
  = MultipleAttributes
  / SingleAttribute;

SingleAttribute
  = attr:SoyAttributeExpr {
    return [ attr ];
  };

MultipleAttributes
  = WS* first:SoyAttributeExpr WS* rest:Attributes WS* {
    return [ first ].concat(rest);
  };

AttributeName
  = pre:AttributeNameStartChar post:AttributeNameChar* {
    return pre + post.join('');
  };

AttributeNameStartChar
  = [a-zA-Z];

AttributeNameChar
  = [a-zA-Z\-0-9_.];

SingleQuotedString
  = "'" chars:[^']* "'" { return chars.join(''); };

DoubleQuotedString
  = '"' chars:[^"]* '"' { return chars.join(''); };

ElementContent
  = MultipleElementContentChildren
  / SingleElementContentChild
  / BlankChild;

BlankChild
  = WS+ { return null; };

MultipleElementContentChildren
  = WS* first:ElementContentChild WS* rest:ElementContent? WS* { return [ first ].concat(rest); };

SingleElementContentChild
  = WS* first:ElementContentChild WS* { return [ first ]; };

ElementContentChild
  = WS* content:(SoyBodyExpr / HtmlComment / HTMLElement / Text) WS* {
    return content;
  };

HTMLElement
  = element:(SingleElement / PairElement / NonClosedElement) {
    return {
      type: "JSXElement",
      openingElement: element.openingElement,
      closingElement: element.closingElement || null,
      children: element.children || [],
    };
  };

SingleElement
  = "<" name:TagName WS* attributes:Attributes? WS* "/>" {
    if (attributes.some(a => a.type == "GeneratedAttribute")) {
      // TODO: <GenerateTag name={name} attributes={attributes} selfClosing>{content}</GenerateTag>
      return {};
    }

    return {
      openingElement: {
        type: "JSXOpeningElement",
        name,
        attributes: attributes || [],
        selfClosing: true
      }
    };
  };

DoctypeElement
  = "<!" ("doctype" / "DOCTYPE") WS+ attributes:DoctypeAttributes ">" { return { type: 'Doctype', attributes }; }

DoctypeAttributes
  = (DoctypeAttribute WS+ DoctypeAttributes) / DoctypeAttribute;

DoctypeAttribute
  = Identifier / SoyCapableString;

GeneratedElement
  = GeneratedSingleElement
  / GeneratedPairElement
  / GeneratedUnclosedElement;

GeneratedElementTagName
  = SoyBodyExpr;

GeneratedSingleElement
  = "<" name:GeneratedElementTagName WS* attributes:Attributes? WS* "/>" {
    return {
      openingElement: {
        type: "JSXOpeningElement",
        name: {
          type: "JSXIdentifier",
          name: "GenerateTag"
        },
        attributes: [
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "name"
            },
            value: name // This could be either an expression or just a value
          },
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "selfClosing"
            },
            value: null, // Is set (the boolean attribute)
          },
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "attributes"
            },
            value: {
              type: "JSXExpressionContainer",
              expression: {
                type: "ArrayExpression",
                elements: attributes
              }
            }
          }
        ]
      },
      closingElement: {
        type: "JSXClosingElement",
        name: {
          type: "JSXIdentifier",
          name: "GenerateTag"
        }
      },
      children: []
    };
  };

// & { return deepEqual(startTag, endTag); }
GeneratedPairElement
  = "<" startTag:GeneratedElementTagName WS* attributes:Attributes? WS* ">" children:TemplateBodyElement* "</" endTag:GeneratedElementTagName ">" {
    return {
      openingElement: {
        type: "JSXOpeningElement",
        name: {
          type: "JSXIdentifier",
          name: "GenerateTag"
        },
        attributes: [
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "name"
            },
            value: startTag.name // This could be either an expression or just a value
          },
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "attributes"
            },
            value: {
              type: "JSXExpressionContainer",
              expression: attributes // Interpolation made simple
            }
          }
        ]
      },
      closingElement: {
        type: "JSXClosingElement",
        name: {
          type: "JSXIdentifier",
          name: "GenerateTag"
        }
      },
      children
    };
  };

GeneratedUnclosedElement
  = "<" name:GeneratedElementTagName WS* attributes:Attributes? WS* ">" {
    return {
      openingElement: {
        type: "JSXOpeningElement",
        name: {
          type: "JSXIdentifier",
          name: "GenerateTag"
        },
        attributes: [
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "name"
            },
            value: name // This could be either an expression or just a value
          },
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "selfClosing"
            },
            value: null, // Is set (the boolean attribute)
          },
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "attributes"
            },
            value: {
              type: "JSXExpressionContainer",
              expression: attributes // Interpolation made simple
            }
          }
        ]
      },
      closingElement: {
        type: "JSXClosingElement",
        name: {
          type: "JSXIdentifier",
          name: "GenerateTag"
        }
      },
      children: []
    };
  };

// TODO: deepEqual to match startTag & endTag
PairElement
  = startTag:StartTag children:ElementContent? endTag:EndTag & { return startTag.name.type == endTag.name.type && startTag.name.name == endTag.name.name } {
    return {
      openingElement: {
        type: "JSXOpeningElement",
        name: startTag.name,
        attributes: startTag.attributes || {},
      },
      closingElement: {
        type: "JSXClosingElement",
        name: endTag.name,
      },
      children: children || [],
    };
  };

NonClosedElement
  = openingElement:StartTag {
    return {
      openingElement: Object.assign(openingElement, { type: "JSXOpeningElement", selfClosing: true })
    };
  };

StartTag
  = "<" name:TagName WS* attributes:Attributes? WS* ">" {
    return {
      name: {
        type: "JSXIdentifier",
        name
      },
      attributes: attributes || {}
    };
  };

EndTag
  = "</" name:TagName ">" {
    return {
      name: {
        type: "JSXIdentifier",
        name
      }
    };
  };

TagName
  = head:[a-zA-Z_] tail:[a-zA-Z\-0-9]* {
      return head + tail.join("");
  };

Text
  = chars:[^<]+  {
    return {
      type: "Literal",
      value: chars.join("")
    };
  };
