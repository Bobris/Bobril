/// <reference path="../../src/bobril.d.ts"/>
module InputApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    function layoutPair(left: any, right: any, leftWidth= "50%"): IBobrilNode {
        return {
            tag: "div",
            attrs: { style: { display:"table", width:"100%" } },
            children: [
                { tag: "div", attrs: { style: { display:"table-cell", width: leftWidth } }, children: left },
                { tag: "div", attrs: { style: { display: "table-cell" } }, children: right }
            ]
        };
    }

    // Model
    var frame = 0;
    var value = "Change this";

    function setValue(v: string) {
        value = v;
        b.invalidate();
    }

    var checked = false;

    function setChecked(v: boolean) {
        checked = v;
        b.invalidate();
    }

    var radio1 = false;
    var radio2 = false;

    function setRadio1(v: boolean) {
        radio1 = v;
        b.invalidate();
    }

    function setRadio2(v: boolean) {
        radio2 = v;
        b.invalidate();
    }

    var option = "";

    function setOption(v: string) {
        option = v;
        b.invalidate();
    }

    // Text input custom component
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

    // Checkbox custom component
    interface ICheckboxData {
        onChange: (value: boolean) => void;
    }

    interface ICheckboxCtx {
        data: ICheckboxData;
    }

    class CheckboxComponent implements IBobrilComponent {
        static onChange(ctx: ICheckboxCtx, v: boolean): void {
            ctx.data.onChange(v);
        }
    }

    function checkbox(value: boolean, onChange: (value: boolean) => void): IBobrilNode {
        return { tag: "input", attrs: { type: "checkbox", value: value }, data: { onChange: onChange }, component: CheckboxComponent };
    }

    function radiobox(groupName: string, value: boolean, onChange: (value: boolean) => void): IBobrilNode {
        return { tag: "input", attrs: { type: "radio", name: groupName, value: value }, data: { onChange: onChange }, component: CheckboxComponent };
    }

    function combobox(value: string, onChange: (value: string) => void, options: string[][]) {
        return { tag: "select", attrs: { value: value }, data: { onChange: onChange }, component: TextInputComponent, children: options.map((i) => ({ tag: "option", attrs: { value: i[0] }, children: i[1] })) };
    }

    b.init(() => {
        frame++;
        return [
            h("h1", "Input Bobril sample"),
            layoutPair([
                textInput(value, setValue),
                h("p", "Entered: ", value),
                h("label", checkbox(checked, setChecked), "Checkbox"),
                h("p", "Checked: ", checked ? "Yes" : "No"),
                h("label", radiobox("g1", radio1, setRadio1), "Radio 1"),
                h("label", radiobox("g1", radio2, setRadio2), "Radio 2"),
                h("p", "Radio1: ", radio1 ? "Yes" : "No", " Radio2: ", radio2 ? "Yes" : "No"),
                h("p", "Frame: " + frame)
            ], [
                layoutPair([
                    combobox(option, setOption, [["A", "Angular"], ["B", "Bobril"], ["C", "Cecil"]])
                ], [
                    h("p", "Chosen: ", option)
                ])
            ])
        ];
    });
}
