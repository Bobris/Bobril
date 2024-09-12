import type { IBobrilChild, IBobrilChildren } from "./core.ts";

export function count(children: IBobrilChildren) {
    if (Array.isArray(children)) {
        let res = 0;
        for (let i = 0; i < children.length; i++) {
            res += count(children[i]);
        }
        return res;
    }
    if (children == undefined || children === false || children === true) return 0;
    return 1;
}

export function only(children: IBobrilChildren): IBobrilChild {
    if (count(children) != 1) {
        throw new Error("Children.only() accepts only single child");
    }
    if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child == undefined || child === false || child === true) continue;
            if (Array.isArray(child)) {
                if (count(child) > 0) return only(child);
                continue;
            }
            return child;
        }
        if (children.length === 1) return only(children[0]);
        return null;
    }
    return children;
}

export function toArray(children: IBobrilChildren): IBobrilChild[] {
    if (children == undefined || children === false || children === true) return [];
    if (Array.isArray(children)) {
        let res: IBobrilChild[] = [];
        for (let i = 0; i < children.length; i++) {
            res.push(...toArray(children[i]));
        }
        return res;
    }
    return [children];
}

export function map(
    children: IBobrilChildren,
    fn: (value: IBobrilChild, index: number) => IBobrilChild,
): IBobrilChild[] {
    if (children == undefined || children === false || children === true) return [];
    if (Array.isArray(children)) {
        let res: IBobrilChild[] = [];
        for (let i = 0; i < children.length; i++) {
            mapRecursive(res, children[i], fn);
        }
        return res;
    }
    return [fn(children, 0)];
}

function mapRecursive(
    res: IBobrilChild[],
    children: IBobrilChildren,
    fn: (value: IBobrilChild, index: number) => IBobrilChild,
) {
    if (children == undefined || children === false || children === true) return;
    if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            mapRecursive(res, children[i], fn);
        }
        return;
    }
    res.push(fn(children, res.length));
}

export function forEach(children: IBobrilChildren, fn: (value: IBobrilChild, index: number) => void): void {
    if (children == undefined || children === false || children === true) return;
    if (Array.isArray(children)) {
        let idx = 0;
        for (let i = 0; i < children.length; i++) {
            idx = forEachRecursive(children[i], fn, idx);
        }
        return;
    }
    fn(children, 0);
}

function forEachRecursive(
    children: IBobrilChildren,
    fn: (value: IBobrilChild, index: number) => void,
    idx: number,
): number {
    if (children == undefined || children === false || children === true) return idx;
    if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            idx = forEachRecursive(children[i], fn, idx);
        }
        return idx;
    }
    fn(children, idx);
    return idx + 1;
}
