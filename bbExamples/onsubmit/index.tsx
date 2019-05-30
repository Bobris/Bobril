import * as b from "bobril";

b.addEvent("submit", 10, (event: Event, _target, node) => {
    if (b.bubble(node, "onSubmit", undefined) != undefined) b.preventDefault(event);
    return false;
});

declare module "bobril" {
    interface IBobrilEvents {
        onSubmit?(): GenericEventResult;
    }
}

b.init(() => {
    var text = b.useState("");
    return (
        <>
            <form
                onSubmit={() => {
                    text("submited in frame " + b.frame());
                    return true;
                }}
            >
                <input />
                <button type="submit">Submit</button>
            </form>
            <div>{text()}</div>
        </>
    );
});
