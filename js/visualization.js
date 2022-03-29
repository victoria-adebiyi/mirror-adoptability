const width = 800,
    height = 100,
    margin = 50

const data = [
    {tta: 1.44e7, url:"https://www.petfinder.com/"}, // ~4h
    {tta: 9e7, url:"https://www.petfinder.com/"}, // ~25 hrs
    {tta: 2.628e+9, url:"https://www.petfinder.com/"}, // ~1 month
    {tta: 7.2e6, url:"https://www.petfinder.com/"} // ~2 hrs
]

const zoom = d3.zoom()
    .scaleExtent( [ 1, 100 ] )
    .translateExtent([[0, 0], [width, height]])
    .on( 'zoom', () => onZoom() )

const svg = d3.select( '#vis-svg-1' )
    .call( zoom )

const max = d3.max(data.map(function(r) { return r.tta }))

const x = d3.scaleLinear()
    .domain([0, max])
    .range([ margin, width-margin ])
    // .clamp(true)
    .nice()

const xAxis = d3.axisBottom()
    .scale( x )

const g = svg.append("g")
    .attr("class", "axis axis--x")
    .call( xAxis )

const dots = svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.tta); } )
    .attr("r", 10)
    .style("fill", "#69b3a2")

// Add the ticks, adjusting unit based on the data
xAxis.tickFormat( tickFormat )

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
        ticks = xAxis.ticks()
        distance = ticks[ticks.length - 1] - ticks[ticks.length - 2]
    } else {
        // Distance between each tick
        distance = ticks[ticks.length - 1] - ticks[ticks.length - 2]
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
