const getMilliseconds = (minutes, hours, days, weeks, months) => {
    return  minutes * 60000 +
        hours * 3.6e6 +
        days * 8.64e7 +
        weeks * 6.048e8 +
        months * 2.628e9
}

const width = 800,
    height = 100,
    margin = 50
let prevVal = 0;

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
    return 20
}

// Opens the URL associated with the clicked datapoint
const clicked = (d, i) => {
    window.open(d.url, '_blank')
}

// Get data
d3.csv('./data/animals_sample_cleaned.csv',
    function(d) {
        return {
            'tta': Date.parse(d.status_changed_at) - Date.parse(d.published_at),
            'url': d.url
        };
    })
    .then((d) => timeline(d));

function timeline(data) {
    console.log(data)
    const max = d3.max(data.map(function(r) { return r.tta }))
    console.log("Max " + max)
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
}
