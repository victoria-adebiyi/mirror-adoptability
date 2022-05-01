const getMilliseconds = (minutes, hours, days, weeks, months) => {
    return  minutes * 60000 +
        hours * 3.6e6 +
        days * 8.64e7 +
        weeks * 6.048e8 +
        months * 2.628e9
}

const width2 = 550,
    height2 = 350;
const margin2 = {
  top: 40,
  bottom: 30,
  left: 30,
  right: 30
};

const width = 800,
    height = 100,
    margin = 50
let prevVal = 0;
var sub_data = [];


const getHours = (milliseconds) => {
    return milliseconds / 3.6e6
}
const getDays = (milliseconds) => {
    return milliseconds / 8.64e7
}
const getMonths = (milliseconds) => {
    return milliseconds / 2.628e9
}

const getScale = (milliseconds) => {
    console.log(milliseconds / 3.6e6)
    return milliseconds / 3.6e6
}

// Opens the URL associated with the clicked datapoint
const clicked = (d, i) => {
    window.open(d.url, '_blank')
}

// Get data
function getData() {
    d3.selectAll("svg > *").remove()
    d3.csv('./data/animals_sample_cleaned.csv',
    function(d) {
        return {
            'tta': Date.parse(d.status_changed_at) - Date.parse(d.published_at),
            'url': d.url,
            'species': d.species,
            'age': d.age,
            'size': d.size,
            'special_needs': d.attributes_special_needs,
            'spayed_neutered': d.attributes_spayed_neutered,
            'house_trained': d.attributes_house_trained,
            'shots': d.attributes_shots_current,
            'children': d.environment_children
        };
    })
    .then(function(d) {
        d.sort((a, b) => a['tta'] - b['tta'])
        timeline(d)
        barChart(d)});
}

function timeline(data) {
    let sub_data = data;

    // Filter on species
    if (document.getElementById('species_option').value !== 'Species') {
        console.log('Filtering on species')
        sub_data = sub_data.filter(d => d.species === document.getElementById('species_option').value)
    }

    // Filter on age
    if (document.getElementById('age_option').value !== 'Age Range') {
        console.log('Filtering on age')
        sub_data = sub_data.filter((d) => d.age === document.getElementById('age_option').value)
    }

    // Filter on size
    if (document.getElementById('size_option').value !== 'Size') {
        console.log('Filtering on size')
        sub_data = sub_data.filter(d => d.size === document.getElementById('size_option').value)
    }

    // Filter on special needs
    if (document.getElementById('special_needs').checked) {
        console.log('Filtering on special needs')
        sub_data = sub_data.filter(d => d.special_needs === 'TRUE')
    }

    const max = d3.max(sub_data.map(function(r) { return r.tta }))

    // Define how many points to initially zoom in on
    const top_10_max = d3.max(sub_data.slice(0,10).map(function(r) { return r.tta }))

    console.log("Max " + max)
    const zoom = d3.zoom()
        .extent([[margin, 0], [width - margin, height]])
        .scaleExtent( [ 1, getScale(max) ] )
        .translateExtent([[margin, 0], [width - margin, height]])
        .on( 'zoom', () => onZoom() )
    const svg = d3.select( '#vis-svg-1' )
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .style("cursor", "zoom-in")
         })
        .call( zoom )

    const x = d3.scaleLinear()
        .domain([0, max])
        .range([ margin, width-margin ])
        // .clamp(true)
        .nice()

    let xAxis = d3.axisBottom()
        .scale( x )
        .tickFormat(tickFormat)

    if (sub_data.length === 0) {
        svg
            .append('text')
            .attr('y', 90)
            .attr('x', width/2)
            .attr('text-anchor', 'middle')
            .text('Sorry, no data available for this type of pet.');
    } else {
        svg
            .append('text')
            .attr('y', 90)
            .attr('x', width/2)
            .attr('text-anchor', 'middle')
            .text('Time to Adoption');
    }

    const g = svg.append("g")
        .attr("class", "axis axis--x")
        .attr('transform', `translate(0, ${margin})`)
        .call( xAxis )

    const datapoints = svg.append('g')
        .selectAll("dot")
        .data(sub_data)
        .enter()

    const outline = datapoints.append('g')
    outline.append("polygon")
    outline.append("path")

    const dots = datapoints.append("g")
        .style("fill", "#69b3a2")
        .on("click", clicked)
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseLeave);
    dots.append("polygon")
    dots.append("path")

    function onMouseOver(d) {
        d3.select(this)
          .transition()
            .delay(50)
            .duration(400)
        .style("fill", "#3488a9")
        .style("cursor", "pointer")
      }

      function onMouseLeave(d) {
        d3.select(this)
          .transition()
            .delay(50)
            .duration(400)
          .style("fill", "#69b3a2")
      }

    function onZoom() {
        // Rescales the axis
        const t = d3.event.transform,
            xt = t.rescaleX(x)
        g.call( xAxis.scale(xt) )
        // Rescale the data points, which are triangles
        dots.selectAll("polygon").attr("points", function (d) {return `${xt(d.tta)-7},${margin-12.1} 
                                                  ${xt(d.tta)+7},${margin-12.1} 
                                                  ${xt(d.tta)},${margin-2}`})
        dots.selectAll("path")
            .attr("transform", (d) => `translate(${xt(d.tta)}, ${margin - 12})`)
            .attr("d", d3.arc()
                .innerRadius(0)
                .outerRadius(7)
                .startAngle(-1.571)
                .endAngle(1.571))

        outline.selectAll("polygon")
            .attr("points", function (d) {return `${xt(d.tta)-8},${margin-12} 
                                                  ${xt(d.tta)+8},${margin-12} 
                                                  ${xt(d.tta)},${margin}`})
            .attr("fill", "rgb(101,4,181)")

        // Clip data that is out of range
        dots.attr('opacity', function (d) {
            if (xt(d.tta) < margin || xt(d.tta) > width - margin) {
                return 0
            }
            return 1
        })
    }

    function tickFormat(val) {
        let ticks = d3.event?.transform?.rescaleX(x)?.ticks()
        let distance;
        if (!ticks) {
            distance = val - prevVal
            prevVal = val
        } else {
            // Distance between each tick
            distance = ticks[ticks.length - 1] - ticks[ticks.length - 2]
        }
        if (val == 0) {
            return 'Published'
        }

        let labels = []

        let months = Math.floor(val / 2.628e9)
        if (months > 0) {
            val = val % 2.628e9
            labels.push(`${months}mo`)
        }

        let weeks = Math.floor(val / 6.048e8)
        if (weeks > 0 && (distance < 1000000000 || labels.length === 0)) {
            val = val % 6.048e8
            labels.push(`${weeks}w`)
        }

        let days = Math.floor(val / 8.64e7)
        if (days > 0 && (distance < 500000000 || labels.length === 0)) {
            val = val % 8.64e7
            labels.push(`${days}d`)
        }

        let hrs = Math.floor(val / 3.6e6)
        if (hrs > 0 && (distance < 25000000 || labels.length === 0)) {
            val = val % 3.6e6
            labels.push(`${hrs}h`)
        }

        let mins = Math.floor(val / 60000)
        if (mins > 0 && (distance < 2500000|| labels.length === 0)) {
            val = val % 60000
            labels.push(`${mins}m`)
        }

        let secs = Math.floor(val / 1000)
        if (secs > 0 && (distance < 100000 || labels.length === 0)) {
            labels.push(`${secs}s`)
        }

        return labels.join(":")
    }

    // Initial scaling
    svg.call(zoom.scaleTo, max/top_10_max)
    svg.call(zoom.translateTo, 0, 0)

    return data;
}

function barChart(data) {
    console.log("barchart called");
    let svg2 = d3
    .select('#vis-svg-2')
    .append('svg')
      .attr('width', width2)
      .attr('height', height2)
      .style('background', '#e9f7f2');

   // Filter on species
   if (document.getElementById('species_option').value !== 'Species') {
        console.log('Filtering on species')
        data = data.filter(d => d.species === document.getElementById('species_option').value)
    }

    // Filter on age
    if (document.getElementById('age_option').value !== 'Age Range') {
        console.log('Filtering on age')
        data = data.filter((d) => d.age === document.getElementById('age_option').value)
    }

// Filter on size
    if (document.getElementById('size_option').value !== 'Size') {
        console.log('Filtering on size')
     data = data.filter(d => d.size === document.getElementById('size_option').value)
    }

    // Filter on special needs
    if (document.getElementById('special_needs').checked) {
        console.log('Filtering on special needs')
       data = data.filter(d => d.special_needs === 'TRUE')
    }

  // Define Scales
  var spayedNeutered = data.filter(d => d.spayed_neutered === 'TRUE').length;
  var houseTrained = data.filter(d => d.house_trained === 'TRUE').length;
  var shots = data.filter(d => d.shots === 'TRUE').length;
  var children = data.filter(d => d.children === 'TRUE').length;

  let traitData = [
    { trait: 'House-Trained', freq: houseTrained},
    { trait: 'Spayed/Neutered', freq: spayedNeutered},
    { trait: 'Shots Up-To-Date', freq: shots},
    { trait: 'Child-Friendly', freq: children}
  ];

  console.log(traitData)

  let yScale = d3.scaleLinear()
    .domain([0, d3.max(traitData.map(function(d) {return d.freq;}))])
    .range([height2 - margin2.bottom, margin2.top]);

  let xScale = d3.scaleBand()
    .domain( traitData.map(function(d){
        return d.trait;
    }))
    .range([margin2.left, width2 - margin2.right])
    .padding(0.5);


  //Draw Axes
  let yAxis = svg2
    .append('g')
      .attr('transform', `translate(${margin2.left},0)`)
      .call(d3.axisLeft().scale(yScale));

  //Add label
  yAxis
    .append('text')
      .attr('y', 30)
      .attr('x', 40)
      .style('stroke', 'black')
      .text('Trait Frequency');

  let xAxis = svg2
    .append('g')
      .attr('transform', `translate(0,${height2 - margin2.bottom})`)
      .call(d3.axisBottom().scale(xScale));

  //Add label
  xAxis
    .append('text')
      .attr('x', width2 - margin2.left)
      .attr('y', -10)
      .style('stroke', 'black')
      .text('Traits');

  //Draw bars
  let bar = svg2.append('g')
    .selectAll('g')
    .data(traitData)
    .join('g')
    .selectAll('rect')
    .data(traitData)
    .enter()
    .append('rect')
      .attr('x', function(d) {
        return xScale(d.trait);
      })
      .attr('y', function(d) {
        return height2 - margin2.bottom;
      })
      .attr('width', xScale.bandwidth())
      .attr('fill', '#69b3a2')
      //if there is nothing in the data set, do not draw the bars
      .attr('opacity', function (d) {
        if (data.length === 0) {
            return 0
        }
        return 1
    })
    // chart height animation
      .attr("height", function(d) {return 0})
      .transition()
      .ease(d3.easeLinear)
      .attr("y", function (d) {return yScale(d.freq)})
      .attr("height", function (d) {
        return height2 - margin2.bottom - yScale(d.freq)});
}

getData()
