declare namespace JSX {
    type IBobrilChild = boolean | string | IBobrilNode | null | undefined;
    type IBobrilChildren = IBobrilChild | IBobrilChildArray | null | undefined;
    interface IBobrilChildArray extends Array<IBobrilChildren> {
    }
    type IBobrilCacheChildren = string | IBobrilCacheNode[] | undefined;
    interface IBobrilAttributes {
        id?: string;
        href?: string;
        value?: boolean | string | string[];
        tabindex?: number;
        [name: string]: any;
    }
    interface IDisposable {
        dispose(): void;
    }
    type IDisposeFunction = (ctx?: any) => void;
    type IDisposableLike = IDisposable | IDisposeFunction;
    interface IBobrilCtx {
        data?: any;
        me: IBobrilCacheNode;
        cfg?: any;
        refs?: {
            [name: string]: IBobrilCacheNode | null;
        };
        disposables?: IDisposableLike[];
    }
    class BobrilCtx implements IBobrilCtx {
        constructor();
        $bobxCtx: object | undefined;
        data: any;
        me: IBobrilCacheNode;
        cfg?: any;
        refs?: {
            [name: string]: IBobrilCacheNode | null;
        };
        disposables?: IDisposableLike[];
    }
    type ICtxClass = {
        new (): BobrilCtx;
    };
    interface IBobrilComponent {
        id?: string;
        ctxClass?: ICtxClass;
        init?(ctx: IBobrilCtx, me: IBobrilCacheNode): void;
        render?(ctx: IBobrilCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
        postRender?(ctx: IBobrilCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
        shouldChange?(ctx: IBobrilCtx, me: IBobrilNode, oldMe: IBobrilCacheNode): boolean;
        postInitDom?(ctx: IBobrilCtx, me: IBobrilCacheNode, element: HTMLElement): void;
        postUpdateDom?(ctx: IBobrilCtx, me: IBobrilCacheNode, element: HTMLElement): void;
        destroy?(ctx: IBobrilCtx, me: IBobrilNode, element: HTMLElement): void;
        [name: string]: any;
    }
    interface IBobrilNodeCommon {
        tag?: string;
        key?: string;
        className?: string;
        style?: any;
        attrs?: IBobrilAttributes;
        children?: IBobrilChildren;
        ref?: [IBobrilCtx, string] | ((node: IBobrilCacheNode) => void);
        cfg?: any;
        component?: IBobrilComponent;
        data?: any;
    }
    type IBobrilNode = IBobrilNodeCommon & object;
    interface IBobrilCacheNode {
        tag: string;
        key: string;
        className: string;
        style: any;
        attrs: IBobrilAttributes;
        children: IBobrilCacheChildren;
        ref: [IBobrilCtx, string] | ((node: IBobrilCacheNode) => void);
        cfg: any;
        component: IBobrilComponent;
        data: any;
        element: Node | Node[];
        parent: IBobrilCacheNode;
        ctx: IBobrilCtx;
    }

    type Element = IBobrilNode;

    interface IntrinsicAttributes {
        key?: string;
        ref?: [IBobrilCtx, string] | ((node: IBobrilCacheNode) => void);
    }

    interface IntrinsicClassAttributes<T> {
    }

    interface IntrinsicElements {
        [name: string]: any;
    }
}
