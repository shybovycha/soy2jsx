const { deepCopy, flatten } = require('./utils.js');
const { ContextType, Context } = require('./context.js');
const { Visitor } = require('./visitor.js');

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
        const mergeNames = (master, slave) => {
            if (!slave.object) {
                slave.object = master;
                return;
            }

            mergeNames(master, slave.object);
        };

        // replaces localCtx.name with the full reference
        localCtx.name = node.name;
        mergeNames(parentCtx.name, localCtx.name);

        localCtx.name = this.preprocessChild(node.name, ContextType.TEMPLATE_NAME, localCtx);
        localCtx.addPropertyElements('body', this.preprocessChildren(node.body, ContextType.TEMPLATE_ELEMENT, localCtx));

        localCtx.params = [];

        parentCtx.addPropertyElement('templates', localCtx);

        this.preprocessChildren(node.comments, ContextType.TEMPLATE_COMMENT, localCtx);
    }

    generate(localCtx, parentCtx) {
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

        // if (children.every(e => e.type === "IfStatement")) {
        //     const wrapWithReturn = (elts) => {
        //         let returnArg = elts;

        //         if (Array.isArray(elts)) {
        //             if (elts.length > 1) {
        //                 returnArg = {
        //                     type: "ArrayExpression",
        //                     elements: elts
        //                 };
        //             } else if (elts.length == 1) {
        //                 returnArg = elts[0];
        //             } else {
        //                 returnArg = {
        //                     type: "Literal",
        //                     value: null
        //                 }
        //             }
        //         }

        //         return {
        //             type: "ReturnStatement",
        //             argument: returnArg
        //         };
        //     };

        //     children = children.map(child => {
        //         if (child.consequent.body) {
        //             child.consequent.body = wrapWithReturn(child.consequent.body);
        //         } else {
        //             child.consequent = wrapWithReturn(child.consequent);
        //         }

        //         if (child.alternate) {
        //             if (child.alternate.body) {
        //                 child.alternate.body = wrapWithReturn(child.alternate.body);
        //             } else {
        //                 child.alternate = wrapWithReturn(child.alternate);
        //             }
        //         }

        //         return child;
        //     });
        // }

        // TODO: is this a template call-only templates processing (the second "OR" branch)?
        let returnArgument = children.filter(e => e.type === "JSXElement" || (e.type === "ExpressionStatement" && e.expression.type !== "AssignmentExpression"));

        if (returnArgument.length > 1) {
            returnArgument = {
                type: "JSXFragment",
                openingFragment: {
                    type: "JSXOpeningFragment"
                },
                closingFragment: {
                    type: "JSXClosingFragment"
                },
                children: returnArgument
            };
        } else if (returnArgument.length == 1) {
            returnArgument = returnArgument[0];
        } else {
            returnArgument = null;
        }

        // filter logic lines (assignment, if operators, etc.) from the element-only ones
        let logicChildren = children.filter(e => e.type !== "JSXElement" && e.type !== "VariableDeclaration" && (e.type !== "ExpressionStatement" || (e.type === "ExpressionStatement" && e.expression.type === "AssignmentExpression")));

        logicChildren = this.generateChildren(logicChildren, localCtx);

        // if there is nothing to return but a string
        if (!returnArgument && !logicChildren.some(e => e.type === "JSXElement" || e.type === "IfStatement")) {
            returnArgument = this.createTemplateLiteralFromExpressions(logicChildren);
        }

        const variableDeclarations = this.generateChildren(localCtx.variableDeclarations, localCtx);

        let body = variableDeclarations.concat(logicChildren);

        if (returnArgument) {
            const returnStatement = {
                type: "ReturnStatement",
                argument: returnArgument
            };

            body.push(returnStatement)
        }

        if (variableDeclarations.length > 0 || logicChildren.length > 0) {
            body = {
                type: "BlockStatement",
                body
            };
        } else {
            body = this.simplifyListExpression(returnArgument);
        }

        return {
            type: "VariableDeclaration",
            kind: "const",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: name,
                    init: {
                        type: "ArrowFunctionExpression",
                        id: null,
                        generator: false,
                        async: false,
                        expression: true,
                        params: [
                            {
                                type: "ObjectPattern",
                                properties: params
                            },
                        ],
                        body
                    }
                }
            ]
        };
    }
}

class MemberExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        const recursiveAssign = function (properties) {
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

        let props = [node.object].concat(node.properties).filter(e => !!e);

        props = this.preprocessChildren(props, ContextType.MEMBER_EXPRESSION_CHILD, localCtx);

        props.reverse();

        const memberExpr = recursiveAssign(props);

        localCtx.object = memberExpr.object;
        localCtx.property = memberExpr.property;
    }

    generate(localCtx) {
        const that = this;
        const contextToMemberExpression = function (ctx) {
            if (!ctx.object && !ctx.property) {
                return ctx;
            } else if (!ctx.object || !ctx.property) {
                return contextToMemberExpression(ctx.object || ctx.property);
            }

            const object = that.generateChild(contextToMemberExpression(ctx.object), localCtx);
            const property = that.generateChild(ctx.property, localCtx);

            return {
                type: "MemberExpression",
                object,
                property,
                computed: property.type !== "Identifier"
            }
        };

        const needsWrapper = [
            ContextType.HTML_ELEMENT_CHILD,
        ];

        const expr = contextToMemberExpression(localCtx);

        return this.wrapIfNeeded(needsWrapper, expr, localCtx);
    }
}

class LiteralVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        if (node.value.type && node.value.type === "Literal") {
            localCtx.value = node.value.value;
        } else {
            localCtx.value = node.value;
        }
    }

    generate(localCtx) {
        return {
            type: "Literal",
            value: "" + localCtx.value
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
        let quasis = [];
        let expressions = [];

        node.body.forEach(e => {
            if (!e.type || (e.type && e.type !== "InterpolatedExpression" && e.type !== "IfStatement")) {
                quasis.push(e);
            } else {
                quasis.push("");
                expressions.push(e);
            }
        });

        localCtx.type = ContextType.STRING_INTERPOLATED_EXPRESSION;
        localCtx.quasis = quasis;
        localCtx.expressions = this.preprocessChildren(expressions, ContextType.STRING_INTERPOLATED_EXPRESSION, localCtx);
    }

    generate(localCtx, parentCtx) {
        const expressions = this.generateChildren(localCtx.expressions, localCtx);

        let quasis = localCtx.quasis;

        let returnArgument;

        if (expressions.length == 1 && !quasis.some(e => e.trim().length > 0)) {
            returnArgument = expressions[0];
        } else if (expressions.length == 0) {
            const value = quasis
                .map(e => {
                    if (e.type) {
                        if (e.type === "Literal") {
                            return e.value;
                        } else if (e.type === "Identifier") {
                            return e.name;
                        } else {
                            return e; // TODO: WUT?!
                        }
                    } else {
                        return e;
                    }
                })
                .join("");

            returnArgument = {
                type: "Literal",
                value
            };
        } else {
            quasis = quasis.map(e => ({
                type: "TemplateElement",
                value: {
                    raw: e
                }
            }));

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

        if (returnArgument.type === "Literal") {
            return returnArgument;
        }

        return this.wrapIfNeeded(needsWrapper, returnArgument, parentCtx);
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
        localCtx.type = ContextType.SWITCH_OPERATOR_EXPRESSION;
        localCtx.expression = this.preprocessChild(node.expression, ContextType.SWITCH_OPERATOR_EXPRESSION, localCtx);
        localCtx.clauses = this.preprocessChildren(node.clauses, ContextType.SWITCH_OPERATOR_CASE, localCtx);
    }

    generate(localCtx) {
        const reduceCaseExpressions = (switchExpression, caseExpressions) => {
            if (caseExpressions.length < 2) {
                const {body} = caseExpressions[0];

                if (Array.isArray(body)) {
                    return {
                        type: "ArrayExpression",
                        elements: this.generateChildren(body, localCtx)
                    };
                } else {
                    return this.generateChild(body, localCtx);
                }
            } else {
                const {body, caseValue} = caseExpressions[0];
                const alternate = reduceCaseExpressions(switchExpression, caseExpressions.slice(1));

                let consequent;

                if (Array.isArray(body)) {
                    consequent = {
                        type: "ReturnStatement",
                        argument: {
                            type: "ArrayExpression",
                            elements: this.generateChildren(body, localCtx)
                        }
                    };
                } else {
                    consequent = {
                        type: "ReturnStatement",
                        argument: this.generateChild(body, localCtx)
                    };
                }

                return {
                    type: "IfStatement",
                    test: {
                        type: "BinaryExpression",
                        operator: "===",
                        left: this.generateChild(switchExpression, localCtx),
                        right: this.generateChild(caseValue, localCtx)
                    },
                    consequent,
                    alternate
                };
            }
        };

        return reduceCaseExpressions(localCtx.expression, localCtx.clauses);
    }
}

class CaseExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.caseValue = this.preprocessChild(node.test, ContextType.SWITCH_OPERATOR_CASE_TEST, localCtx);
        localCtx.body = this.preprocessChildren(node.body, ContextType.SWITCH_OPERATOR_CASE_BODY, localCtx);
    }

    generate(localCtx) {
        // TODO: implement
        return null;
    }
}

class CallExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.type = ContextType.CALL_EXPRESSION;
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
            // ContextType.CONDITIONAL_EXPRESSION_BODY,
            ContextType.FOREACH_BODY,
            ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
            ContextType.HTML_ELEMENT_CHILD,
            // ContextType.PROPERTY_VALUE,
            // ContextType.VARIABLE_REFERENCE,
            // ContextType.SWITCH_OPERATOR_CASE_BODY,
            ContextType.TEMPLATE_ELEMENT,
        ];

        return this.wrapIfNeeded(needsWrapper, callExpr, parentCtx);
    }
}

class ForeachOperatorVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.iterator = node.iterator;

        localCtx.range = this.preprocessChild(node.range, ContextType.FOREACH_RANGE, localCtx);
        localCtx.body = this.preprocessChildren(node.body, ContextType.FOREACH_BODY, localCtx);
    }

    generate(localCtx, parentCtx) {
        let body = this.generateChildren(localCtx.body, localCtx);

        if (body.length > 1) { // || body.some(e => e.type && e.type === "JSXElement")) {
            body = {
                type: "ArrayExpression",
                elements: body
            };
        } else if (body.length == 1) {
            body = body[0];
        } else {
            body = {
                type: "Literal",
                value: null
            };
        }

        const range = this.generateChild(localCtx.range, localCtx);
        const iterator = this.generateChild(localCtx.iterator, localCtx);

        const foreachExpr = {
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

        if (parentCtx.type === ContextType.TEMPLATE) {
            return {
                type: "ExpressionStatement",
                expression: foreachExpr
            };
        } else {
            const needsWrapper = [
                ContextType.HTML_ELEMENT_CHILD,
                ContextType.TEMPLATE_ELEMENT,
                ContextType.FOREACH_BODY,
            ];

            return this.wrapIfNeeded(needsWrapper, foreachExpr, parentCtx);
        }
    }
}

class ObjectExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.properties = this.preprocessChildren(node.properties, ContextType.OBJECT_EXPRESSION_PROPERTY, localCtx);
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
        localCtx.key = this.preprocessChild(node.key, ContextType.PROPERTY_KEY, localCtx);
        localCtx.value = Array.isArray(node.value) ?
            this.preprocessChildren(node.value, ContextType.PROPERTY_VALUE, localCtx) :
            this.preprocessChild(node.value, ContextType.PROPERTY_VALUE, localCtx);

        localCtx.computed = node.key.type !== "Identifier" && node.key.type !== "Literal";
    }

    generate(localCtx) {
        return {
            type: "Property",
            key: this.generateChild(localCtx.key, localCtx),
            value: this.generateChild(localCtx.value, localCtx),
            kind: "init",
            computed: localCtx.computed
        };
    }
}

class BinaryExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        const binaryOperatorsMapping = {
            'and': '&&',
            'or': '||',
        };

        localCtx.operator = binaryOperatorsMapping[node.operator] || node.operator;

        localCtx.left = this.preprocessChild(node.left, ContextType.BINARY_OPERATOR_ARGUMENT, localCtx);
        localCtx.right = this.preprocessChild(node.right, ContextType.BINARY_OPERATOR_ARGUMENT, localCtx);
    }

    generate(localCtx) {
        let { operator, left, right } = localCtx;

        let type = "BinaryExpression";

        if (operator == '&&' || operator == '||') {
            type = "LogicalExpression";
        }

        left = this.generateChild(left, localCtx);
        right = this.generateChild(right, localCtx);

        return {
            type,
            operator,
            left,
            right
        };
    }
}

class LogicalExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        const binaryOperatorsMapping = {
            'and': '&&',
            'or': '||',
        };

        localCtx.operator = binaryOperatorsMapping[node.operator] || node.operator;

        localCtx.left = this.preprocessChild(node.left, ContextType.BINARY_OPERATOR_ARGUMENT, localCtx);
        localCtx.right = this.preprocessChild(node.right, ContextType.BINARY_OPERATOR_ARGUMENT, localCtx);
    }

    generate(localCtx) {
        let { operator, left, right } = localCtx;

        let type = "BinaryExpression";

        if (operator == '&&' || operator == '||') {
            type = "LogicalExpression";
        }

        left = this.generateChild(left, localCtx);
        right = this.generateChild(right, localCtx);

        return {
            type,
            operator,
            left,
            right
        };
    }
}

class UnaryExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        const unaryOperatorsMapping = {
            'not': '!'
        };

        localCtx.operator = unaryOperatorsMapping[node.operator] || node.operator;
        localCtx.argument = this.preprocessChild(node.argument, ContextType.UNARY_OPERATOR_ARGUMENT, localCtx);
        localCtx.prefix = node.prefix;
    }

    generate(localCtx) {
        let { operator, argument, prefix } = localCtx;

        argument = this.generateChild(argument, localCtx);

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
            } else {
                name = name.map(e => e.type ? this.preprocessChild(e, ContextType.GENERATED_ATTRIBUTE_NAME, localCtx) : e);
            }
        }

        let generatorCtx = localCtx.findParent(ContextType.GENERATED_ATTRIBUTE);

        if (generatorCtx) {
            generatorCtx = generatorCtx.parent;

            localCtx.attributesVarName = generatorCtx.attributesVarName;
        }

        localCtx.type = ContextType.GENERATED_ATTRIBUTE;
        localCtx.name = name;
        localCtx.value = this.preprocessChild(node.value, ContextType.GENERATED_ATTRIBUTE_VALUE, localCtx);
    }

    generate(localCtx, parentCtx) {
        let { name, value } = localCtx;

        value = this.generateChild(value, localCtx);
        value = this.simplifyListExpression(value);

        if (localCtx.attributesVarName) {
            if (!name.type) {
                if (Array.isArray(name)) {
                    name = this.generateChildren(name, localCtx);
                    name = this.createTemplateLiteralFromExpressions(name);
                } else {
                    name = {
                        type: "Literal",
                        value: "" + name
                    };
                }
            }

            const reference = {
                type: "MemberExpression",
                object: this.generateChild(localCtx.attributesVarName, localCtx),
                property: name,
                computed: name.type !== "Identifier"
            };

            return {
                type: "ExpressionStatement",
                expression: {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: this.generateChild(reference, localCtx),
                    right: this.generateChild(value, localCtx)
                }
            };
        } else {
            if (Array.isArray(name)) {
                if (name.length == 1) {
                    name = name[0];
                } else if (name.length > 1) {
                    name = this.createTemplateLiteralFromExpressions(name);
                }
            }

            if (value.type !== "Literal") {
                value = {
                    type: "JSXExpressionContainer",
                    expression: value
                };
            }

            return {
                type: "JSXAttribute",
                name,
                value
            };
        }
    }
}

class ConditionalExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        if (parentCtx.type === ContextType.TEMPLATE) {
            localCtx.type = ContextType.IF_STATEMENT_BODY;
        } else if (localCtx.type == ContextType.GENERATED_ATTRIBUTE) {
        } else {
            localCtx.type = ContextType.CONDITIONAL_EXPRESSION_BODY;
        }

        let {test, consequent, alternate} = node;

        consequent = Array.isArray(consequent) ? consequent : [consequent];
        alternate = Array.isArray(alternate) ? alternate : [alternate];

        localCtx.test = this.preprocessChild(test, ContextType.CONDITIONAL_EXPRESSION_EXPRESSION, localCtx);
        localCtx.consequent = this.preprocessChildren(consequent, ContextType.CONDITIONAL_EXPRESSION_BRANCH, localCtx);
        localCtx.alternate = this.preprocessChildren(alternate, ContextType.CONDITIONAL_EXPRESSION_BRANCH, localCtx);
    }

    generate(localCtx, parentCtx) {
        let { test, consequent, alternate } = localCtx;

        const recursiveReduce = (clauses) => {
            if (clauses && clauses.length < 2) {
                if (!clauses[0] || !clauses[0].type) {
                    return { type: "Literal", value: null };
                }

                if (clauses[0].type === "ConditionalExpression" || clauses[0].type === "ConditionalBranch") {
                    return clauses[0].body || { type: "Literal", value: null };
                } else {
                    return clauses[0];
                }
            } else {
                if (!clauses.some(c => c.type === "ConditionalExpression" && c.type === "ConditionalBranch")) {
                    return {
                        type: "ArrayExpression",
                        elements: clauses
                    };
                }

                return {
                    type: "ConditionalExpression",
                    test: clauses[0].test,
                    consequent: this.simplifyListExpression(clauses[0].body),
                    alternate: recursiveReduce(clauses.slice(1))
                };
            }
        };

        test = this.generateChild(test, localCtx);
        consequent = flatten(this.generateChildren(consequent, localCtx));
        alternate = flatten(this.generateChildren(alternate, localCtx));

        let type = "ConditionalExpression";

        if (parentCtx.type === ContextType.TEMPLATE) {
            type = "IfStatement";

            if (!alternate || (Array.isArray(alternate) && alternate.length < 1)) {
                alternate = null;
            } else {
                alternate = recursiveReduce(alternate);
            }
        } else {
            alternate = recursiveReduce(alternate);
        }

        consequent = this.simplifyListExpression(consequent);
        alternate = this.simplifyListExpression(alternate);

        const condExpr = {
            type,
            test,
            consequent,
            alternate
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
        localCtx.type = ContextType.VARIABLE_DECLARATION;

        localCtx.name = node.name;

        const value = Array.isArray(node.value) ?
            this.preprocessChildren(node.value, ContextType.VARIABLE_DECLARATION, localCtx) :
            this.preprocessChild(node.value, ContextType.VARIABLE_DECLARATION, localCtx);

        localCtx.value = value;

        const templateCtx = localCtx.findParent(ContextType.TEMPLATE);

        templateCtx.addPropertyElement('variableDeclarations', localCtx);;
    }

    generate(localCtx) {
        const id = this.generateChild(localCtx.name, localCtx);

        let init = Array.isArray(localCtx.value) ?
            this.generateChildren(localCtx.value, localCtx) :
            this.generateChild(localCtx.value, localCtx);

        init = this.simplifyListExpression(init);

        return {
            type: "VariableDeclaration",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id,
                    init
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

        const expressions = Array.isArray(node.expression) ? node.expression : [ node.expression ];

        localCtx.expressions = this.preprocessChildren(expressions, ContextType.INTERPOLATED_EXPRESSION_EXPRESSION, localCtx);
        localCtx.filters = this.preprocessChildren(node.expression.filters, ContextType.FILTER, localCtx);
    }

    generate(localCtx, parentCtx) {
        let expressions = this.generateChildren(localCtx.expressions, localCtx);

        if (expressions.length > 1) {
            expressions = {
                type: "ArrayExpression",
                elements: expressions
            };
        } else {
            expressions = expressions[0];
        }

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

        expressions = recursiveApplyFilters(filters, expressions);

        const needsWrapper = [
            ContextType.TEMPLATE_ELEMENT,
            ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
            ContextType.HTML_ELEMENT_ATTRIBUTE,
            ContextType.HTML_ELEMENT_CHILD,
            // ContextType.STRING_INTERPOLATED_EXPRESSION_EXPRESSION,
        ];

        return this.wrapIfNeeded(needsWrapper, expressions, localCtx);
    }
}

class VariableInterpolationVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.variable = this.preprocessChild(node.variable, ContextType.VARIABLE_REFERENCE, localCtx);
    }

    generate(localCtx, parentCtx) {
        const referenceExpr = this.generateChild(localCtx.variable, localCtx);

        const needsWrapper = [
            ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
            ContextType.HTML_ELEMENT_ATTRIBUTE,
        ];

        return this.wrapIfNeeded(needsWrapper, referenceExpr, localCtx);
    }
}

class TemplateCallVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        if (!Array.isArray(node.params)) {
            node.params = [node.params];
        }

        const templateName = node.template;

        if (!templateName.object) {
            const namespaceCtx = localCtx.findParent(ContextType.NAMESPACE);

            templateName.object = namespaceCtx.name;
        }

        localCtx.template = this.preprocessChild(templateName, ContextType.TEMPLATE_NAME, localCtx);
        localCtx.params = this.preprocessChildren(node.params, ContextType.TEMPLATE_CALL_ARGUMENT, localCtx);
    }

    generate(localCtx, parentCtx) {
        const callee = this.generateChild(localCtx.template, localCtx);
        const args = this.generateChildren(localCtx.params, localCtx);

        const memberExpressionToJSXMemberExpression = (ctx) => {
            if (ctx.type === "MemberExpression") {
                return {
                    type: "JSXMemberExpression",
                    object: memberExpressionToJSXMemberExpression(ctx.object),
                    property: ctx.property
                };
            } else {
                return ctx;
            }
        };

        const callExpr = {
            type: "JSXElement",
            openingElement: {
                type: "JSXOpeningElement",
                name: memberExpressionToJSXMemberExpression(callee),
                attributes: [
                    {
                        type: "JSXSpreadAttribute",
                        argument: {
                            type: "ObjectExpression",
                            properties: args
                        }
                    }
                ],
                selfClosing: true
            },
            closingElement: null,
            children: []
        };

        // if (parentCtx.type === ContextType.TEMPLATE) {
        //     return {
        //         type: "ExpressionStatement",
        //         expression: callExpr
        //     };
        // } else {
            const needsWrapper = [
                // ContextType.TEMPLATE_ELEMENT,
                ContextType.HTML_ELEMENT_CHILD,
                ContextType.HTML_ELEMENT_ATTRIBUTE_VALUE,
            ];

            return this.wrapIfNeeded(needsWrapper, callExpr, parentCtx);
        // }
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
        localCtx.children = this.preprocessChildren(node.children, ContextType.HTML_ELEMENT_CHILD, localCtx);

        const generatedAttributes = node.attributes.filter(e => e.type !== "GeneratedAttribute");
        const staticAttributes = node.attributes.filter(e => e.type === "GeneratedAttribute");

        if (generatedAttributes.length > 0) {
            const templateCtx = localCtx.findParent(ContextType.TEMPLATE);

            if (!templateCtx.attributeVars) {
                templateCtx.attributeVars = [];
            }

            let attributesVarName = {
                type: "Identifier",
                name: `__attributes${templateCtx.attributeVars.length + 1}`
            };

            attributesVarName = this.preprocessChild(attributesVarName, ContextType.VARIABLE_DECLARATION, localCtx);

            localCtx.attributesVarName = attributesVarName;

            templateCtx.addPropertyElement('attributeVars', attributesVarName);

            const attributesVarValue = {
                type: "ObjectExpression",
                properties: []
            };

            let attributesVarDeclaration = {
                type: "VariableDeclaration",
                name: attributesVarName,
                value: attributesVarValue
            };

            attributesVarDeclaration = this.preprocessChild(attributesVarDeclaration, ContextType.VARIABLE_DECLARATION, localCtx);

            const staticAttribtuesAssignments = staticAttributes.map(attr => {
                let nameParts = {
                    type: "SoyCapableString",
                    body: attr.name
                };

                nameParts = this.preprocessChild(nameParts, ContextType.GENERATED_ATTRIBUTE_NAME, localCtx);

                const value = this.preprocessChild(attr.value, ContextType.GENERATED_ATTRIBUTE_VALUE, localCtx);

                let attributeProperty = {
                    type: "MemberExpression",
                    object: attributesVarName,
                    properties: [nameParts]
                };

                attributeProperty = this.preprocessChild(attributeProperty, ContextType.ASSIGNMENT_EXPRESSION_ARGUMENT, localCtx);

                return {
                    type: "AssignmentExpression",
                    left: attributeProperty,
                    right: value
                };
            });

            const staticAttributesVarAssignments = this.preprocessChildren(staticAttribtuesAssignments, ContextType.TEMPLATE_ELEMENT, localCtx);

            templateCtx.addPropertyElements('body', staticAttributesVarAssignments);

            const bodyElements = this.preprocessChildren(generatedAttributes, ContextType.GENERATED_ATTRIBUTE, localCtx);

            templateCtx.addPropertyElements('body', bodyElements);

            const attributesVarReference = {
                type: "AttributesObject",
                variable: attributesVarName
            };

            localCtx.attributes = this.preprocessChildren([attributesVarReference], ContextType.HTML_ELEMENT_ATTRIBUTE, localCtx);
        } else {
            localCtx.attributes = this.preprocessChildren(node.attributes, ContextType.HTML_ELEMENT_ATTRIBUTE, localCtx);
        }
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

class AttributesObjectVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.variable = node.variable;
    }

    generate(localCtx, parentCtx) {
        return {
            type: "JSXSpreadAttribute",
            argument: this.generateChild(localCtx.variable, localCtx)
        };
    }
}

class GeneratedElementVisitor extends HtmlElementVisitor {
    generate(localCtx) {
        let { tagName, attributes, children } = localCtx;

        attributes = this.generateChildren(attributes, localCtx);

        return {
            type: "JSXElement",
            openingElement: {
                type: "JSXOpeningElement",
                name: tagName,
                attributes: attributes,
                selfClosing: children.length < 1
            },
            closingElement: {
                type: "JSXClosingElement",
                name: tagName
            },
            children: children
        };
    }
}

class AssignmentExpressionVisitor extends Visitor {
    preprocess(node, localCtx, parentCtx) {
        localCtx.left = node.left; // this.preprocessChild(node.left, ContextType.ASSIGNMENT_EXPRESSION_ARGUMENT, localCtx);
        localCtx.right = node.right; // this.preprocessChild(node.right, ContextType.ASSIGNMENT_EXPRESSION_ARGUMENT, localCtx);
    }

    generate(localCtx, parentCtx) {
        return {
            type: "ExpressionStatement",
            expression: {
                type: "AssignmentExpression",
                operator: "=",
                left: this.generateChild(localCtx.left, localCtx),
                right: this.generateChild(localCtx.right, localCtx)
            }
        };
    }
}

class Generator {
    constructor() { }

    generateJSX(ast) {
        const ctx = new Context(ContextType.SOY_FILE);
        const visitor = Visitor.find('SoyFile');

        visitor.preprocess(ast, ctx);
        return visitor.generate(ctx, null);
    }
}

Visitor.register('SoyFile', new SoyFileVisitor());
Visitor.register('Namespace', new NamespaceVisitor());
Visitor.register('Template', new TemplateVisitor());
Visitor.register('MemberExpression', new MemberExpressionVisitor());
Visitor.register('Literal', new LiteralVisitor());
Visitor.register('Comment', new CommentVisitor());
Visitor.register('CommentText', new CommentTextVisitor());
Visitor.register('TemplateParam', new TemplateParamVisitor());
Visitor.register('Identifier', new IdentifierVisitor());
Visitor.register('Filter', new FilterVisitor());
Visitor.register('SoyCapableString', new SoyCapableStringVisitor());
Visitor.register('RawText', new RawTextVisitor());
Visitor.register('SwitchOperator', new SwitchOperatorVisitor());
Visitor.register('CaseExpression', new CaseExpressionVisitor());
Visitor.register('ForeachOperator', new ForeachOperatorVisitor());
Visitor.register('LogicalExpression', new LogicalExpressionVisitor());
Visitor.register('CallExpression', new CallExpressionVisitor());
Visitor.register('ObjectExpression', new ObjectExpressionVisitor());
Visitor.register('Property', new PropertyVisitor());
Visitor.register('BinaryExpression', new BinaryExpressionVisitor());
Visitor.register('UnaryExpression', new UnaryExpressionVisitor());
Visitor.register('GeneratedAttribute', new GeneratedAttributeVisitor());
Visitor.register('IfStatement', new IfStatementVisitor());
Visitor.register('ConditionalExpression', new ConditionalExpressionVisitor());
Visitor.register('VariableDeclaration', new VariableDeclarationVisitor());
Visitor.register('InterpolatedExpression', new InterpolatedExpressionVisitor());
Visitor.register('VariableInterpolation', new VariableInterpolationVisitor());
Visitor.register('TemplateCall', new TemplateCallVisitor());
Visitor.register('TemplateCallParam', new TemplateCallParamVisitor());
Visitor.register('HtmlElement', new HtmlElementVisitor());
Visitor.register('Doctype', new DoctypeVisitor());
Visitor.register('GeneratedElement', new GeneratedElementVisitor());
Visitor.register('ConditionalBranch', new ConditionalBranchVisitor());
Visitor.register('AssignmentExpression', new AssignmentExpressionVisitor());
Visitor.register('AttributesObject', new AttributesObjectVisitor());

module.exports.generate = (ast) => new Generator().generateJSX(ast);
