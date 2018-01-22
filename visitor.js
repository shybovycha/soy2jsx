class Visitor {
    constructor() { }

    preprocess(node, localContext, parentContext) { }

    preprocessChild(node, childrenContextType, parentContext) {
        if (!node)
            return null;

        if (node.__visitor)
            return node;

        const visitor = Visitor.find(node.type);
        const nodeContext = parentContext.createContext(childrenContextType);

        nodeContext.__visitor = visitor;

        if (!(visitor instanceof Visitor)) {
            console.error('can not find visitor for', node);
        }

        visitor.preprocess(node, nodeContext, parentContext);

        return nodeContext;
    }

    preprocessChildren(children, childrenContextType, parentContext) {
        if (!children) {
            return [];
        }

        if (!Array.isArray(children)) {
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
        if (needsWrapper.some(e => e === parentCtx.type)) {
            return {
                type: "JSXExpressionContainer",
                expression: expr
            };
        }

        return expr;
    }

    createTemplateLiteralFromExpressions(args) {
        let quasis = [];
        let expressions = [];

        args.forEach((arg) => {
            if (arg.type) {
                quasis.push("");
                expressions.push(arg);
            } else {
                quasis.push(arg);
            }
        });

        quasis = quasis.map(e => ({ type: "TemplateElement", value: { raw: e } }));

        return {
            type: "TemplateLiteral",
            quasis,
            expressions
        };
    }

    static find(nodeType) {
        return Visitor.visitors[nodeType];
    }

    static register(contextType, visitor) {
        Visitor.visitors[contextType] = visitor;
    }
}

Visitor.visitors = {};

module.exports = { Visitor };
