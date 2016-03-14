/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.helpers.d.ts"/>
!function (b) {
    function withKey(node, key) {
        node.key = key;
        return node;
    }
    function styledDiv(children) {
        var styles = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            styles[_i - 1] = arguments[_i];
        }
        return b.style({ tag: 'div', children: children }, styles);
    }
    function createVirtualComponent(component) {
        return function (data, children) {
            if (children !== undefined) {
                if (data == null)
                    data = {};
                data.children = children;
            }
            return { data: data, component: component };
        };
    }
    function createComponent(component) {
        var originalRender = component.render;
        if (originalRender) {
            component.render = function (ctx, me, oldMe) {
                me.tag = 'div';
                return originalRender.call(component, ctx, me, oldMe);
            };
        }
        else {
            component.render = function (ctx, me) { me.tag = 'div'; };
        }
        return createVirtualComponent(component);
    }
    function createDerivedComponent(original, after) {
        var originalComponent = original().component;
        var merged = b.mergeComponents(originalComponent, after);
        return createVirtualComponent(merged);
    }
    var emptyObject = {};
    function overrideComponents(originalComponent, overridingComponent) {
        var res = Object.create(originalComponent);
        res.super = originalComponent;
        for (var i in overridingComponent) {
            if (!(i in emptyObject)) {
                var m = overridingComponent[i];
                var origM = originalComponent[i];
                if (i === 'id') {
                    res[i] = ((origM != null) ? origM : '') + '/' + m;
                }
                else {
                    res[i] = m;
                }
            }
        }
        return res;
    }
    function createOverridingComponent(original, after) {
        var originalComponent = original().component;
        var overriding = overrideComponents(originalComponent, after);
        return createVirtualComponent(overriding);
    }
    b.withKey = withKey;
    b.styledDiv = styledDiv;
    b.createVirtualComponent = createVirtualComponent;
    b.createComponent = createComponent;
    b.createDerivedComponent = createDerivedComponent;
    b.createOverridingComponent = createOverridingComponent;
}(b);
