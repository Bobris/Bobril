/// <reference path="../../src/bobril.d.ts"/>
module InputApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    // Model
    var frame = 0;
    var value = "Change this";

    function setValue(v: string) {
        value = v;
        b.invalidate();
    }

    // Custom component
    interface ITextInputData {
        onChange: (value: string) => void;
    }

    interface ITextInputCtx {
        data: ITextInputData;
    }

    class TextInputComponent implements IBobrilComponent {
        static shouldChange(ctx: ITextInputCtx, me: IBobrilNode, oldMe: IBobrilCacheNode): boolean {
            return me.attrs.value !== oldMe.attrs.value || me.data.onChange !== oldMe.data.onChange;
        }

        static onChange(ctx: ITextInputCtx, v: string): void {
            ctx.data.onChange(v);
        }
    }

    function textInput(value: string, onChange: (value: string) => void): IBobrilNode {
        return { tag: "input", attrs: { value: value }, data: { onChange: onChange }, component: TextInputComponent };
    }

    b.init(() => {
        frame++;
        return [
            h("h1", "Input Bobril sample"),
            textInput(value, setValue),
            h("p", "Entered: ", value),
            h("p", "Frame: ", frame)
        ];
    });
}
