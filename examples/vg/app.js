/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.vg.d.ts"/>
var VgApp;
(function (VgApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    b.init(function () {
        b.invalidate();
        var angle = Math.sin(b.uptime() * 0.0002) * 180 + 180;
        var angle2 = Math.sin(b.uptime() * 0.0003) * 180 + 180;
        var path = ["pie", 200, 200, 195, 180, 0, angle,
            "pie", 200, 200, 175, 160, 0, angle2,
            "pie", 200, 200, 155, 140, angle, angle2,
            "pie", 200, 200, 135, 0, angle, angle2];
        var radius = Math.sin(b.uptime() * 0.01) * 30 + 70;
        var path2 = ["pie", 200, 200, radius, 0, angle, angle2];
        var deltax = Math.sin(b.uptime() * 0.003) * 40;
        var deltay = Math.cos(b.uptime() * 0.003) * 40;
        var posx = 500 - deltax;
        var posy = 100 - deltay;
        var sline = ["M", 500 + deltax, 100 + deltay, "L", posx, posy, "C",
            posx, posy + 20, posx - 10, posy + 10, posx - 10, posy + 30, "L", posx + 10, posy + 30, "C",
            posx + 10, posy + 10, posx, posy + 20, posx, posy];
        return [
            h("h1", "Vector Graphic Bobril sample"),
            {
                component: b.vg,
                data: { width: "700px", height: "400px" },
                children: [
                    { data: { path: path, fill: "#ff0000", stroke: "#000000", strokeWidth: 2 } },
                    { data: { path: path2, fill: "#00ff00", fillOpacity: 0.5 } },
                    {
                        data: {
                            path: sline, stroke: "#0000f0",
                            strokeOpacity: 0.2 + Math.abs(0.8 * Math.sin(b.uptime() * 0.001)),
                            strokeWidth: 5 + 2 * Math.sin(b.uptime() * 0.004)
                        }
                    },
                    {
                        data: {
                            path: ["M", 440, 200, "L", 440, 300], stroke: "#000000", strokeWidth: 15, lineCap: "butt"
                        }
                    },
                    {
                        data: {
                            path: ["M", 470, 200, "L", 470, 300], stroke: "#000000", strokeWidth: 15, lineCap: "round"
                        }
                    },
                    {
                        data: {
                            path: ["M", 500, 200, "L", 500, 300], stroke: "#000000", strokeWidth: 15, lineCap: "square"
                        }
                    },
                    {
                        data: {
                            path: ["M", 600, 150, "L", 630, 50, "L", 660, 150], stroke: "#000000", strokeWidth: 15, lineJoin: "miter"
                        }
                    },
                    {
                        data: {
                            path: ["M", 600, 250, "L", 630, 150, "L", 660, 250], stroke: "#000000", strokeWidth: 15, lineJoin: "round"
                        }
                    },
                    {
                        data: {
                            path: ["M", 600, 350, "L", 630, 250, "L", 660, 350], stroke: "#000000", strokeWidth: 15, lineJoin: "bevel"
                        }
                    },
                    {
                        data: { path: ["rect", 420, 330, 60, 40], stroke: "#000000" }
                    },
                    {
                        data: { path: ["circle", 530, 350, 20], stroke: "#000000" }
                    },
                    {
                        data: { path: ["M", 420, 390, "L", 680, 390], stroke: "#000000", strokeWidth: 10, dasharray: [10, 20] }
                    }
                ]
            }
        ];
    });
})(VgApp || (VgApp = {}));
