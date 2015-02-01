/// <reference path="../../src/bobril.d.ts"/>
module InputApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    function layoutPair(left: any, right: any, leftWidth= "50%"): IBobrilNode {
        return {
            tag: "div",
            style: { display: "table", width: "100%" },
            children: [
                { tag: "div", style: { display: "table-cell", "vertical-align": "top", width: leftWidth }, children: left },
                { tag: "div", style: { display: "table-cell", "vertical-align": "top" }, children: right }
            ]
        };
    }

    var spacer = { tag: "div", style: "height:1em" };

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

    var option2 = "";

    function setOption2(v: string) {
        option2 = v;
        b.invalidate();
    }

    var optionm:string[] = [];

    function setOptionm(v: string[]) {
        optionm = v;
        b.invalidate();
    }

    var valuearea = "Change this";

    function setValueArea(v: string) {
        valuearea = v;
        b.invalidate();
    }

    // Text input custom component
    interface IOnChangeData {
        onChange: (value: any) => void;
    }

    interface IOnChangeCtx {
        data: IOnChangeData;
    }

    var OnChangeComponent: IBobrilComponent = {
        onChange(ctx: IOnChangeCtx, v: any): void {
            ctx.data.onChange(v);
        }
    }

    function textInput(value: string, onChange: (value: string) => void): IBobrilNode {
        return { tag: "input", attrs: { value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    function checkbox(value: boolean, onChange: (value: boolean) => void): IBobrilNode {
        return { tag: "input", attrs: { type: "checkbox", value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    function radiobox(groupName: string, value: boolean, onChange: (value: boolean) => void): IBobrilNode {
        return { tag: "input", attrs: { type: "radio", name: groupName, value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    function mapOptions(options: string[][]): any[] {
        return options.map((i) => ({ tag: "option", attrs: { value: i[0] }, children: i[1] }));
    }

    function combobox(value: string, onChange: (value: string) => void, options: string[][]) {
        return {
            tag: "select",
            attrs: { value: value },
            data: { onChange: onChange },
            component: OnChangeComponent,
            children: mapOptions(options)
        };
    }

    function listbox(value: string, onChange: (value: string) => void, options: string[][]) {
        return {
            tag: "select",
            attrs: { value: value, size: "" + options.length },
            data: { onChange: onChange },
            component: OnChangeComponent,
            children: mapOptions(options)
        };
    }

    function listboxmulti(value: string[], onChange: (value: string[]) => void, options: string[][]) {
        return {
            tag: "select",
            attrs: { value: value, multiple: true, size: "" + options.length },
            data: { onChange: onChange },
            component: OnChangeComponent,
            children: mapOptions(options)
        };
    }

    function textarea(value: string, onChange: (value: string) => void, rows = 5) {
        return {
            tag: "textarea",
            style: { width: "100%" },
            attrs: { value: value, rows: rows },
            data: { onChange: onChange },
            component: OnChangeComponent
        }
    }

    b.init(() => {
        frame++;
        return [
            h("h1", "Input Bobril sample"),
            layoutPair([
                textInput(value, setValue),
                h("p", "Entered: ", value),
                h("label", checkbox(checked, setChecked), "Checkbox"),
                h("p", "Checked: ", checked ? <any>"Yes" : "No"),
                h("label", radiobox("g1", radio1, setRadio1), "Radio 1"),
                h("label", radiobox("g1", radio2, setRadio2), "Radio 2"),
                h("p", "Radio1: ", radio1 ? <any>"Yes" : "No", " Radio2: ", radio2 ? <any>"Yes" : "No"),
                h("p", "Frame: " + frame)
            ], [
                layoutPair([
                    combobox(option, setOption, [["A", "Angular"], ["B", "Bobril"], ["C", "Cecil"]])
                ], [
                    h("div", "Combobox: ", option)
                ]),
                spacer,
                layoutPair([
                    listbox(option2, setOption2, [["A", "Angular"], ["B", "Bobril"], ["C", "Cecil"]])
                ], [
                    h("div", "Listbox: ", option2)
                ]),
                spacer,
                layoutPair([
                    listboxmulti(optionm, setOptionm, [["A", "Angular"], ["B", "Bobril"], ["C", "Cecil"]])
                ], [
                    h("div", "Multiselect: ", optionm.join(", "))
                ]),
                spacer,
                textarea(valuearea, setValueArea),
                h("pre", valuearea)
            ])
        ];
    });
}
