/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.helpers.d.ts"/>

!function(b: IBobrilStatic) {

function withKey(node: IBobrilNode, key: string): IBobrilNode {
    node.key = key;
    return node;
}

function styledDiv(children: IBobrilChildren, ...styles: any[]): IBobrilNode {
    return b.style({ tag: 'div', children }, styles);
}

function createVirtualComponent<TData>(component: IBobrilComponent): (data?: TData, children?: IBobrilChildren) => IBobrilNode {
    return (data?: TData, children?: IBobrilChildren): IBobrilNode => {
        if (children !== undefined) {
            if (data == null) data = <any>{};
            (<any>data).children = children;
        }
        return { data, component: component };
    };
}

function createComponent<TData>(component: IBobrilComponent): (data?: TData, children?: IBobrilChildren) => IBobrilNode {
    const originalRender = component.render;
    if (originalRender) {
        component.render = function(ctx: any, me: IBobrilNode, oldMe?: IBobrilCacheNode) {
            me.tag = 'div';
            return originalRender.call(component, ctx, me, oldMe);
        }
    } else {
        component.render = (ctx: any, me: IBobrilNode) => { me.tag = 'div'; };
    }
    return createVirtualComponent<TData>(component);
}

function createDerivedComponent<TData>(original: (data?: any, children?: IBobrilChildren) => IBobrilNode, after: IBobrilComponent): (data?: TData, children?: IBobrilChildren) => IBobrilNode {
    const originalComponent = original().component;
    const merged = b.mergeComponents(originalComponent, after);
    return createVirtualComponent<TData>(merged);
}

const emptyObject = {};

function overrideComponents(originalComponent: IBobrilComponent, overridingComponent: IBobrilComponent) {
    let res: IBobrilComponent = Object.create(originalComponent);
    res.super = originalComponent;
    for (let i in overridingComponent) {
        if (!(i in <any>emptyObject)) {
            let m = (<any>overridingComponent)[i];
            let origM = (<any>originalComponent)[i];
            if (i === 'id') {
                (<any>res)[i] = ((origM != null) ? origM : '') + '/' + m;
            } else {
                (<any>res)[i] = m;
            }
        }
    }
    return res;
}   

function createOverridingComponent<TData>(
    original: (data?: any, children?: IBobrilChildren) => IBobrilNode, after: IBobrilComponent
): (data?: TData, children?: IBobrilChildren) => IBobrilNode {
    const originalComponent = original().component;
    const overriding = overrideComponents(originalComponent, after);
    return createVirtualComponent<TData>(overriding);
}


b.withKey = withKey;
b.styledDiv = styledDiv;
b.createVirtualComponent = createVirtualComponent;
b.createComponent = createComponent;
b.createDerivedComponent = createDerivedComponent;
b.createOverridingComponent = createOverridingComponent;

}(b);
