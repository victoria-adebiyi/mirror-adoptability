let width2 = 600,  height2 = 400;
  
let margin2 = {
  top: 40,
  bottom: 30,
  left: 30,
  right: 30
};


    console.log("barchart called");
    let svg2 = d3
    .select('vis-svg-2')
    .append('svg')
      .attr('width', width2)
      .attr('height', height2)
      .style('background', '#e9f7f2');

  
  // Define Scales
  var spayedNeutered = 0;
  var houseTrained = 0;
  var shots = 0;
  var children = 0;

 sub_data = sub_data.map(function(d) {
        if(d.attributes_house_trained = "TRUE") {
            houseTrained++;
            console.log("map called");
        }
        if(d.attributes_spayed_neutered = "TRUE") {
            spayedNeutered++;
        }
        if(d.attributes_shots_current = "TRUE") {
            shots++;
        }
        if(d.environment_children = "TRUE") {
            children++;
        }
        return d;
      });
      
    let traitData = [
        { trait: 'House-Trained'    , freq: houseTrained},
        { trait: 'Spayed/Neutered'    , freq: spayedNeutered},
        { trait: 'Shots Up-To-Date'  , freq: shots},
        { trait: 'Child-Friendly', freq: children}
      ];

  let yScale = d3.scaleLinear()
    .domain([0, d3.max(traitData.map(function(d) {return d.freq;}))])
    .range([height2 - margin2.bottom, margin2.top]);

  let xScale = d3.scaleBand()
    .domain( traitData.map(function(d){
        return d.name;
    })
)
    .range([margin2.left, width2 - margin2.right])
    .padding(0.5);


  //Draw Axes
  let yAxis = svg2
    .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft().scale(yScale));
  
  //Add label
  yAxis
    .append('text')
      .attr('y', 30)
      .attr('x', 20)
      .style('stroke', 'black')
      .text('Trait Frequency');
  
  let xAxis = svg2
    .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom().scale(xScale));
    
  //Add label
  xAxis
    .append('text')
      .attr('x', width2 - margin2.left)
      .attr('y', -10)
      .style('stroke', 'black')
      .text('Names');
  
  //Draw bars
  let bar = svg2
    .selectAll('rect')
      .data(traitData)
    .enter()
    .append('rect')
      .attr('x', function(d) {
        return xScale(d.trait);
      })
      .attr('y', function(d) {
        return yScale(d.freq);
      })
      .attr('width', xScale.bandwidth())
      .attr('fill', 'steelblue')
      .attr('height', function(d) {
        return height2 - margin2.bottom - yScale(d.freq);
});