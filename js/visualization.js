let prevVal = 0;

const getMilliseconds = (minutes, hours, days, weeks, months) => {
    return  minutes * 60000 +
        hours * 3.6e6 +
        days * 8.64e7 +
        weeks * 6.048e8 +
        months * 2.628e9
}

const data = [
    {tta: getMilliseconds(10, 4, 0, 0, 0), url:"https://www.petfinder.com/"}, // ~4h
    {tta: getMilliseconds(0, 25, 0, 0, 0), url:"https://www.google.com/"}, // ~25 hrs
    {tta: getMilliseconds(0, 0, 0, 0, 1), url:"https://www.neujcc.com/"}, // ~1 month
    {tta: getMilliseconds(0, 2, 0, 0, 0), url:"https://www.amazon.com/"} // ~2 hrs
]

const width = 800,
    height = 100,
    margin = 50

const getHours = (milliseconds) => {
    return milliseconds / 3.6e6
}
const getDays = (milliseconds) => {
    return milliseconds / 8.64e7
}
const getMonths = (milliseconds) => {
    return milliseconds / 2.628e9
}

const max = d3.max(data.map(function(r) { return r.tta }))

const getScale = (milliseconds) => {
    console.log(milliseconds / 3.6e6)
    return 20
}

const zoom = d3.zoom()
    .scaleExtent( [ 1, getScale(max) ] )
    .translateExtent([[0, 0], [width, height]])
    .on( 'zoom', () => onZoom() )

const svg = d3.select( '#vis-svg-1' )
    .call( zoom )

const x = d3.scaleLinear()
    .domain([0, max])
    .range([ margin, width-margin ])
    // .clamp(true)
    .nice()

let xAxis = d3.axisBottom()
    .scale( x )
    .tickFormat(tickFormat)

const g = svg.append("g")
    .attr("class", "axis axis--x")
    .attr('transform', 'translate(0,' + margin + ')')
    .call( xAxis )

// Opens the URL associated with the clicked datapoint
const clicked = (d, i) => {
    window.open(d.url, '_blank')
}

// Create tooltip
const tooltip = d3.select('#vis-svg-1')
    .append("div")
     .style("opacity", 0)
     .attr("class", "tooltip")
     .style("background-color", "white")
     .style("border", "solid")
     .style("border-width", "2px")
     .style("border-radius", "5px")
     .style("padding", "5px")
     .style("width", "200px");

//Mouse over function
function onMouseOver(d) {
    tooltip
      .html("Time to adoption: " + d.tta)
      .style("opacity", 1)
}

function onMouseLeave(d) {
    // use the tooltip style  to remove label on mouseout
   tooltip
      .style("opacity", 0)
}

const dots = svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.tta); } )
    .attr("cy", margin)
    .attr("r", 7)
    .style("fill", "#69b3a2")
    .on("click", clicked)
    .on("mouseover", onMouseOver)
    .on("mouseleave", onMouseLeave);

xAxis = d3.axisBottom()
    .scale( x )
    .tickFormat(tickFormat)

function onZoom() {
    // Rescales the axis
    const t = d3.event.transform,
        xt = t.rescaleX( x );
    g.call( xAxis.scale(xt) )
    // Rescale the data points
    dots.attr('cx', function (d) { return xt(d.tta) })
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
    if (distance < 100000)
        return `${Math.round(val / 1000)} secs`
    else if (distance < 2500000)
        return `${Math.round(val / 60000)} min`
    else if (distance <= 10000000)
        return `${Math.round(val / 3.6e6)} hours`
    else if (distance <= 250000000)
        return `${Math.round(val / 8.64e7)} days`
    else if (distance <= 1000000000)
        return `${Math.round(val / 6.048e8)} weeks`
    else if (distance > 1000000000)
        return `${Math.round(val / 2.628e9)} months`
}
