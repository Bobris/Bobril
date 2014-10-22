/// <reference path="../../src/bobril.d.ts"/>

module SvgApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    b.init(() => {
        b.invalidate();
        var angle = Math.sin(b.uptime() * 0.0002) * 180 + 180;
        var angle2 = Math.sin(b.uptime() * 0.0003) * 180 + 180;
        var path = ["pie", 200, 200, 195, 180, 0, angle,
            "pie", 200, 200, 175, 160, 0, angle2,
            "pie", 200, 200, 155, 140, angle, angle2,
            "pie", 200, 200, 135, 0, angle, angle2];
        var radius = Math.sin(b.uptime() * 0.01) * 30 + 70;
        var path2 = ["pie", 200, 200, radius, 0, angle, angle2];
        return [
            h("h1", "Svg Bobril sample"),
            {
                component: b.vg, data: { height: "400px", width: "400px" }, children: [
                    { data: { path: path, fill: "#ff0000", stroke: "#000000", strokeWidth: 2 } },
                    { data: { path: path2, fill: "#00ff00", fillOpacity: 0.5 } }
                ]
            }
        ];
    });
}
