import * as b from "bobril";

function Main(data: b.IRouteHandlerData) {
  return <div>Main</div>;
}

class Main2 extends b.Component<b.IRouteHandlerData> {
  render() {
    return <div>Main2</div>;
  }
}

b.routes(
  b.route({
    handler: (data: b.IRouteHandlerData) => <Main2 {...data} />
  })
);
