import { IBobrilCacheChildren, IBobrilNode } from "./core";
import { noop } from "./localHelpers";

export enum RenderPhase {
    Create,
    Update,
    LocalUpdate,
    Destroy,
}

export var beforeRenderCallback: (node: IBobrilNode, phase: RenderPhase) => void = noop;
export var beforeFrameCallback: () => void = noop;
export var reallyBeforeFrameCallback: () => void = noop;
export var afterFrameCallback: (root: IBobrilCacheChildren | null) => void = noop;

export function setBeforeRender(
    callback: (node: IBobrilNode, phase: RenderPhase) => void
): (node: IBobrilNode, phase: RenderPhase) => void {
    var res = beforeRenderCallback;
    beforeRenderCallback = callback;
    return res;
}

export function setBeforeFrame(callback: () => void): () => void {
    var res = beforeFrameCallback;
    beforeFrameCallback = callback;
    return res;
}

export function setReallyBeforeFrame(callback: () => void): () => void {
    var res = reallyBeforeFrameCallback;
    reallyBeforeFrameCallback = callback;
    return res;
}

export function setAfterFrame(
    callback: (root: IBobrilCacheChildren | null) => void
): (root: IBobrilCacheChildren | null) => void {
    var res = afterFrameCallback;
    afterFrameCallback = callback;
    return res;
}
