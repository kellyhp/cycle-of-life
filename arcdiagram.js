Promise.all([
    d3.csv("data/life-expectancy-data.csv"),
    d3.csv("data/life-expectancy.csv")
]).then(function(data) {
    let infantDeathsAndLifeExpectancyData = data[0]
        .filter(d => d["Year"] === "2015") 
        .map(d => ({
            country: d["Country"],
            infantDeaths: +d["infant deaths"],
        }));

    let unemploymentData = data[1]
        .filter(d => d["Year"] === "2015") 
        .map(d => ({
            country: d["Country Name"],
            Region: d["Region"],
            unemployment: Math.floor(+d["Unemployment"]),
        }));

    // merge by country name
    let mergedData = infantDeathsAndLifeExpectancyData.map(d => {
        let unemploymentObj = unemploymentData.find(e => e.country === d.country);
        return {
            ...d,
            ...unemploymentObj
        };
    });

    mergedData = mergedData.filter(d => d.infantDeaths !== 0);
    mergedData = mergedData.filter(d => (d.Region || d.unemployment));

    // Sort merged data by region
    mergedData.sort((a, b) => a.Region.localeCompare(b.Region));

    // merge by unemployment rate
    let unemploymentGroups = Array.from({ length: 21 }, (_, i) => i); 

    let groupedData = unemploymentGroups.map((unemploymentRate, index) => ({
        unemploymentRate: unemploymentRate,
        countries: mergedData.filter(d => d.unemployment === unemploymentRate)
    }));

    // link for unemployment 
    let links = [];
    groupedData.forEach(group => {
        let countries = group.countries;
        for (let i = 0; i < countries.length; i++) {
            for (let j = i + 1; j < countries.length; j++) {
                links.push({ source: countries[i], target: countries[j] });
            }
        }
    });

    console.log(links);

    var margin = { top: 10, right: 30, bottom: 200, left: 60 },
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var svg = d3.select("#arc_diagram")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var allRegions = [...new Set(mergedData.map(d => d.Region))];

    var color = d3.scaleOrdinal()
        .domain(allRegions)
        .range(d3.schemeSet3);

    // linear scale based on infant deaths
    var size = d3.scaleLinear()
        .domain([0, d3.max(mergedData, d => d.infantDeaths)])
        .range([10, 50]); 

    // linear scale for position
    var x = d3.scalePoint()
        .range([0, width])
        .domain(mergedData.map(d => d.country))
        .padding(2);

    // links
    groupedData.forEach((group, index) => {
        svg.selectAll(`mylinks-${index}`) 
            .data(links.filter(d => {
                return group.countries.includes(d.source) && group.countries.includes(d.target);
            }))
            .enter()
            .append('path')
            .attr('d', function(d) {
                let sourceX = x(d.source.country);
                let targetX = x(d.target.country);

                return ['M', sourceX, height-30,    
                'A',                            
                (sourceX - targetX)/2, ',',   
                (sourceX - targetX)/2, 0, 0, ',',
                sourceX < targetX ? 1 : 0, targetX, ',', height-30] 
                .join(' ');
            })
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', 1);
    });

    // Append nodes for larger circles first
    var largerNodes = svg.selectAll("largerNodes")
        .data(mergedData.filter(d => size(d.infantDeaths) >= 20))
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.country) })
        .attr("cy", height - 30)
        .attr("r", function(d) { return size(d.infantDeaths) })
        .style("fill", function(d) { return color(d.Region) })
        .attr("stroke", "white");

    // Append nodes for smaller circles next
    var smallerNodes = svg.selectAll("smallerNodes")
        .data(mergedData.filter(d => size(d.infantDeaths) < 20))
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.country) })
        .attr("cy", height - 30)
        .attr("r", function(d) { return size(d.infantDeaths) })
        .style("fill", function(d) { return color(d.Region) })
        .attr("stroke", "white");

    var labels = svg.selectAll("mylabels")
        .data(mergedData)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .text(function(d) { return d.country })
        .style("text-anchor", "end")
        .attr("transform", function(d) { return "translate(" + (x(d.country)) + "," + (height - 15) + ")rotate(-45)" })
        .style("font-size", 12);

    svg.selectAll("circle, text")
        .on('mouseover', function(d) {
            largerNodes.style('opacity', n => (n === d) ? 1 : .2);
            smallerNodes.style('opacity', n => (n === d) ? 1 : .2);
            d3.select(this).style('opacity', 1);

            svg.selectAll('path')
                .style('stroke', function(link_d) {
                    if (link_d.source.country === d.country || link_d.target.country === d.country) {
                        return color(d.Region); 
                    } else {
                        return 'black'; 
                    }
                })
                .style('opacity', link_d => (link_d.source.country === d.country || link_d.target.country === d.country) ? 1 : 0.2)
                .style('stroke-width', link_d => (link_d.source.country === d.country || link_d.target.country === d.country) ? 4 : 1); 

            labels.style('opacity', n => (n === d) ? 1 : .2)
                .style('font-size', n => (n === d) ? 18 : 12);
        })
        .on('mouseout', function(d) {
            largerNodes.style('opacity', 1);
            smallerNodes.style('opacity', 1);
            svg.selectAll('path')
                .style('stroke', 'black')
                .style('opacity', 1);

            labels.style('opacity', 1)
                .style('font-size', 12);
    });
}).catch(function(error) {
    // Handle any errors that occur during loading or processing the data
    console.error("Error loading or processing data:", error);
});
