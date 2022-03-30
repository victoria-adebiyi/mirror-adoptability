let prevVal = 0;

const getMilliseconds = (minutes, hours, days, weeks, months) => {
    return  minutes * 60000 +
        hours * 3.6e6 +
        days * 8.64e7 +
        weeks * 6.048e8 +
        months * 2.628e9
}

const getDifference = (sca, pa) => {
    millSca = getMilliseconds(sca[0], sca[1], sca[2], 0, sca[3])
    millPa = getMilliseconds(pa[0], pa[1], pa[2], 0, pa[3])
    return millSca - millPa
}

const timestampToArray = (ts) => {
    ts_month = parseInt(ts.substring(5,7))
    ts_day = parseInt(ts.substring(8,10))
    ts_hour = parseInt(ts.substring(11,13))
    ts_minute = parseInt(ts.substring(14,16))
    return [ts_minute, ts_hour, ts_day, ts_month]
}

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

d3.csv('../data/animals_sample_short.csv', function(data) {

    const differenceMill = getDifference(timestampToArray(data['status_changed_at']), timestampToArray(data['published_at']))
    //const max = d3.max(data.map(function(r) { console.log(r) }))

const getScale = (milliseconds) => {
    console.log(milliseconds / 3.6e6)
    return 20
}

const zoom = d3.zoom()
    .scaleExtent( [ 1, getScale(20) ] ) // was max
    .translateExtent([[0, 0], [width, height]])
    .on( 'zoom', () => onZoom() )

const svg = d3.select( '#vis-svg-1' )
    .call( zoom )

const x = d3.scaleLinear()
    .domain([0, differenceMill])
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
const clicked = (d) => {
    window.open(d['photos'][0]['full'], '_blank')
}

const dots = svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", differenceMill ) // was function (d) { return x(d.tta); }
    .attr("cy", margin)
    .attr("r", 7)
    .style("fill", "#69b3a2")
    .on("click", clicked)

xAxis = d3.axisBottom()
    .scale( x )
    .tickFormat(tickFormat)

function onZoom() {
    // Rescales the axis
    const t = d3.event.transform,
        xt = t.rescaleX( x );
    g.call( xAxis.scale(xt) )
    // Rescale the data points
    dots.attr('cx', differenceMill) // was function (d) { return xt(d.tta) }
    // Clip data that is out of range
    dots.attr('opacity', function (d) {
        if (xt(differenceMill) < margin || xt(differenceMill) > width - margin) { // was d.tta
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
});