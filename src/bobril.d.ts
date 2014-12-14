declare var b: IBobrilStatic;

interface IBobrilStatic {
    // Low level method used just for testing
    createNode(n: IBobrilNode, parentNode: IBobrilNode): IBobrilCacheNode;
    // Low level method used just for testing
    updateNode(n: IBobrilNode, c: IBobrilCacheNode): IBobrilCacheNode;
    // Low level method used just for testing
    updateChildren(element: HTMLElement, newChildren: any, cachedChildren: any, parentNode: IBobrilNode): Array<IBobrilCacheNode>;
    // Low level method used just for testing
    callPostCallbacks(): void;
    // Set update DOM attribute value callback, returns previous callback to allow chaining
    setSetValue(callback: (el: Element, node: IBobrilNode, newValue: any, oldValue: any) => void): (el: Element, node: IBobrilNode, newValue: any, oldValue: any) => void;
    // factory returns string|boolean|IBobrilNode|(string|boolean|IBobrilNode)[]
    init(factory: () => any): void;
    // recreate whole vdom in next frame, next invalidates before next frame are noop
    invalidate(): void;
    // shim for [].isArray
    isArray(a: any): boolean;
    // time in miliseconds from start
    uptime(): number;
    // shim for Date.now()
    now(): number;
    // returns IE version 8 - 11, for other browsers returns undefined
    ieVersion(): number;
    // shalows copy all own members from source to target returns target, source could be null, target must be non-null 
    assign(target: Object, source: Object): Object;
    // shim for Event.preventDefault()
    preventDefault(event: Event): void;
    // this could be called only from component init and forces recreation of child nodes
    vmlNode(): void;
    // DOM to vdom stack resolver
    vdomPath(n: Node): IBobrilCacheNode[];
    // DOM to vdom leaf resolver
    deref(n: Node): IBobrilCacheNode;
    // adds native event to window or body
    addEvent(name: string, priority: number, callback: (ev: Event, target: Node, node: IBobrilCacheNode) => boolean): void;
    bubble(node: IBobrilCacheNode, name: string, param: any): boolean;
    // merge components, methods will be called before already existing methods
    preEnhance(node: IBobrilNode, methods: IBobrilComponent): void;
    // merge components, methods will be called after already existing methods
    postEnhance(node: IBobrilNode, methods: IBobrilComponent): void;
}

interface IBobrilAttributes {
    id?: string;
    href?: string;
    className?: string;
    style?: any;
    // boolean | string
    value?: any;
    [name: string]: any;
}

interface IBobrilComponent {
    // called before new node in vdom should be created, me members (tag, attrs, children) could be modified, ctx is initialized to { data: me.data||{} }
    init? (ctx: Object, me: IBobrilNode): void;
    // in case of update after shouldChange returns true, you can do any update/init tasks, ctx.data is updated to me.data and oldMe.component updated to me.component before calling this
    // in case of init this is called after init method, oldMe is equal to undefined in that case
    render? (ctx: Object, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
    // called after all children are rendered, but before updating own attrs
    // so this is useful for kind of layout in JS features
    postRender? (ctx: Object, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
    // return false when whole subtree should not be changed from last time, you can still update any me members except key, default implementation always return true
    shouldChange? (ctx: Object, me: IBobrilNode, oldMe: IBobrilCacheNode): boolean;
    // called from children to parents order for new nodes
    postInitDom? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
    // called from children to parents order for updated nodes
    postUpdateDom? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
    // called just before removing node from dom
    destroy? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
}

// new node should atleast have tag or component member
interface IBobrilNode {
    tag?: string;
    key?: string;
    attrs?: IBobrilAttributes;
    /** string|boolean|IBobrilNode|(string|boolean|IBobrilNode)[] */
    children?: any;
    component?: IBobrilComponent;
    // Bobril does not touch this, it is completely for user passing custom data to component
    // It is very similar to props in ReactJs
    data?: any;
}

interface IBobrilCacheNode extends IBobrilNode {
    /** HTMLNode | HTMLNode[] */
    element?: any;
    parent?: IBobrilNode;
    ctx?: Object;
}
