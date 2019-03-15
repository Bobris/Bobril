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
            ref?: b.RefType;
            children?: b.IBobrilChildren;
        }

        interface IntrinsicClassAttributes<T> {
            key?: string;
            ref?: b.RefType;
        }

        interface IntrinsicElements {
            [name: string]: any;
        }
    }
}
