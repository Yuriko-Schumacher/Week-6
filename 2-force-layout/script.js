const margin = { t: 50, r: 50, b: 50, l: 50 };
const size = { w: 800, h: 800 };
const svg = d3.select("svg");

svg.attr("width", size.w).attr("height", size.h);

const containerG = svg.append("g").classed("container", true);

d3.json("data/data.json").then(function (data) {
	console.log(data);

	let scaleLinear = d3
		.scaleLinear()
		.domain(d3.extent(data.links, (d) => d.value))
		.range([0.1, 1]);

	let scaleOpacity = d3
		.scaleLinear()
		.domain(d3.extent(data.links, (d) => d.value))
		.range([0.1, 1]);

	let simulation = d3
		.forceSimulation(data.nodes)
		.force("center", d3.forceCenter(size.w / 2, size.h / 2))
		.force("charge", d3.forceManyBody().strength(-20))
		.force(
			"link",
			d3
				.forceLink(data.links)
				.id((d) => d.id)
				.strength((d) => scaleLinear(d.value))
		);

	let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

	let lines = containerG
		.selectAll("line")
		.data(data.links)
		.join("line")
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("opacity", (d) => scaleOpacity(d.value))
		.attr("x1", (d) => Math.random() * size.w)
		.attr("x2", (d) => Math.random() * size.w)
		.attr("y1", (d) => Math.random() * size.h)
		.attr("y2", (d) => Math.random() * size.h);

	let nodes = containerG
		.selectAll("circle")
		.data(data.nodes)
		.join("circle")
		.attr("r", 5)
		.attr("cx", (d) => Math.random() * size.w)
		.attr("cy", (d) => Math.random() * size.h)
		.style("fill", (d) => colorScale(d.group))
		.call(drag(simulation));

	simulation.on("tick", function () {
		console.log("tick");

		nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

		lines
			.attr("x1", (d) => d.source.x)
			.attr("y1", (d) => d.source.y)
			.attr("x2", (d) => d.target.x)
			.attr("y2", (d) => d.target.y);
	});
});

function drag(simulation) {
	let dragStarted = function (event) {
		console.log(event);
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.x; // fx and fy: fixed x and fixed y
		event.subject.fy = event.y;
	};

	let dragged = function (event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	};

	let dragEnded = function (event) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	};

	return d3
		.drag()
		.on("start", dragStarted)
		.on("drag", dragged)
		.on("end", dragEnded);
}
