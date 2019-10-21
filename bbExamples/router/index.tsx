import * as b from "bobril";

function Main(data: b.IRouteHandlerData) {
  return <div>Main</div>;
}

class Main2 extends b.Component<b.IRouteHandlerData> {
  render() {
    return <div>Main2</div>;
  }
}

interface IMain3Data {
  test: string;
}

const Main3 = b.createComponent({
  render(ctx: b.IBobrilCtx<IMain3Data>, me: b.IBobrilNode) {
    me.children = "Main3";
  }
});

b.routes([
  b.route({
    handler: (p: b.IRouteHandlerData) => <Main {...p} />
  }),
  b.route({
    handler: (p: b.IRouteHandlerData) => <Main2 {...p} />
  }),
  b.route({
    handler: (p: b.IRouteHandlerData) => <Main3 test="A" />
  }),
  b.route({
    handler: () => <Main3 test="A" />
  }),
  b.route({
    handler: Main3
  })
]);
