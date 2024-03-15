const width = 1000
const height = 1000

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 40, right: 30, bottom: 10, left: 70},
    scatterWidth = width - scatterMargin.left - scatterMargin.right,
    scatterHeight = height-100 - scatterMargin.top - scatterMargin.bottom;

// CHOROPLETH MAP
    const svg = d3.select("svg")

    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterLeft}, ${scatterTop})`)

    g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", 150)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Life Expectancy Across The World")

    // Map and projection
    var path = d3.geoPath();
    var projection = d3.geoMercator()
    .scale(70)
    .center([0,20])
    .translate([scatterWidth / 2, scatterHeight / 2]);

    // Data and color scale
    var data = d3.map();
    var colorScale = d3.scaleThreshold()
    .domain([55, 60, 65, 70, 75, 85])
    .range(d3.schemeBlues[7]);

    // Load external data and boot
    d3.queue()
        .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .defer(d3.csv, "data/life-expectancy.csv", function(d) { data.set(d["Country Code"], Math.round(d["Life Expectancy World Bank"])); })
        .await(ready);

    function ready(error, topo) {
        let mouseOver = function(d) {
            // Calculate tooltip position
            var tooltipX = d3.event.pageX;
            var tooltipY = d3.event.pageY;

            // Show tooltip
            d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("left", tooltipX + "px")
                .style("top", tooltipY + "px")
                .html("<strong>Country:</strong> " + d.properties.name + "<br><strong>Life Expectancy:</strong> " + (data.get(d.id) ? data.get(d.id) : "Data not available"));

            // Highlight the hovered country
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .5);
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black");
        };

        let mouseLeave = function(d) {
            // Remove tooltip
            d3.select(".tooltip").remove();

            // Reset country opacity and stroke
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .8);
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "transparent");
        };

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = data.get((d.id)) || 0;
                return colorScale((d.total));
            })
            .style("stroke", "transparent")
            .attr("class", function(d){ return "Country" } )
            .style("opacity", .8)
            .on("mouseover", mouseOver )
            .on("mouseleave", mouseLeave );

            var legend = svg.selectAll(".legend")
            .data(colorScale.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + (scatterHeight - 20 - i * 20) + ")"; });
    
        legend.append("rect")
            .attr("x", scatterWidth - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return colorScale(d); });
    
        legend.append("text")
            .attr("x", scatterWidth - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return "≥ " + d; });
    } 

    console.log(data);
