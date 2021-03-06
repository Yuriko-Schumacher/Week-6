const margin = { t: 50, r: 50, b: 50, l: 50 };
const size = { w: 800, h: 800 };
const svg = d3.select("svg");

svg.attr("width", size.w).attr("height", size.h);

const containerG = svg.append("g").classed("container", true);

d3.json("data/data.json").then(function (data) {
	console.log(data);
	data.nodes.forEach((d) => {
		d.value = 5 + Math.random() * 10;
	});

	let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
	let scaleX = d3
		.scaleBand()
		.domain([...Array(11).keys()])
		.range([margin.l, size.w - margin.r]);

	let objMax = {};

	let groups = new Set(data.nodes.map((d) => d.group));
	groups = Array.from(groups);

	groups.forEach((groupNo) => {
		let groupData = data.nodes.filter((d) => +d.group === groupNo);
		let maxVal = d3.max(groupData, (d) => d.value);
		objMax["g" + groupNo] = maxVal;
	});
	console.log(objMax);

	data.nodes.forEach((node) => {
		if (objMax["g" + node.group] === node.value) {
			// node with max value in group
			node.fx = scaleX(node.group);
			node.fy = scaleX(node.group);
		}
	});

	let simulation = d3
		.forceSimulation(data.nodes)
		// .force('center', )
		.force(
			"collide",
			d3.forceCollide().radius((d) => d.value)
		)
		.force("charge", d3.forceManyBody().strength(0.3))
		.force(
			"x",
			d3
				.forceX()
				.x((d) => scaleX(d.group))
				.strength(0.5)
		)
		.force("y", d3.forceY().y(size.h / 2));

	let node = svg
		.append("g")
		.attr("stroke", "#fff")
		.attr("stroke-width", 1.5)
		.selectAll("circle")
		.data(data.nodes)
		.join("circle")
		.attr("yy", (d) => d.group)
		.attr("r", (d) => d.value)
		.attr("fill", (d) => colorScale(d.group))
		.call(drag(simulation));

	simulation.on("tick", () => {
		node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
	});
});

function drag(simulation) {
	function dragstarted(event) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	function dragged(event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	function dragended(event) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	}

	return d3
		.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended);
}
