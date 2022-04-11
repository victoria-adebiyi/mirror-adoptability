
// set the dimensions and margins of the graph
var width2 = 450
var height2 = 200

// append the svg object to the body of the page
var svg = d3.select("#vis-svg-2")
  .append("svg")
    .attr("width", 450)
    .attr("height", 200)

// create dummy data -> just one element per circle
var data = [{ "name": "A" }, { "name": "B" }, { "name": "C" }, { "name": "D" }, { "name": "E" }, { "name": "F" }, { "name": "G" }, { "name": "H" }]

// Initialize the circle: all located at the center of the svg area
var node = svg.append("g")
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")

    .attr("r", 25)
    .attr("cx", width2 / 2)
    .attr("cy", (height2 - 50) / 2)
    .style("fill", "#69b3a2")
    .style("fill-opacity", 0.3)
    .attr("stroke", "#69a2b2")
    .style("stroke-width", 4)

// Features of the forces applied to the nodes:
var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width2 / 2).y(height2 / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(0.5)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.01).radius(30).iterations(1)) // Force that avoids circle overlapping

// Apply these forces to the nodes and update their positions.
// Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
simulation
    .nodes(data)
    .on("tick", function(d){
      node
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; })
    });

simulation.updateSelection = function (selectedData) {
        if (!arguments.length) return dataPoints;
        dataPoints.classed("selected", d => 
        selectedData.includes(d)
        );
}