WS
  = [\r\n \t];

SOY
  = namespaces:Namespace+ {
    return {
      type: "SoyFile",
      namespaces
    };
  };

Namespace
  = name:NamespaceDecl WS* templates:TemplateDef* {
    return {
      type: "Namespace",
      name,
      templates
    };
  };

TemplateDef
  = comments:(SoyTemplateDefComment / SoyComment / BlankLine)* WS* "{template " name:TemplateName WS* attributes:Attributes? "}" WS+ body:TemplateBodyElement* "{/template}" WS* {
    return {
      type: "Template",
      comments,
      name,
      attributes,
      body
    };
  };

TemplateName
  = LocalTemplateName
  / FullTemplateName;

LocalTemplateName
  = property:SubObjectPropertyAccessor {
    return {
      type: "MemberExpression",
      object: null,
      properties: [ property ]
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
  = chars:[^<{]+ {
    return {
      type: "Literal",
      value: chars.join('')
    };
  };

BlankLine
  = chars:WS+ {
    return undefined;
  };

HtmlComment
  = "<!--" chars:(!"-->" .)* "-->" {
    return null;
  };

SoyComment
  = SoyInlineComment
  / SoyMultilineComment;

SoyInlineComment
  = "//" chars:[^\n]* {
    return null;
  };

SoyMultilineComment
  = "/*" chars:(!"*/" .)* "*/" {
    return null;
  };

SoyTemplateDefComment
  = "/" "*"+ WS* lines:(SoyCommentParamDefinition / SoyCommentText / BlankLine)* WS* "*"+ "/" {
    return {
      type: "Comment",
      lines
    };
  };

SoyCommentText
  = chars:(!("\n" / "*/") .)* "\n" {
    return {
      type: "CommentText",
      content: chars.map(e => e[1]).join('')
    };
  };

SoyCommentParamDefinition
  = WS* "*" WS* param:(SoyCommentRequiredParamDef / SoyCommentOptionalParamDef) [^\n]* { return param; };

SoyCommentRequiredParamDef
  = "@param" WS+ name:Identifier {
    return {
      type: "TemplateParam",
      name
    };
  };

SoyCommentOptionalParamDef
  = "@param?" WS+ name:Identifier {
    return {
      type: "TemplateParam",
      name
    };
  };

NamespaceDecl
  = SoyComment* WS* "{namespace" WS+ name:(ObjectPropertyReference / Identifier) "}" {
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
  = "{" WS* expression:SoyMathExpression WS* "}" { return expression; }

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
  / SoySpecialCharacterNewline
  / SoyNilCharacter;

SoyNilCharacter
  = "{nil}" { return null; };

SoySpecialCharacterSpace
  = "{sp}" { return null; };

SoySpecialCharacterNewline
  = "{\\n}" { return null; };

SoySpecialCharacterIndentation
  = "{\\t}" { return null; };

SoySpecialCharacterCaretReturn
  = "{\\r}" { return null; };

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
  / SoyFunctionCall
  / SoyIfOperator;

SoyCapableString
  = DoubleQuotedSoyCapableString
  / SingleQuotedSoyCapableString;

DoubleQuotedSoyCapableString
  = '"' body:(SoyStringInterpolateableExpr / EscapeableDoubleQuoteText)* '"' {
    return {
      type: "SoyCapableString",
      body
    };
  };

SingleQuotedSoyCapableString
  = "'" body:(SoyStringInterpolateableExpr / EscapeableSingleQuoteText)* "'" {
    return {
      type: "SoyCapableString",
      body
    };
  };

EscapeableDoubleQuoteText
  = chars:[^{"]+ { return chars.join(''); };

EscapeableSingleQuoteText
  = chars:[^{']+ { return chars.join(''); };

SoyLiteralOperator
  = "{literal}" value:(!"{/literal}" .)* "{/literal}" {
    return {
      type: "RawText",
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
  = "{case" WS+ test:SoyCaseValues WS* "}" WS* body:TemplateBodyElement* {
    return {
      type: "CaseExpression",
      test,
      body
    };
  };

SoyCaseValues
  = SoyValueExpr WS* "," WS* SoyCaseValues
  / SoyValueExpr;

SoySwitchDefaultClause
  = "{default}" WS* body:TemplateBodyElement* {
    return {
      type: "CaseExpression",
      test: null,
      body
    };
  };

SoyForeachOperator
  = SoyForeachWithEmptySectionOperator
  / SoySimpleForeachOperator;

SoySimpleForeachOperator
  = "{" WS* "foreach" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyAtomicValue WS* "}" WS* body:TemplateBodyElement* WS* "{/foreach}" {
    return {
      type: "ForeachOperator",
      range,
      iterator,
      body
    };
  };

SoyForeachWithEmptySectionOperator
  = "{" WS* "foreach" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyAtomicValue WS* "}" WS* body:TemplateBodyElement* WS* "{ifempty}" WS* defaultBody:TemplateBodyElement* WS* "{/foreach}" {
    return {
      type: "ConditionalExpression",
      test: {
        type: "BinaryExpression",
        operator: "<",
        left: {
          type: "MemberExpression",
          object: range,
          properties: [
            {
              type: "Identifier",
              name: "length"
            }
          ]
        },
        right: {
          type: "Literal",
          value: 1
        }
      },
      consequent: {
        type: "ForeachOperator",
        range,
        iterator,
        body
      },
      alternate: defaultBody
    };
  };

SoyForOperator
  = "{" WS* "for" WS+ iterator:VariableReference WS+ "in" WS+ range:SoyRangeExpr WS* "}" WS* body:TemplateBodyElement* WS* "{/for}" {
    return {
      type: "ForeachOperator",
      range,
      iterator,
      body
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
  = list:SoyValueExpr {
    return list;
  };

FromZeroToHeroRangeParams
  = endIndex:SoyMathExpression {
    return {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "range"
      },
      arguments: [
        {
          type: "Literal",
          value: 0
        },
        endIndex,
        {
          type: "Literal",
          value: 1
        }
      ]
    };
  };

BetweenTwoValuesRangeParams
  = startIndex:SoyMathExpression WS* "," WS* endIndex:SoyMathExpression {
    return {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "range"
      },
      arguments: [
        startIndex,
        endIndex,
        {
          type: "Literal",
          value: (startIndex < endIndex) ? 1 : -1
        }
      ]
    };
  };

BetweenWithStepRangeParams
  = startIndex:SoyMathExpression WS* "," WS* endIndex:SoyMathExpression WS* "," WS* step:SoyMathExpression {
    return {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "range"
      },
      arguments: [
        startIndex,
        endIndex,
        step
      ]
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
  = "[" WS* elements:SoyArrayElements? WS* "]" {
    return {
      type: "ArrayExpression",
      elements: [].concat(elements).filter(e => !!e).reduce((acc, e) => acc.concat(e), [])
    };
  };

SoyArrayElements
  = SoyArrayMultipleElements
  / SoyArraySingleElement;

SoyArraySingleElement
  = WS* elt:SoyValueExpr WS* {
    return elt;
  };

SoyArrayMultipleElements
  = first:SoyArraySingleElement "," rest:SoyArrayElements {
    return [ first ].concat(rest);
  };

SoyMapExpression
  = "[" WS* properties:SoyMapEntries? WS* "]" {
    return {
      type: "ObjectExpression",
      properties
    };
  }

SoyMapEntries
  = SoyMapMultipleEntry
  / SoyMapSingleEntry;

SoyMapSingleEntry
  = WS* key:SoyValueExpr WS* ":" WS* value:SoyValueExpr WS* {
    return [
      {
        type: "Property",
        key,
        value,
        computed: !!key.type
      }
    ];
  };

SoyMapMultipleEntry
  = first:SoyMapSingleEntry "," rest:SoyMapEntries {
    return [ first ].concat(rest);
  };

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
      name,
      value
    };
  };

SoyAttributeGeneratorBooleanAttribute
  = name:SoyGeneratedAttributeNamePart+ {
    return {
      type: "GeneratedAttribute",
      name,
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
  = chars:AttributeNameChar+ {
    return chars.join('');
  };

SoyAttributeIfOperator
  = mainClause:SoyAttributeIfClause otherClauses:SoyAttributeElseifClause* otherwiseClause:SoyAttributeElseClause? SoyEndifOperator {
    return {
      type: "IfStatement",
      test: mainClause.test,
      consequent: mainClause.body,
      alternate: [].concat(otherClauses).concat(otherwiseClause ? [ otherwiseClause ] : [])
    };
  };

SoyAttributeIfClause
  = "{" WS* "if" WS+ test:SoyMathExpression WS* "}" WS* body:SoyAttributeIfOperatorOutput {
    return {
      type: "ConditionalBranch",
      test,
      body
    };
  };

SoyAttributeElseifClause
  = "{" WS* "elseif" WS+ test:SoyMathExpression WS* "}" WS* body:SoyAttributeIfOperatorOutput {
    return {
      type: "ConditionalBranch",
      test,
      body
    };
  };

SoyAttributeElseClause
  = "{" WS* "else" WS* "}" WS* body:SoyAttributeIfOperatorOutput {
    return {
      type: "ConditionalBranch",
      test: null,
      body
    };
  };

SoyAttributeIfOperatorOutput
  = outputs:SoyAttributeIfOperatorOutputSingle+;

SoyAttributeIfOperatorOutputSingle
  = (WS / SoySpecialCharacter)* attr:SoyAttributeExpr (WS / SoySpecialCharacter)* { return attr; };

SoyIfOperator
  = mainClause:SoyIfClause otherClauses:SoyElseifClause* otherwiseClause:SoyElseClause? SoyEndifOperator {
    return {
      type: "IfStatement",
      test: mainClause.test,
      consequent: mainClause.body,
      alternate: [].concat(otherClauses || []).concat(otherwiseClause ? [ otherwiseClause ] : [])
    };
  };

SoyIfClause
  = "{" WS* "if" WS+ test:SoyMathExpression WS* "}" WS* body:TemplateBodyElement* {
    return {
      type: "ConditionalBranch",
      test,
      body
    };
  };

SoyElseifClause
  = "{" WS* "elseif" WS+ test:SoyMathExpression WS* "}" WS* body:TemplateBodyElement* {
    return {
      type: "ConditionalBranch",
      test,
      body
    };
  };

SoyElseClause
  = "{" WS* "else" WS* "}" WS* body:TemplateBodyElement* {
    return {
      type: "ConditionalBranch",
      test: null,
      body
    };
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
      name,
      value
    };
  };

SoyMultilineLetOperator
  = "{" WS* "let" WS+ name:VariableReference WS* "}" WS* value:TemplateBodyElement* WS* "{/let}" {
    return {
      type: "VariableDeclaration",
      name,
      value
    };
  };

SoyVariableInterpolation
  = "{" reference:VariableReference filters:SoyFilters? "}" {
    return {
      type: "InterpolatedExpression",
      expression: {
        type: "VariableInterpolation",
        variable: reference,
        filters
      }
    };
  };

SoyEvaluatedTernaryOperator
  = "{" expression:SoyTernaryOperator "}" {
    return {
      type: "InterpolatedExpression",
      expression
    };
  };

VariableReference
  = "$" identifier:(ObjectPropertyReference / Identifier) {
    return identifier;
  };

ObjectPropertyReference
  = object:Identifier properties:(SubObjectPropertyAccessor / SubArrayAccessor)+ {
    return {
      type: "MemberExpression",
      object,
      properties
    };
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
    return {
      type: "Literal",
      value: property,
      computed: true
    };
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
    return {
      type: "InterpolatedExpression",
      expression: Object.assign(funcCall, { filters })
    }
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
      type: "TemplateCall",
      template: name,
      params: [].concat(inlineParams || []).concat(bodyParams || [])
    };
  };

InPlaceTemplateCall
  = "{call" WS+ name:TemplateName WS+ params:TemplateCallInlineParams? WS* "/}" {
    return {
      type: "TemplateCall",
      template: name,
      params: params || []
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
      type: "TemplateCallParam",
      name,
      value: null
    };
  };

TemplateCallInlineValueParam
  = name:Identifier WS* "=" WS* value:SoyValueExpr {
    return {
      type: "TemplateCallParam",
      name,
      value
    };
  };

MultilineTemplateCall
  = "{call" WS+ name:TemplateName WS* "}" WS* params:MultilineTemplateCallParams? WS* "{/call}" {
    return {
      type: "TemplateCall",
      template: name,
      params: params || []
    };
  };

MultilineTemplateCallParams
  = MultipleMultilineTemplateCallParams
  / SingleMultilineTemplateCallParams;

MultipleMultilineTemplateCallParams
  = WS* first:SingleMultilineTemplateCallParams WS* rest:MultilineTemplateCallParams { return [ first ].concat(rest); };

SingleMultilineTemplateCallParams
  = WS* first:MultilineTemplateCallParam WS* SoyComment? WS* { return first; };

MultilineTemplateCallParam
  = MultilineTemplateCallValueParam
  / MultilineTemplateCallBooleanParam;

MultilineTemplateCallBooleanParam
  = "{param" WS+ name:Identifier WS* "/}" {
    return {
      type: "TemplateCallParam",
      name,
      value: null
    };
  };

MultilineTemplateCallValueParam
  = MultilineTemplateCallInlineParam
  / MultilineTemplateCallMultilineParam;

MultilineTemplateCallMultilineParam
  = "{param" WS+ name:Identifier WS* "}" WS* value:TemplateBodyElement* WS* "{/param}" {
    return {
      type: "TemplateCallParam",
      name,
      value: {
        type: "InterpolatedExpression",
        expression: value
      }
    };
  };

MultilineTemplateCallInlineParam
  = "{param" WS+ name:Identifier WS* ":" WS* value:SoyValueExpr WS* "/}" {
    return {
      type: "TemplateCallParam",
      name,
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
  = "'" chars:[^']* "'" {
    return {
      type: "Literal",
      value: chars.join('')
    };
  };

DoubleQuotedString
  = '"' chars:[^"]* '"' {
    return {
      type: "Literal",
      value: chars.join('')
    };
  };

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
      type: "HtmlElement",
      tagName: element.tagName,
      attributes: element.attributes || [],
      children: element.children || []
    };
  };

DoctypeElement
  = "<!" ("doctype" / "DOCTYPE") WS+ attributes:DoctypeAttributes ">" {
    return {
      type: "Doctype",
      attributes
    };
  };

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
      type: "GeneratedElement",
      tagName: name,
      attributes: attributes || [],
      children: []
    };
  };

// & { return deepEqual(startTag, endTag); }
GeneratedPairElement
  = "<" startTag:GeneratedElementTagName WS* attributes:Attributes? WS* ">" children:TemplateBodyElement* "</" endTag:GeneratedElementTagName ">" {
    return {
      type: "GeneratedElement",
      tagName: startTag.name,
      attributes,
      children
    };
  };

GeneratedUnclosedElement
  = "<" name:GeneratedElementTagName WS* attributes:Attributes? WS* ">" {
    return {
      type: "GeneratedElement",
      tagName: name,
      attributes,
      children: []
    };
  };

SingleElement
  = "<" name:TagName WS* attributes:Attributes? WS* "/>" {
    return {
      type: "HtmlElement",
      tagName: name,
      attributes: attributes || [],
      children: []
    };
  };

// TODO: deepEqual to match startTag & endTag
PairElement
  = startTag:StartTag children:ElementContent? endTag:EndTag & { return startTag.name.type == endTag.name.type && startTag.name.name == endTag.name.name } {
    return {
      type: "HtmlElement",
      tagName: startTag.name,
      attributes: startTag.attributes || [],
      children: children || []
    };
  };

NonClosedElement
  = startTag:StartTag {
    return {
      type: "HtmlElement",
      tagName: startTag.name,
      attributes: startTag.attributes || []
    };
  };

StartTag
  = "<" name:TagName WS* attributes:Attributes? WS* ">" {
    return {
      name: {
        type: "Identifier",
        name
      },
      attributes: attributes || []
    };
  };

EndTag
  = "</" name:TagName ">" {
    return {
      name: {
        type: "Identifier",
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
