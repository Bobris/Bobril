/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
var SandboxApp;
(function (SandboxApp) {
    var imagesrc = "";
    var PasteImageInput = {
        postInitDom: function (ctx, me, element) {
            ctx.element = element;
        },
        onKeyDown: function (ctx, k) {
            if (k.ctrl || k.meta) {
                var p = document.getElementById("pastehack");
                b.deref(p).ctx.element = ctx.element;
                p.focus();
            }
            return false;
        }
    };
    var PasteImageContEditable = {
        onKeyUp: function (ctx, k) {
            var el = ctx.selfelement;
            var imgs = el.getElementsByTagName("img");
            if (imgs.length > 0) {
                imagesrc = imgs.item(0).getAttribute("src");
                b.invalidate();
            }
            el.innerHTML = "\u00a0";
            if (k.ctrl || k.meta) {
                ctx.element.focus();
            }
            return false;
        },
        postInitDom: function (ctx, me, element) {
            ctx.selfelement = element;
            element.addEventListener("paste", function (ev) {
                var cbData;
                if (ev.clipboardData) {
                    cbData = ev.clipboardData;
                }
                else if (window.clipboardData) {
                    cbData = window.clipboardData;
                }
                if (cbData.items && cbData.items.length > 0) {
                    var blob = cbData.items[0].getAsFile();
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        imagesrc = event.target.result;
                        b.invalidate();
                    }; // data url!
                    reader.readAsDataURL(blob);
                    return;
                }
                var fileList = cbData.files;
                if (!fileList) {
                    console.log("fileList is null.");
                    return;
                }
                for (var i = 0; i < fileList.length; i++) {
                    var file = fileList[i];
                    var url = URL.createObjectURL(file);
                    if (ev.convertURL) {
                        ev.convertURL(file, "base64", url);
                    }
                    else {
                        ev.msConvertURL(file, "base64", url);
                    }
                    imagesrc = url;
                    b.invalidate();
                } // for
            });
        }
    };
    b.init(function () {
        b.invalidate();
        return [
            { tag: "h1", children: "Paste Image Sample" },
            { tag: "p", children: "Try to paste image into edit box using Ctrl+V (tested Chrome,Firefox,IE11)" },
            {
                tag: "input", attrs: { type: "text" }, component: PasteImageInput
            },
            {
                tag: "div", attrs: { id: "pastehack", tabIndex: "0", contentEditable: true }, style: { position: "fixed", opacity: 0 }, children: "\u00a0", component: PasteImageContEditable
            },
            {
                tag: "div", children: imagesrc != "" && {
                    tag: "img", attrs: {
                        src: imagesrc
                    },
                    style: { width: "200px", height: "auto" }
                }
            }
        ];
    });
})(SandboxApp || (SandboxApp = {}));
