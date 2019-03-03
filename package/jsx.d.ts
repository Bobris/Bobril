import * as b from "./index";

declare global {
    namespace JSX {
        type Element<T = any> = b.IBobrilNode<T>;

        interface ElementAttributesProperty {
            data: {};
        }
        interface ElementChildrenAttribute {
            children: {};
        }

        interface IntrinsicAttributes {
            key?: string;
            ref?: string | [b.IBobrilCtx, string] | ((node: b.IBobrilCacheNode) => void);
            children?: b.IBobrilChildren;
        }

        interface IntrinsicClassAttributes<T> {
            key?: string;
            ref?: string | [b.IBobrilCtx, string] | ((node: b.IBobrilCacheNode) => void);
        }

        interface IntrinsicElements {
            [name: string]: any;
        }
    }
}
