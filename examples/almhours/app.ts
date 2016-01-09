/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>

module AlmHours {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    var hours: number = 0;
    var minutes: number = 0;
    var workedHours = "1 hours and 15 minutes";
    var polarionHours = "1 1/6h";
    var fraction = "";
    var startHour = "10";
    var startMinute = "30";
    var finishHour = "11";
    var finishMinute = "45";
    var checked = false;

    function checkInputs(v: string) {
        var x = v;
        var y = +x; // y: number
        if (isNaN(y)) {
            alert("only numbers are allowed");
            return false;
        }
        return true;
    }

    function checkInputHour(v: string): string {
        var x = v;
        var y = +x;
        if (y > 23) {
            var value: number = 23;
            return value.toString();
        }
        return v;
    }

    function checkInputMinute(v: string): string {
        var x = v;
        var y = +x;
        if (y > 59) {
            var value: number = 59;
            return value.toString();
        }
        return v;
    }

    function setWorkedHours() {
        var x = finishMinute;
        var y = startMinute;
        var m2 = +x;
        var m1 = +y;
        x = finishHour;
        y = startHour;
        var h2 = +x;
        var h1 = +y;
        var mod: number = 10;
        if (checked == true) {
            mod = 5;
        }

        if (m2 > m1) {
            if (h2 < h1) {
                hours = ((24 - h1) + h2);
                minutes = m2 - m1;
            }
            if (h1 < h2) {
                hours = h2 - h1;
                minutes = m2 - m1;
            }
            if (h1 == h2) {
                hours = 0;
                minutes = m2 - m1;
            }
        }
        if (m1 > m2) {
            if (h2 < h1) {
                hours = ((23 - h1) + h2);
                minutes = (60 - m1) + m2;
            }
            if (h1 < h2) {
                hours = (h2 - h1) - 1;
                minutes = (60 - m1) + m2;
            }
            if (h1 == h2) {
                hours = 24 - 1;
                minutes = (60 - m1) + m2;
            }
        }
        if (m1 == m2) {
            if (h1 == h2) {
                hours = 0;
                minutes = 0;
            }
            if (h2 > h1) {
                hours = (h2 - h1);
                minutes = 0;
            }
            if (h1 > h2) {
                hours = ((24 - h1) + h2);
                minutes = 0;
            }
        }
        workedHours = hours.toString() + " hours and " + minutes.toString() + " minutes";
        if (minutes == 0) {
            polarionHours = hours + "h";
        }
        else {
            var a = minutes % mod;
            if (a != 0) {
                minutes = minutes - a;
            }

            switch (minutes) {
                case 0:
                    fraction = hours.toString();
                    break;
                case 5:
                    fraction = "1/12";
                    break;
                case 10:
                    fraction = "1/6";
                    break;
                case 15:
                    fraction = "1/4";
                    break;
                case 20:
                    fraction = "1/3";
                    break;
                case 25:
                    fraction = "5/12";
                    break;
                case 30:
                    fraction = "1/2";
                    break;
                case 35:
                    fraction = "7/12";
                    break;
                case 40:
                    fraction = "2/3";
                    break;
                case 45:
                    fraction = "3/4";
                    break;
                case 50:
                    fraction = "5/6";
                    break;
                case 55:
                    fraction = "11/12";
                    break;
            }

            if (hours != 0) {
                polarionHours = hours + " " + fraction + "h";
            }
            else {
                polarionHours = fraction + "h";
            }
        }
        b.invalidate();
    }

    function setChecked(v: boolean) {
        checked = v;
        setWorkedHours();
        b.invalidate();
    }

    function setStartHour(v: string) {
        if (checkInputs(v)) {
            startHour = checkInputHour(v);
            setWorkedHours();
            b.invalidate();
        }
        else
            return false
    }

    function setStartMinute(v: string) {
        if (checkInputs(v)) {
            startMinute = checkInputMinute(v);
            setWorkedHours();
            b.invalidate();
        }
        else
            return false
    }

    function setfinishHour(v: string) {
        if (checkInputs(v)) {
            finishHour = checkInputHour(v);
            setWorkedHours();
            b.invalidate();
        }
        else
            return false
    }

    function setfinishMinute(v: string) {
        if (checkInputs(v)) {
            finishMinute = checkInputMinute(v);
            setWorkedHours();
            b.invalidate();
        }
        else
            return false
    }

    interface IOnChangeData {
        onChange: (value: any) => void;
    }

    interface IOnChangeCtx {
        data: IOnChangeData;
    }

    var OnChangeComponent: IBobrilComponent = {
        onChange(dtx: IOnChangeCtx, v: any) {
            dtx.data.onChange(v);
        }
    }

    function textInput(value: string, onChange: (value: string) => void): IBobrilNode {
        return { tag: "input", attrs: { value: value, maxlength: "2", size: "2" }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    function checkbox(value: boolean, onChange: (value: boolean) => void): IBobrilNode {
        return { tag: "input", attrs: { type: "checkbox", value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    b.init(() => {
        return [
            h("h1", "ALM hours"),
            textInput(startHour, setStartHour), " : ", textInput(startMinute, setStartMinute), " – ", textInput(finishHour, setfinishHour), " : ", textInput(finishMinute, setfinishMinute), h("label", checkbox(checked, setChecked), "rounding after 5 minutes (default = 10)"),
            h("p", "Start time is ", startHour, ":", startMinute, " and finish time is ", finishHour, ":", finishMinute),
            h("p", "worked hours: ", workedHours, h("br"), " value to Polarion : ", h("b", polarionHours))
        ];
    });
}