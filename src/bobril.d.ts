declare var b: IBobrilStatic;

interface IBobrilStatic {
    createNode(n: IBobrilNode): IBobrilCacheNode;
    updateNode(n: IBobrilNode, c: IBobrilCacheNode): IBobrilCacheNode;
    /** factory returns string|number|boolean|IBobrilNode|(string|number|boolean|IBobrilNode)[] */
    init(factory: () => any): void;
    uptime(): number;
    now(): number;
    invalidate(): void;
}

interface IBobrilAttributes {
    id?: string;
    href?: string;
    className?: string;
    style?: Object;
    [name: string]: any;
}

interface IBobrilComponent {
    // Called before new node in vdom should be created any me members except key could be modified
    init? (ctx: Object, me: IBobrilNode): void;
    // return false when whole subtree should not be changed from last time, you can still update any me members except key
    shouldChange? (ctx: Object, me: IBobrilNode, oldMe: IBobrilNode): boolean;
    // called from children to parents order for new nodes
    postInitDom? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
    // called from children to parents order for updated nodes
    postUpdateDom? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
    // called just before removing node from dom
    destroy? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
    // called on input element after any change with new value
    onInput? (ctx: Object, value: string): void;
    // called on keydown, return false if you didn't processed key so parrent could process it
    onKeyDown? (ctx: Object, key: number): boolean;
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
}

interface IBobrilCacheNode extends IBobrilNode {
    /** HTMLNode | HTMLNode[] */
    element?: any;
    componentInstance?: Object;
}
