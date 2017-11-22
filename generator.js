const recast = require('recast');
const util = require('util');

const ast =
{ type: 'Program',
  body:
   [ { type: 'ExpressionStatement',
       expression:
        { type: 'AssignmentExpression',
          operator: '=',
          left:
           { type: 'MemberExpression',
             property: { type: 'Identifier', name: 'icon', computed: false },
             object:
              { type: 'MemberExpression',
                property: { type: 'Identifier', name: 'RequestTypeIcons', computed: false },
                object:
                 { type: 'MemberExpression',
                   property: { type: 'Identifier', name: 'Components', computed: false },
                   object:
                    { type: 'MemberExpression',
                      property: { type: 'Identifier', name: 'Templates', computed: false },
                      object: { type: 'Identifier', name: 'ServiceDesk' } } } } },
          right:
           { type: 'ArrowFunctionExpression',
             id: null,
             body:
              { type: 'SequenceExpression',
                expressions:
                 [ { type: 'JSXElement',
                     openingElement:
                      { type: 'JSXOpeningElement',
                        name: { type: 'JSXIdentifier', name: 'GenerateTag' },
                        attributes:
                         [ { type: 'JSXAttribute',
                             name: { type: 'JSXIdentifier', name: 'name' },
                             value: { type: 'Literal', value: 'img' } },
                           { type: 'JSXAttribute',
                             name: { type: 'JSXIdentifier', name: 'selfClosing' },
                             value: null },
                           { type: 'JSXAttribute',
                             name: { type: 'JSXIdentifier', name: 'attributes' },
                             value:
                              { type: 'JSXExpressionContainer',
                                expression:
                                 { type: 'ArrayExpression',
                                   elements:
                                    [ { type: 'ObjectExpression',
                                        properties:
                                         [ { type: 'Property',
                                             key: { type: 'Literal', value: 'name' },
                                             value: { type: 'Literal', value: 'aria-hidden' },
                                             kind: 'init' },
                                           { type: 'Property',
                                             key: { type: 'Literal', value: 'value' },
                                             value: { type: 'Literal', value: 'true' },
                                             kind: 'init' } ] },
                                      { type: 'ConditionalExpression',
                                        test: { type: 'Identifier', name: 'style' },
                                        consequent:
                                         { type: 'ArrayExpression',
                                           elements:
                                            [ { type: 'ObjectExpression',
                                                properties:
                                                 [ { type: 'Property',
                                                     key: { type: 'Literal', value: 'name' },
                                                     value:
                                                      { type: 'TemplateLiteral',
                                                        quasis: [ { type: 'TemplateElement', value: { raw: 'style' } } ],
                                                        expressions: [] } },
                                                   { type: 'Property',
                                                     key: { type: 'Literal', value: 'value' },
                                                     value:
                                                      { type: 'TemplateLiteral',
                                                        quasis:
                                                         [ { type: 'TemplateElement', value: { raw: '' } },
                                                           { type: 'TemplateElement', value: { raw: '' } } ],
                                                        expressions: [ { type: 'Identifier', name: 'style' } ] } } ] } ] },
                                        alternate: { type: 'Literal', value: null } },
                                      { type: 'ObjectExpression',
                                        properties:
                                         [ { type: 'Property',
                                             key: { type: 'Literal', value: 'name' },
                                             value: { type: 'Literal', value: 'class' },
                                             kind: 'init' },
                                           { type: 'Property',
                                             key: { type: 'Literal', value: 'value' },
                                             value:
                                              { type: 'TemplateLiteral',
                                                quasis:
                                                 [ { type: 'TemplateElement', value: { raw: '' } },
                                                   { type: 'TemplateElement', value: { raw: '' } },
                                                   { type: 'TemplateElement', value: { raw: 'vp-rq-icon' } } ],
                                                expressions:
                                                 [ { type: 'ConditionalExpression',
                                                     test: { type: 'Identifier', name: 'class' },
                                                     consequent:
                                                      { type: 'TemplateLiteral',
                                                        quasis:
                                                         [ { type: 'TemplateElement',
                                                             value: { raw: { type: 'Identifier', name: 'class' } } },
                                                           { type: 'TemplateElement',
                                                             value: { raw: { type: 'Literal', value: ' ' } } } ],
                                                        expressions: [] },
                                                     alternate: { type: 'Literal', value: null } } ] },
                                             kind: 'init' } ] },
                                      
                                      { type: 'ConditionalExpression',
                                        test: { type: 'Identifier', name: 'title' },
                                        consequent:
                                         { type: 'ArrayExpression',
                                           elements:
                                            [ { type: 'ObjectExpression',
                                                properties:
                                                 [ { type: 'Property',
                                                     key: { type: 'Literal', value: 'name' },
                                                     value:
                                                      { type: 'TemplateLiteral',
                                                        quasis: [ { type: 'TemplateElement', value: { raw: 'title' } } ],
                                                        expressions: [] } },
                                                   { type: 'Property',
                                                     key: { type: 'Literal', value: 'value' },
                                                     value:
                                                      { type: 'TemplateLiteral',
                                                        quasis:
                                                         [ { type: 'TemplateElement', value: { raw: '' } },
                                                           { type: 'TemplateElement', value: { raw: '' } } ],
                                                        expressions: [ { type: 'Identifier', name: 'title' } ] } } ] } ] },
                                        alternate: { type: 'Literal', value: null } },
                                      { type: 'ConditionalExpression',
                                        test: { type: 'Identifier', name: 'dataKey' },
                                        consequent:
                                         { type: 'ArrayExpression',
                                           elements:
                                            [ { type: 'ObjectExpression',
                                                properties:
                                                 [ { type: 'Property',
                                                     key: { type: 'Literal', value: 'name' },
                                                     value:
                                                      { type: 'TemplateLiteral',
                                                        quasis:
                                                         [ { type: 'TemplateElement', value: { raw: '' } },
                                                           { type: 'TemplateElement', value: { raw: '' } },
                                                           { type: 'TemplateElement', value: { raw: 'data-' } } ],
                                                        expressions: [ { type: 'Identifier', name: 'dataKey' } ] } },
                                                   { type: 'Property',
                                                     key: { type: 'Literal', value: 'value' },
                                                     value:
                                                      { type: 'TemplateLiteral',
                                                        quasis:
                                                         [ { type: 'TemplateElement', value: { raw: '' } },
                                                           { type: 'TemplateElement', value: { raw: '' } } ],
                                                        expressions: [ { type: 'Identifier', name: 'dataValue' } ] } } ] } ] },
                                        alternate: { type: 'Literal', value: null } } ] } } } ] },
                     closingElement:
                      { type: 'JSXClosingElement',
                        name: { type: 'JSXIdentifier', name: 'GenerateTag' } },
                     children: [] },
                   { type: 'Literal', value: '\n' } ],
                expression: true },
             params:
              [ { type: 'ObjectPattern',
                  properties:
                   [ { type: 'Property',
                       shorthand: true,
                       kind: 'init',
                       key: { type: 'Identifier', name: 'iconId' },
                       value: { type: 'Identifier', name: 'iconId' } },
                     { type: 'Property',
                       shorthand: true,
                       kind: 'init',
                       key: { type: 'Identifier', name: 'title' },
                       value: { type: 'Identifier', name: 'title' } },
                     { type: 'Property',
                       shorthand: true,
                       kind: 'init',
                       key: { type: 'Identifier', name: 'dataValue' },
                       value: { type: 'Identifier', name: 'dataValue' } },
                     { type: 'Property',
                       shorthand: true,
                       kind: 'init',
                       key: { type: 'Identifier', name: 'style' },
                       value: { type: 'Identifier', name: 'style' } } ] } ] } } } ] }
;

const data = recast.print(ast).code;

console.log(data);
