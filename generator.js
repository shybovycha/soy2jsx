const generate = (ast) => require('recast').print(ast).code;

const ast = {
    type: 'Program',
    body: [
        {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
                {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'template' },
                    init: {
                        type: 'ArrowFunctionExpression',
                        id: null,
                        expression: true,
                        params: [ { type: 'Identifier', name: 'name' } ],
                        body: {
                            type: 'JSXElement',
                            openingElement: {
                                type: 'JSXOpeningElement',
                                name: { type: 'JSXIdentifier', name: 'div' },
                                attributes: [
                                    {
                                        type: 'JSXAttribute',
                                        name: { type: 'JSXIdentifier', name: 'className' },
                                        value: {
                                            type: 'JSXExpressionContainer',
                                            expression: {
                                                type: 'ConditionalExpression',
                                                test: {
                                                    type: 'BinaryExpression',
                                                    operator: '==',
                                                    left: { type: 'Identifier', name: 'name' },
                                                    right: { type: 'Literal', value: null }
                                                },
                                                consequent: { type: 'Literal', value: 'hidden' },
                                                alternate: { type: 'Literal', value: 'visible' }
                                            }
                                        }
                                    }
                                ]
                            },
                            closingElement: {
                                type: 'JSXClosingElement',
                                name: { type: 'JSXIdentifier', name: 'div' }
                            },
                            children: [
                                { type: 'Literal', value: 'Hello, ' },
                                {
                                    type: 'JSXExpressionContainer',
                                    expression: { type: 'Identifier', name: 'name' }
                                },
                                { type: 'Literal', value: '!' }
                            ]
                        }
                    }
                }
            ]
        }
    ]
};

console.log(generate(ast));

