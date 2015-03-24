var GameOfLifeApp;
(function (GameOfLifeApp) {
    (function (HeaderLevel) {
        HeaderLevel[HeaderLevel["H1"] = 0] = "H1";
        HeaderLevel[HeaderLevel["H2"] = 1] = "H2";
        HeaderLevel[HeaderLevel["H3"] = 2] = "H3";
    })(GameOfLifeApp.HeaderLevel || (GameOfLifeApp.HeaderLevel = {}));
    var HeaderLevel = GameOfLifeApp.HeaderLevel;
    var Header = (function () {
        function Header() {
        }
        Header.getTag = function (level) {
            switch (level) {
                case 0 /* H1 */:
                    return "h1";
                case 1 /* H2 */:
                    return "h2";
                case 2 /* H3 */:
                    return "h3";
            }
        };
        Header.render = function (ctx, me) {
            me.tag = this.getTag(ctx.data.level);
            me.children = ctx.data.content;
        };
        Header.onClick = function (ctx, event) {
            ctx.data.onClick();
            return true;
        };
        return Header;
    })();
    GameOfLifeApp.Header = Header;
})(GameOfLifeApp || (GameOfLifeApp = {}));
//# sourceMappingURL=header.js.map