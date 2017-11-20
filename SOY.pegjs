SOY
  = Namespace+;

Namespace
  = ns:NamespaceDecl WS* templates:TemplateDef* {
    return { templates: templates.map(tpl => Object.assign(tpl, { name: ns + tpl.name })) };
  };

WS
  = [\r\n \t];

TemplateDef
  = comments:SoyTemplateDefComment* WS* "{template " name:TemplateName WS* attributes:Attributes? "}" WS+ body:TemplateBodyElement* "{/template}" WS* {
    return {
      type: "Template",
      comments,
      name,
      body
    };
  };

TemplateName
  = name:(LocalTemplateName / FullTemplateName) {
    return name;
  };

LocalTemplateName
  = ShortIdentifier;

ShortIdentifier
  = ids:("." Identifier)+ {
    return ids.map(t => t[0] + t[1].name).join('');
  };

ComplexIdentifier
  = head:Identifier tail:ShortIdentifier? {
    return head.name + tail;
  };

FullTemplateName
  = ComplexIdentifier;

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
  = "/*" lines:(SoyCommentParamDefinition / SoyCommentText / BlankLine)* "*/" {
    return lines;
  };

SoyCommentText
  = chars:(!("\n" / "*/") .)* "\n" { return { type: 'CommentText', content: chars.map(e => e[1]).join('') }; };

SoyCommentParamDefinition
  = WS* "*" WS* param:(SoyCommentRequiredParamDef / SoyCommentOptionalParamDef) WS* SoyCommentText? { return param; };

SoyCommentRequiredParamDef
  = "@param" WS+ name:Identifier { return name; };

SoyCommentOptionalParamDef
  = "@param?" WS+ name:Identifier { return name; };

NamespaceDecl
  = SoyComment* WS* "{namespace" WS+ name:NamespaceName "}" {
    return name;
  };

NamespaceName
  = ComplexIdentifier;

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
  = WS* "|" WS* name:Identifier { return { type: "Filter", name, params: [] }; };

SoyFilterWithParams
  = WS* "|" WS* name:Identifier params:SoyFilterParams? { return { type: "Filter", name, params: params || [] }; };

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
  = "{literal}" content:(!"{/literal}" .)* "{/literal}" {
    return {
      type: 'Raw',
      content
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
  = name:SoyGeneratedAttributeName "=" value:SoyCapableString { return { type: 'Attribute', name, value }; };

SoyAttributeGeneratorBooleanAttribute
  = name:SoyGeneratedAttributeName { return { type: 'Attribute', name, value: name }; };

SoyGeneratedAttributeName
  = SoyGeneratedAttributeNamePart+;

SoyGeneratedAttributeNamePart
  = SoyFunctionCall
  / SoyVariableInterpolation
  / SoyGeneratedAttributeNameStringPart;

SoyGeneratedAttributeNameStringPart
  = chars:AttributeNameChar+ { return chars.join(''); };

SoyAttributeIfOperator
  = mainClause:SoyAttributeIfClause otherClauses:SoyAttributeElseifClause* otherwiseClause:SoyAttributeElseClause? SoyEndifOperator {
    const values = [ mainClause, otherwiseClause ].concat(otherClauses).filter(branch => !!branch);

    return {
      type: "IfOperator",
      values
    };
  };

SoyAttributeIfClause
  = "{" WS* "if" WS+ clause:SoyMathExpression WS* "}" WS* output:SoyAttributeIfOperatorOutput {
    return { clause, output };
  };

SoyAttributeElseifClause
  = "{" WS* "elseif" WS+ clause:SoyMathExpression WS* "}" WS* output:SoyAttributeIfOperatorOutput {
    return { clause, output };
  };

SoyAttributeElseClause
  = "{" WS* "else" WS* "}" WS* output:SoyAttributeIfOperatorOutput {
    return { clause: null, output };
  };

SoyAttributeIfOperatorOutput
  = SoyAttributeIfOperatorOutputSingle+;

SoyAttributeIfOperatorOutputSingle
  = (WS / SoySpecialCharacter)* attr:Attribute (WS / SoySpecialCharacter)* { return [ attr ]; };

SoyIfOperator
  = mainClause:SoyIfClause otherClauses:SoyElseifClause* otherwiseClause:SoyElseClause? SoyEndifOperator {
    const values = [ mainClause, otherwiseClause ].concat(otherClauses).filter(branch => !!branch);

    return {
      type: "IfOperator",
      values
    };
  };

SoyIfClause
  = "{" WS* "if" WS+ clause:SoyMathExpression WS* "}" WS* output:TemplateBodyElement* {
    return { clause, output };
  };

SoyElseifClause
  = "{" WS* "elseif" WS+ clause:SoyMathExpression WS* "}" WS* output:TemplateBodyElement* {
    return { clause, output };
  };

SoyElseClause
  = "{" WS* "else" WS* "}" WS* output:TemplateBodyElement* {
    return { clause: null, output };
  };

SoyEndifOperator
  = "{/if}";

SoyTernaryOperator
  = test:SoyMathExpression WS* "?" WS* trueValue:SoyValueExpr WS* ":" WS* falseValue:SoyValueExpr {
    return {
      type: "ConditionalExpression",
      test,
      consequent: trueValue,
      alternate: falseValue
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
  = "{" reference:VariableReference filters:SoyFilters? "}" { return Object.assign({}, reference, { filters }); };

SoyEvaluatedTernaryOperator
  = "{" value:SoyTernaryOperator "}" { return value; };

VariableReference
  = "$" identifier:(ObjectPropertyReference / Identifier) {
    return identifier;
  };

ObjectPropertyReference
  = object:Identifier property:(SubObjectPropertyAccessor / SubArrayAccessor)+ {
    return Object.assign({
        type: "MemberExpression",
        object,
      }, property);
  };

SubObjectPropertyAccessor
  = "." property:Identifier {
    return {
      property,
      computed: false
    };
  };

SubArrayAccessor
  = "[" property:SoyValueExpr "]" {
    return {
      property,
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
    return parseInt(text());
  };

FloatNumber
  = "-"? [0-9]+ ("." [0-9]+)?
  {
      return parseFloat(text());
  };

BooleanValue
  = value:("true" / "false") { return { true: true, false: false }[value]; };

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
      return Object.assign({}, funcCall, { filters });
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
      type: "TemplateRef",
      name: name,
      attributes: Object.assign({}, (inlineParams || {}), (bodyParams || {})),
      content: []
    };
  };

InPlaceTemplateCall
  = "{call" WS+ name:TemplateName WS+ params:TemplateCallInlineParams? WS* "/}" {
    return {
      type: "TemplateRef",
      name: name,
      attributes: params || {},
      content: []
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
      type: 'Param',
      name,
      value: true
    };
  };

TemplateCallInlineValueParam
  = name:Identifier WS* "=" WS* value:SoyValueExpr {
    return {
      type: 'Param',
      name,
      value
    };
  };

MultilineTemplateCall
  = "{call" WS+ name:TemplateName WS* "}" WS* params:MultilineTemplateCallParams? WS* "{/call}" {
    return {
      type: "TemplateReference",
      name: name,
      attributes: params || {},
      content: []
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
      Type: 'Param',
      name,
      value: true,
      comment
    };
  };

MultilineTemplateCallValueParam
  = MultilineTemplateCallInlineParam
  / MultilineTemplateCallMultilineParam;

MultilineTemplateCallMultilineParam
  = "{param" WS+ name:Identifier WS* "}" WS* content:TemplateBodyElement* WS* "{/param}" {
    return {
      type: 'ContentParam',
      name,
      value: {
        name: name,
        attributes: [],
        content: content
      }
    };
  };

MultilineTemplateCallInlineParam
  = "{param" WS+ name:Identifier WS* ":" WS* value:SoyValueExpr WS* "/}" {
    return {
      type: 'Param',
      name,
      value
    };
  };

Attributes
  = MultipleAttributes
  / SingleAttribute;

SingleAttribute
  = attr:Attribute {
    return [ attr ];
  };

MultipleAttributes
  = WS* first:Attribute WS* rest:Attributes WS* {
    return [ first ].concat(rest);
  };

Attribute
  = SoyAttributeExpr;

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
  = WS* content:(SoyBodyExpr / HtmlComment / SingleElement / PairElement / NonClosedElement / Text) WS* {
    return content;
  };

SingleElement
  = "<" name:TagName WS* attributes:Attributes? WS* "/>" {
    return {
      type: "HTMLElement",
      name,
      attributes: attributes || {},
      children: []
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
      type: "HTMLElement",
      name,
      attributes,
      children: []
    };
  };

// & { return deepEqual(startTag, endTag); }
GeneratedPairElement
  = "<" startTag:GeneratedElementTagName WS* attributes:Attributes? WS* ">" children:TemplateBodyElement* "</" endTag:GeneratedElementTagName ">" {
    return {
      type: "HTMLElement",
      name: startTag,
      attributes,
      children
    };
  };

GeneratedUnclosedElement
  = "<" name:GeneratedElementTagName WS* attributes:Attributes? WS* ">"{
    return {
      type: "HTMLElement",
      name,
      attributes,
      children: []
    };
  };

PairElement
  = startTag:StartTag children:ElementContent? endTag:EndTag & { return startTag.name == endTag } {
    return {
      type: "HTMLElement",
      name: startTag.name,
      attributes: startTag.attributes || {},
      children: children || [],
    };
  };

NonClosedElement
  = tag:StartTag { return Object.assign({}, tag, { children: [] }); };

StartTag
  = "<" name:TagName WS* attributes:Attributes? WS* ">" {
    return {
      name,
      attributes: attributes || {}
    };
  };

EndTag
  = "</" name:TagName ">" { return name; };

TagName
  = head:[a-zA-Z_] tail:[a-zA-Z\-0-9]* {
      return head + tail.join("");
  };

Text
  = chars:[^<]+  {
    return {
      type: "TextNode",
      attributes: {},
      content: chars.join("")
    };
  };
