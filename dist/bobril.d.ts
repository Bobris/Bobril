declare var b: IBobrilStatic;

declare type IBobrilChild = boolean|string|IBobrilNode;
declare type IBobrilChildren = IBobrilChild|IBobrilChild[];

interface IBobrilStatic {
    // Low level method used just for testing
    createNode(n: IBobrilNode, parentNode: IBobrilNode): IBobrilCacheNode;
    // Low level method used just for testing
    updateNode(n: IBobrilNode, c: IBobrilCacheNode): IBobrilCacheNode;
    // Low level method used just for testing
    updateChildren(element: HTMLElement, newChildren: IBobrilChildren, cachedChildren: IBobrilChildren, parentNode: IBobrilNode): IBobrilCacheNode[];
    // Low level method used just for testing
    callPostCallbacks(): void;
    // Set update DOM attribute value callback, returns previous callback to allow chaining
    setSetValue(callback: (el: Element, node: IBobrilNode, newValue: any, oldValue: any) => void): (el: Element, node: IBobrilNode, newValue: any, oldValue: any) => void;
    // Set update DOM attribute style callback by object, returns previous callback to allow chaining
    setSetStyle(callback: (newValue: any) => void): (newValue: any) => void;
    // main function to specify factory function to update html body
    init(factory: () => IBobrilChildren): void;
    // Set callback after frame is done, returns previous callback to allow chaining
    setAfterFrame(callback: (root: IBobrilCacheNode[]) => void): (root: IBobrilCacheNode[]) => void;
    // recreate whole vdom in next frame, next invalidates before next frame are noop
    // you can pass just some ctx of some component and only that instance and its children will be rerendered
    invalidate(ctx?:Object): void;
    // shim for [].isArray
    isArray(a: any): boolean;
    // time in miliseconds from start
    uptime(): number;
    // shim for Date.now()
    now(): number;
    // returns actual number of redraws (partial or full)
    frame(): number;
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
    // adds native event to window or body, if name starts with '!' it is not native but internal event which could be emited by code by emitEvent function
    addEvent(name: string, priority: number, callback: (ev: any, target: Node, node: IBobrilCacheNode) => boolean): void;
    // emit internal event it should start with '!'
    emitEvent(name: string, ev: any, target: Node, node: IBobrilCacheNode): boolean;
    // bubble component event, returning true from event stops bubbling and returns true
    bubble(node: IBobrilCacheNode, name: string, param: any): boolean;
    // merge components, methods will be called before already existing methods
    preEnhance(node: IBobrilNode, methods: IBobrilComponent): void;
    // merge components, methods will be called after already existing methods
    postEnhance(node: IBobrilNode, methods: IBobrilComponent): void;
    // clone IBobrilNode with attrs and attrs.style cloned deeply
    cloneNode(node: IBobrilNode): IBobrilNode;
}

interface IBobrilAttributes {
    id?: string;
    href?: string;
    value?: boolean|string|string[];
    [name: string]: any;
}

interface IBobrilComponent {
    // if id of old node is different from new node it is considered completely different so init will be called before render directly
    // it does prevent calling render method twice on same node
    id?: string;
    // called before new node in vdom should be created, me members (tag, attrs, children) could be modified, ctx is initialized to { data: me.data||{}, me: me }
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
    // called when bubling event to parent so you could stop bubling without preventing default handling
    shouldStopBubble? (ctx: Object, name:string, param: Object): boolean;
}

// new node should atleast have tag or component member
interface IBobrilNode {
    tag?: string;
    key?: string;
    className?: string;
    style?: any;
    attrs?: IBobrilAttributes;
    children?: IBobrilChildren;
    component?: IBobrilComponent;
    // Bobril does not touch this, it is completely for user passing custom data to component
    // It is very similar to props in ReactJs, it must be immutable, you have access to this through ctx.data
    data?: any;
}

interface IBobrilCacheNode extends IBobrilNode {
    element?: Node|Node[];
    parent?: IBobrilNode;
    // context which is something like state in React expect data member which is like props in React and me member which points back to IBobrilCacheNode
    ctx?: Object;
}
