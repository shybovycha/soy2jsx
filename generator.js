const flatten = (arr) => Array.isArray(arr) ? arr.reduce((acc, e) => acc.concat(flatten(e)), []) : arr;

const deepCopy = (obj) => {
    if (Array.isArray(obj)) return [].slice.apply(obj);

    return Object.assign({}, obj);
};

class Context {
    constructor(type, parent) {
        this.parent = parent;
        this.type = type;
    }

    createContext(ctxType) {
        const ctx = new Context(ctxType, this);

        return ctx;
    }

    findParent(ctxType) {
        if (this.type === ctxType) {
            return this;
        }

        if (!this.parent) {
            return null;
        }

        return this.parent.findParent(ctxType);
    }

    addPropertyElement(property, value) {
        if (!this[property]) {
            this[property] = [];
        }

        this[property].push(value);
    }

    setProperty(property, value) {
        this[property] = value;
    }
}

const ContextType = {
    SOY_FILE: 'SOY_FILE',
    NAMESPACE: 'NAMESPACE',
    NAMESPACE_NAME: 'NAMESPACE_NAME',
    TEMPLATE_DECLARATION: 'TEMPLATE',
    TEMPLATE_NAME: 'TEMPLATE_NAME',
    TEMPLATE_COMMENT: 'TEMPLATE_COMMENT',
    TEMPLATE: 'TEMPLATE',
    TEMPLATE_ELEMENT: 'TEMPLATE_ELEMENT',
    VARIABLE_DECLARATION: 'VARIABLE_DECLARATION',
    HTML_ELEMENT_ATTRIBUTE: 'HTML_ELEMENT_ATTRIBUTE',
    HTML_ELEMENT_CHILD: 'HTML_ELEMENT_CHILD',
    CALL_EXPRESSION_ARGUMENT: 'CALL_EXPRESSION_ARGUMENT',
    FOREACH_BODY: 'FOREACH_BODY',
    FOREACH_RANGE: 'FOREACH_RANGE',
    CALL_EXPRESSION_CALLEE: 'CALL_EXPRESSION_CALLEE',
    SWITCH_OPERATOR_EXPRESSION: 'SWITCH_OPERATOR_EXPRESSION',
    SWITCH_OPERATOR_CASE: 'SWITCH_OPERATOR_CASE',
    SWITCH_OPERATOR_CASE_TEST: 'SWITCH_OPERATOR_CASE_TEST',
    SWITCH_OPERATOR_CASE_BODY: 'SWITCH_OPERATOR_CASE_BODY',
    INTERPOLATED_EXPRESSION_EXPRESSION: 'INTERPOLATED_EXPRESSION_EXPRESSION',
    CONDITIONAL_EXPRESSION_EXPRESSION: 'CONDITIONAL_EXPRESSION_EXPRESSION',
    VARIABLE_REFERENCE: 'VARIABLE_REFERENCE',
    FILTER: 'FILTER',
    TEMPLATE_CALL_ARGUMENT: 'TEMPLATE_CALL_ARGUMENT',
    CONDITIONAL_EXPRESSION_BRANCH: 'CONDITIONAL_EXPRESSION_BRANCH',
    CONDITIONAL_EXPRESSION_BODY: 'CONDITIONAL_EXPRESSION_BODY',
    PROPERTY_KEY: 'PROPERTY_KEY',
    PROPERTY_VALUE: 'PROPERTY_VALUE',
    OBJECT_EXPRESSION_PROPERTY: 'OBJECT_EXPRESSION_PROPERTY',
    COMMENT_TEXT: 'COMMENT_TEXT',
    BINARY_OPERATOR_ARGUMENT: 'BINARY_OPERATOR_ARGUMENT',
    UNARY_OPERATOR_ARGUMENT: 'UNARY_OPERATOR_ARGUMENT',
    HTML_ELEMENT_ATTRIBUTE_VALUE: 'HTML_ELEMENT_ATTRIBUTE_VALUE',
    INTERPOLATED_EXPRESSION: 'INTERPOLATED_EXPRESSION',
    STRING_INTERPOLATED_EXPRESSION: 'STRING_INTERPOLATED_EXPRESSION',
};

const findVisitor = (nodeType) => visitors[nodeType];

const findGenerator = (contextType) => generators[contextType];

class Visitor {
    constructor() { }

    preprocess(node, localContext, parentContext) { }

    preprocessChild(node, childrenContextType, parentContext) {
        if (!node)
            return null;

        const visitor = findVisitor(node.type);
        const nodeContext = parentContext.createContext(childrenContextType);

        nodeContext.__visitor = visitor;

        visitor.preprocess(node, nodeContext, parentContext);

        return nodeContext;
    }

    preprocessChildren(children, childrenContextType, parentContext) {
        if (!children) {
            return [];
        }

        return children
            .filter(e => !!e)
            .map(node => this.preprocessChild(node, childrenContextType, parentContext));
    }

    generate(localContext, parentContext) { }

    generateChild(child, localContext) {
        if (!child)
            return;

        if (!child.__visitor) 
            return child;

        const visitor = child.__visitor;

        return visitor.generate(child, localContext);
    }

    generateChildren(children, localContext) {
        if (!children)
            return [];

        return children
            .filter(e => !!e)
            .map(child => this.generateChild(child, localContext));
    }

    simplifyListExpression(expr) {
        if (Array.isArray(expr)) {
            if (expr.length > 1) {
                return expr;
            } else if (expr.length == 1) {
                return expr[0];
            } else {
                return {
                    type: "Literal",
                    value: null
                };
            }
        }

        return expr;
    }

    wrapIfNeeded(needsWrapper, expr, parentCtx) {
        // NO PARENT CTX???!!!
        if (needsWrapper.some(e => e === parentCtx.type)) {
            return {
                type: "JSXExpressionContainer",
                expression: expr
            };
        }

        return expr;
    }
}

class SoyFileVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        this.preprocessChildren(node.namespaces, ContextType.NAMESPACE, localCtx);
    }

    generate(localCtx, parentCtx) {
        const namespaces = this.generateChildren(localCtx.namespaces, localCtx);

        return {
            type: "Program",
            body: flatten(namespaces)
        };
    }
}

class NamespaceVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        parentCtx.addPropertyElement('namespaces', localCtx);

        localCtx.name = this.preprocessChild(node.name, ContextType.NAMESPACE_NAME, localCtx);

        this.preprocessChildren(node.templates, ContextType.TEMPLATE_DECLARATION, localCtx);
    }

    generate(localCtx, parentCtx) {
        return this.generateChildren(localCtx.templates, localCtx);
    }
}

class TemplateVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.namespace = parentCtx.name;
        localCtx.name = this.preprocessChild(node.name, ContextType.TEMPLATE_NAME, localCtx);
        localCtx.body = this.preprocessChildren(node.body, ContextType.TEMPLATE_ELEMENT, localCtx);

        parentCtx.addPropertyElement('templates', localCtx);

        this.preprocessChildren(node.comments, ContextType.TEMPLATE_COMMENT, localCtx);
    }

    generate(localCtx, parentCtx) {
        const mergeNames = (master, slave) => {
            if (!slave.object) {
                slave.object = master;
                return;
            }

            mergeNames(master, slave.object);
        };

        // replaces localCtx.name with the full reference
        mergeNames(localCtx.namespace, localCtx.name);

        const name = this.generateChild(localCtx.name, localCtx);

        const params = localCtx.params.map(param => ({
            type: "Property",
            key: param.name,
            value: param.name,
            kind: "init",
            computed: false,
            method: false,
            shorthand: true
        }));

        let children = this.generateChildren(localCtx.body, localCtx);

        children = this.simplifyListExpression(children);

        let returnArgument = children;

        if (Array.isArray(children) && children.length > 1) {
            returnArgument = {
                type: "SequenceExpression",
                expressions: children
            };
        }

        const returnStatement = {
            type: "ReturnStatement",
            argument: returnArgument
        };

        const variableDeclarations = this.generateChildren(localCtx.variableDeclarations, localCtx);

        let body;

        if (variableDeclarations.length > 0) {
            body = {
                type: "BlockStatement",
                body: variableDeclarations.concat([returnStatement])
            };
        } else {
            body = returnArgument;
        }

        return {
            type: "ExpressionStatement",
            expression: {
                type: "AssignmentExpression",
                operator: "=",
                left: name,
                right: {
                    type: "ArrowFunctionExpression",
                    id: null,
                    params: [
                        {
                            type: "ObjectPattern",
                            properties: params
                        }
                    ],
                    body
                }
            }
        };
    }
}

class MemberExpressionVisitor extends Visitor {
    static recursiveAssign(properties) {
        if (properties && properties.length < 2) {
            return properties[0];
        } else {
            return {
                type: "MemberExpression",
                property: properties[0],
                object: MemberExpressionVisitor.recursiveAssign(properties.slice(1)),
                computed: properties[0].computed
            };
        }
    };

    preprocess(node, localCtx, parentCtx) {
        const props = [node.object].concat(node.properties);

        props.reverse();

        const memberExpr = MemberExpressionVisitor.recursiveAssign(props);

        localCtx.object = memberExpr.object;
        localCtx.property = memberExpr.property;
    }

    generate(localCtx) {
        const contextToMemberExpression = (ctx) => {
            if (!ctx.object) {
                return ctx;
            }

            return {
                type: "MemberExpression",
                object: contextToMemberExpression(ctx.object),
                property: ctx.property
            }
        };

        return contextToMemberExpression(localCtx);
    }
}

class LiteralVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.value = node.value;
    }

    generate(localCtx) {
        return {
            type: "Literal",
            value: localCtx.value
        };
    }
}

class CommentVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('lines', node.lines);

        this.preprocessChildren(node.lines, ContextType.COMMENT_TEXT, localCtx);
    }

    generate(localCtx) {
        return null;
    }
}

class CommentTextVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        // localCtx.setProperty('comment', node.text); 
    }

    generate(localCtx) {
        return null;
    }
}

class TemplateParamVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('name', node.name);

        localCtx.findParent(ContextType.TEMPLATE_DECLARATION).addPropertyElement('params', localCtx);
    }

    // INFO: no need to implement generate() method here,
    // since all the params are registered inside template's context
}

class IdentifierVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('name', node.name);
    }

    generate(localCtx) {
        return {
            type: "Identifier",
            name: localCtx.name
        };
    }
}

class FilterVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.name = node.name;
        localCtx.params = node.params;

        // parentCtx.addPropertyElement('filters', localCtx);
    }

    // TODO: no need to implement generate() here, since all the filters are applied to the parent ctx
}

class SoyCapableStringVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        const quasis = node.body.map(e => e.type && e.type === "InterpolatedExpression" ? "" : e);
        const expressions = node.body.filter(e => e.type && e.type === "InterpolatedExpression");

        localCtx.type = ContextType.STRING_INTERPOLATED_EXPRESSION;
        localCtx.quasis = quasis;
        localCtx.expressions = this.preprocessChildren(expressions, ContextType.STRING_INTERPOLATED_EXPRESSION, localCtx);
    }

    generate(localCtx, parentCtx) {
        const expressions = this.generateChildren(localCtx.expressions, localCtx);

        let quasis = localCtx.quasis;

        quasis = quasis.map(e => ({
            type: "TemplateElement",
            value: {
                raw: e
            }
        }));

        let returnArgument;

        if (expressions.length == 1 && quasis.length == 2) {
            returnArgument = localCtx.body[0];
        } else if (expressions.length == 0) {
            returnArgument = {
                type: "Literal",
                value: quasis.join("")
            };
        } else {
            returnArgument = {
                type: "TemplateLiteral",
                quasis: quasis,
                expressions: expressions
            };
        }

        const needsWrapper = [
            ContextType.HTML_ELEMENT_ATTRIBUTE,
            ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
            ContextType.PROPERTY_VALUE,
        ];

        if (needsWrapper.some(e => e === parentCtx.type)) {
            return {
                type: "JSXExpressionContainer",
                expression: returnArgument
            };
        }

        return returnArgument;
    }
}

class RawTextVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('value', node.value);
    }

    generate(localCtx) {
        return {
            type: "Literal",
            value: localCtx.value
        };
    }
}

class SwitchOperatorVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('expression', node.expression);
        localCtx.setProperty('clauses', node.clauses);

        this.preprocessChild(node.expression, ContextType.SWITCH_OPERATOR_EXPRESSION, localCtx);
        this.preprocessChildren(node.clauses, ContextType.SWITCH_OPERATOR_CASE, localCtx);
    }

    generate(localCtx) {
        // TODO: implement
        return null;
    }
}

class CaseExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('test', node.test);
        localCtx.setProperty('body', node.body);

        this.preprocessChild(node.test, ContextType.SWITCH_OPERATOR_CASE_TEST, localCtx);
        this.preprocessChildren(node.body, ContextType.SWITCH_OPERATOR_CASE_BODY, localCtx);
    }

    generate(localCtx) {
        // TODO: implement
        return null;
    }
}

class CallExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.callee = this.preprocessChild(node.callee, ContextType.CALL_EXPRESSION_CALLEE, localCtx);
        localCtx.arguments = this.preprocessChildren(node.arguments, ContextType.CALL_EXPRESSION_ARGUMENT, localCtx);
    }

    generate(localCtx, parentCtx) {
        const callee = this.generateChild(localCtx.callee, localCtx);
        const args = this.generateChildren(localCtx.arguments, localCtx);

        const callExpr = {
            type: "CallExpression",
            callee: callee,
            arguments: args
        };

        const needsWrapper = [
            ContextType.CONDITIONAL_EXPRESSION_BODY,
            ContextType.FOREACH_BODY,
            ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
            ContextType.HTML_ELEMENT_CHILD,
            // ContextType.PROPERTY_VALUE,
            // ContextType.VARIABLE_REFERENCE,
            ContextType.SWITCH_OPERATOR_CASE_BODY,
            ContextType.TEMPLATE_ELEMENT,
        ];

        return this.wrapIfNeeded(needsWrapper, callExpr, parentCtx);
    }
}

class ForeachOperatorVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('range', node.range);
        localCtx.setProperty('iterator', node.iterator);
        localCtx.setProperty('body', node.body);

        this.preprocessChildren(node.range, ContextType.FOREACH_RANGE, localCtx);
        this.preprocessChildren(node.body, ContextType.FOREACH_BODY, localCtx);
    }

    generate(localCtx) {
        let body = this.generateChildren(localCtx.body, localCtx);

        if (body.length > 1) {
            body = {
                type: "SequenceExpression",
                expressions: body
            };
        } else if (body.length == 1) {
            body = body[0];
        } else {
            body = {
                type: "Literal",
                value: null
            };
        }

        const range = localCtx.range;
        const iterator = localCtx.iterator;

        return {
            type: "CallExpression",
            callee: {
                type: "MemberExpression",
                object: range,
                property: {
                    type: "Identifier",
                    name: "map"
                }
            },
            arguments: [
                {
                    type: "ArrowFunctionExpression",
                    id: null,
                    params: [
                        iterator
                    ],
                    body: {
                        type: "BlockStatement",
                        body: [
                            {
                                type: "ReturnStatement",
                                argument: body
                            }
                        ]
                    },
                    generator: false,
                    expression: false,
                    async: false
                }
            ]
        };
    }
}

class ObjectExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('properties', node.properties);

        this.preprocessChildren(node.properties, ContextType.OBJECT_EXPRESSION_PROPERTY, localCtx);
    }

    generate(localCtx) {
        return {
            type: "ObjectExpression",
            properties: this.generateChildren(localCtx.properties, localCtx)
        };
    }
}

class PropertyVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('computed', node.computed);
        localCtx.setProperty('key', node.key);
        localCtx.setProperty('value', node.value);

        this.preprocessChild(node.key, ContextType.PROPERTY_KEY, localCtx);
        this.preprocessChildren(node.value, ContextType.PROPERTY_VALUE, localCtx);
    }

    generate(localCtx) {
        return {
            type: "Property",
            properties: this.generateChildren(localCtx.properties, localCtx)
        };
    }
}

class BinaryExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        const binaryOperatorsMapping = {
            'and': '&&',
            'or': '||',
        };

        localCtx.setProperty('operator', binaryOperatorsMapping[node.operator] || node.operator);
        localCtx.setProperty('left', node.left);
        localCtx.setProperty('right', node.right);

        this.preprocessChild(node.left, ContextType.BINARY_OPERATOR_ARGUMENT, localCtx);
        this.preprocessChild(node.right, ContextType.BINARY_OPERATOR_ARGUMENT, localCtx);
    }

    generate(localCtx) {
        const { operator, left, right } = localCtx;

        let type = "BinaryExpression";

        if (operator == '&&' || operator == '||') {
            type = "LogicalExpression";
        }

        return {
            type,
            operator,
            left,
            right
        };
    }
}

class LogicalExpressionVisitor extends BinaryExpressionVisitor {
}

class UnaryExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        const unaryOperatorsMapping = {
            'not': '!'
        };

        localCtx.setProperty('operator', unaryOperatorsMapping[node.operator] || node.operator);
        localCtx.setProperty('argument', node.argument);
        localCtx.setProperty('prefix', node.prefix);

        this.preprocessChild(node.argument, ContextType.UNARY_OPERATOR_ARGUMENT, localCtx);
    }

    generate(localCtx) {
        const { operator, argument, prefix } = localCtx;

        return {
            type: "UnaryExpression",
            operator,
            argument,
            prefix
        };
    }
}

class GeneratedAttributeVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        let name = node.name;

        if (Array.isArray(name)) {
            if (name.length == 1) {
                name = name[0];
            }
        }

        localCtx.name = name;
        localCtx.value = this.preprocessChild(node.value, ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE, localCtx);
    }

    generate(localCtx) {
        let { name, value } = localCtx;

        value = this.generateChild(value, localCtx);
        value = this.simplifyListExpression(value);

        return {
            type: "JSXAttribute",
            name,
            value
        };
    }
}

class ConditionalExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.test = this.preprocessChild(node.test, ContextType.CONDITIONAL_EXPRESSION_EXPRESSION, localCtx);
        localCtx.consequent = this.preprocessChildren(node.consequent, ContextType.CONDITIONAL_EXPRESSION_BRANCH, localCtx);
        localCtx.alternate = this.preprocessChildren(node.alternate, ContextType.CONDITIONAL_EXPRESSION_BRANCH, localCtx);
    }

    generate(localCtx, parentCtx) {
        let { test, consequent, alternate } = localCtx;

        const recursiveReduce = (clauses) => {
            if (clauses && clauses.length < 2) {
                if (clauses[0].type === "ConditionalExpression" || clauses[0].type === "ConditionalBranch") {
                    return clauses[0].body || { type: "Literal", value: null };
                } else {
                    return clauses[0];
                }
            } else {
                return {
                    type: "ConditionalExpression",
                    test: clauses[0].test, // .type ? clauses[0].test : { type: "Literal", value: clauses[0].test },
                    consequent: this.simplifyListExpression(clauses[0].body),
                    alternate: recursiveReduce(clauses.slice(1))
                };
            }
        };

        test = this.generateChild(test, localCtx);
        consequent = flatten(this.generateChildren(consequent, localCtx));
        alternate = flatten(this.generateChildren(alternate, localCtx));

        const condExpr = {
            type: "ConditionalExpression",
            test,
            consequent: this.simplifyListExpression(consequent),
            alternate: this.simplifyListExpression(recursiveReduce(alternate))
        };

        const needsWrapper = [
            ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
            ContextType.HTML_ELEMENT_CHILD,
            ContextType.TEMPLATE_ELEMENT
        ];

        return this.wrapIfNeeded(needsWrapper, condExpr, parentCtx);
    }
}

class IfStatementVisitor extends ConditionalExpressionVisitor {
}

class VariableDeclarationVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('name', node.name);
        localCtx.setProperty('value', node.value);

        const templateCtx = localCtx.findParent(ContextType.TEMPLATE);

        templateCtx.addPropertyElement('variableDeclarations', localCtx);

        this.preprocessChild(node.value, ContextType.VARIABLE_DECLARATION, localCtx);
    }

    generate(localCtx) {
        return {
            type: "VariableDeclaration",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: localCtx.name,
                    init: localCtx.value
                }
            ],
            kind: "let"
        };
    }
}

class ConditionalBranchVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.test = this.preprocessChild(node.test, ContextType.CONDITIONAL_EXPRESSION_EXPRESSION, localCtx);
        localCtx.body = this.preprocessChildren(node.body, ContextType.CONDITIONAL_EXPRESSION_BODY, localCtx);
    }

    generate(localCtx) {
        const { test, body } = localCtx;

        if (!test) {
            return this.generateChildren(body, localCtx);
        }

        return {
            test,
            body
        };
    }
}

class InterpolatedExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.type = ContextType.INTERPOLATED_EXPRESSION;
        localCtx.expression = this.preprocessChild(node.expression, ContextType.INTERPOLATED_EXPRESSION_EXPRESSION, localCtx);
        localCtx.filters = this.preprocessChildren(node.expression.filters, ContextType.FILTER, localCtx);
    }

    generate(localCtx, parentCtx) {
        let expr = this.generateChild(localCtx.expression, localCtx);
        
        const filters = localCtx.filters;

        const recursiveApplyFilters = function (filters, expression) {
            if (filters.length < 1) {
                return expression;
            } else {
                return {
                    type: "CallExpression",
                    callee: filters[0].name,
                    arguments: [].concat(recursiveApplyFilters(filters.slice(1), expression)).concat(filters[0].arguments).filter(e => !!e)
                };
            }
        };

        expr = recursiveApplyFilters(filters, expr);

        const needsWrapper = [
            ContextType.TEMPLATE_ELEMENT,
            ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
            ContextType.HTML_ELEMENT_CHILD,
        ];

        return this.wrapIfNeeded(needsWrapper, expr, parentCtx);
    }
}

class VariableInterpolationVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.variable = this.preprocessChild(node.variable, ContextType.VARIABLE_REFERENCE, localCtx);
    }

    generate(localCtx, parentCtx) {
        return this.generateChild(localCtx.variable, localCtx);
    }
}

class TemplateCallVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        if (!Array.isArray(node.params)) {
            node.params = [node.params];
        }

        localCtx.template = this.preprocessChild(node.template, ContextType.TEMPLATE_NAME, localCtx);
        localCtx.params = this.preprocessChildren(node.params, ContextType.TEMPLATE_CALL_ARGUMENT, localCtx);
    }

    generate(localCtx, parentCtx) {
        const callExpr = {
            type: "CallExpression",
            callee: this.generateChild(localCtx.template, localCtx),
            arguments: [
                {
                    type: "ObjectExpression",
                    properties: this.generateChildren(localCtx.params, localCtx)
                }
            ]
        };

        const needsWrapper = [
            ContextType.TEMPLATE_ELEMENT,
            ContextType.HTML_ELEMENT_CHILD,
            ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
        ];

        return this.wrapIfNeeded(needsWrapper, callExpr, parentCtx);
    }
}

class TemplateCallParamVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.name = node.name;
        localCtx.value = this.preprocessChild(node.value, ContextType.TEMPLATE_CALL_ARGUMENT, localCtx);
    }

    generate(localCtx) {
        return {
            type: "Property",
            key: this.generateChild(localCtx.name, localCtx),
            value: this.generateChild(localCtx.value, localCtx),
            kind: "init"
        };
    }
}

class HtmlElementVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.tagName = node.tagName;
        localCtx.attributes = this.preprocessChildren(node.attributes, ContextType.HTML_ELEMENT_ATTRIBUTE, localCtx);
        localCtx.children = this.preprocessChildren(node.children, ContextType.HTML_ELEMENT_CHILD, localCtx);
    }

    generate(localCtx) {
        let { tagName, attributes, children } = localCtx;

        const selfClosing = children.length == 0;

        attributes = this.generateChildren(attributes, localCtx);
        children = this.generateChildren(children, localCtx);

        const openingElement = {
            type: "JSXOpeningElement",
            name: tagName,
            selfClosing,
            attributes
        };

        const closingElement = selfClosing ? null : {
            type: "JSXClosingElement",
            name: tagName
        };

        return {
            type: "JSXElement",
            openingElement,
            closingElement,
            children
        };
    }
}

class DoctypeVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.setProperty('attributes', node.attributes);
    }

    generate(localCtx) {
        // TODO: implement
        return null;
    }
}

class GeneratedElementVisitor extends HtmlElementVisitor {
    generate(localCtx) {
        return {
            type: "JSXElement",
            openingElement: {
                type: "JSXOpeningElement",
                name: localCtx.tagName,
                attributes: localCtx.attributes,
                selfClosing: localCtx.children.length < 1
            },
            closingElement: {
                type: "JSXClosingElement",
                name: localCtx.tagName
            },
            children: localCtx.children
        };
    }
}

class Generator {
    constructor() { }

    generateJSX(ast) {
        const ctx = new Context(ContextType.SOY_FILE);
        const visitor = findVisitor('SoyFile');

        visitor.preprocess(ast, ctx);
        return visitor.generate(ctx, null);
    }
}

const visitors = {
    'SoyFile': new SoyFileVisitor(),
    'Namespace': new NamespaceVisitor(),
    'Template': new TemplateVisitor(),
    'MemberExpression': new MemberExpressionVisitor(),
    'Literal': new LiteralVisitor(),
    'Comment': new CommentVisitor(),
    'CommentText': new CommentTextVisitor(),
    'TemplateParam': new TemplateParamVisitor(),
    'Identifier': new IdentifierVisitor(),
    'Filter': new FilterVisitor(),
    'SoyCapableString': new SoyCapableStringVisitor(),
    'RawText': new RawTextVisitor(),
    'SwitchOperator': new SwitchOperatorVisitor(),
    'CaseExpression': new CaseExpressionVisitor(),
    'ForeachOperator': new ForeachOperatorVisitor(),
    'LogicalExpression': new LogicalExpressionVisitor(),
    'CallExpression': new CallExpressionVisitor(),
    'ObjectExpression': new ObjectExpressionVisitor(),
    'Property': new PropertyVisitor(),
    'BinaryExpression': new BinaryExpressionVisitor(),
    'UnaryExpression': new UnaryExpressionVisitor(),
    'GeneratedAttribute': new GeneratedAttributeVisitor(),
    'IfStatement': new IfStatementVisitor(),
    'ConditionalExpression': new ConditionalExpressionVisitor(),
    'VariableDeclaration': new VariableDeclarationVisitor(),
    'InterpolatedExpression': new InterpolatedExpressionVisitor(),
    'VariableInterpolation': new VariableInterpolationVisitor(),
    'TemplateCall': new TemplateCallVisitor(),
    'TemplateCallParam': new TemplateCallParamVisitor(),
    'HtmlElement': new HtmlElementVisitor(),
    'Doctype': new DoctypeVisitor(),
    'GeneratedElement': new GeneratedElementVisitor(),
    'ConditionalBranch': new ConditionalBranchVisitor(),
};

module.exports.generate = (ast) => new Generator().generateJSX(ast);
