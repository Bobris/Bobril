/** @jsx jsxBobrilAdapter */

// To compile this file first install Babel:
// npm i babel -g
// To compile it:
// babel app.jsx -o app.js

// This function would normally be in some library
function jsxBobrilAdapter(name, props) {
	var children = [];
	for(var i=2;i<arguments.length;i++) {
	    var ii=arguments[i];
		if (typeof ii==="number")
			children.push(""+ii);
		else
			children.push(ii);		
    }
	if (typeof name==="string") {
		var res = { tag: name, children: children };
		if (props == null) {
			return res;
		}
		var attrs = {};
		var someattrs = false;
		for(var n in props) {
			if (!props.hasOwnProperty(n)) continue;
			if (n==="key" || n==="className" || n==="style" || n==="component" || n==="data") {
				res[n]=props[n];
				continue;
			}
			someattrs=true;
			attrs[n]=props[n];
		}
		if (someattrs)
 			res.attrs=attrs;

		return res;
	} else {
		if (props == null) {
			return { component: name, children: children };
		}
		return { component: name, key:props.key, data: props };
	}
}

var Input = {
	render(ctx, me) {
		b.assign(me,<input type="text" value={ctx.data.value}/>);
	},
	onChange(ctx,v) {
		ctx.data.onChange(v);
	}
};

var name = "Bobril";

function setName(v) {
	name=v;
	b.invalidate();
}

b.init(()=>{ return <div>
	<h1>JSX example</h1>
	<i style={{ color:"blue" }}>Frame: {b.frame()}</i><br/>
	Your name: <Input value={name} onChange={setName} /><br/>
	<h3>Hello {name}!</h3>
	</div>});
