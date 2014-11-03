declare var b: IBobrilStatic;

interface IBobrilStatic {
    // Low level method used just for testing
    createNode(n: IBobrilNode): IBobrilCacheNode;
    // Low level method used just for testing
    updateNode(n: IBobrilNode, c: IBobrilCacheNode): IBobrilCacheNode;
    // Low level method used just for testing
    updateChildren(element: HTMLElement, newChildren: any, cachedChildren: any): Array<IBobrilCacheNode>;
    // Low level method used just for testing
    callPostCallbacks():void;
    /** factory returns string|number|boolean|IBobrilNode|(string|number|boolean|IBobrilNode)[] */
    init(factory: () => any): void;
    isArray(a: any): boolean;
    uptime(): number;
    now(): number;
    invalidate(): void;
    vmlNode(): void;
    deref(n: Node): IBobrilCacheNode;
    addEvent(name: string, priority: number, callback: (ev: Event, target: Node, node: IBobrilCacheNode) => boolean): void;
    bubble(node: IBobrilCacheNode, name: string, param: any): boolean;
    postEnhance(node: IBobrilNode, methods: IBobrilComponent): void;
}

interface IBobrilAttributes {
    id?: string;
    href?: string;
    className?: string;
    style?: Object;
    value?: string;
    [name: string]: any;
}

interface IBobrilComponent {
    // usefull to speed up merge component operations if set must be globally unique
    id?: string;
    // called before new node in vdom should be created any me members except key could be modified, ctx is initialized to { data: me.data||{} }
    // or after shouldChange returns true, you can do any update/init tasks, ctx.data is updated to me.data and oldMe.component update to me.component before calling this
    // usually just do always init and ignore oldMe parameter
    init? (ctx: Object, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
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
    /** string|number|boolean */
    content?: any;
    attrs?: IBobrilAttributes;
    /** string|number|boolean|IBobrilNode|(string|number|boolean|IBobrilNode)[] */
    children?: any;
    component?: IBobrilComponent;
    // Bobril does not touch this, it is completely for user passing custom data to component
    data?: any;
}

interface IBobrilCacheNode extends IBobrilNode {
    /** HTMLNode | HTMLNode[] */
    element?: any;
    ctx?: Object;
}
