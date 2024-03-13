let lifeExpectancySVG, infantDeathsSVG;

function initializeLifeExpectancyDiagram(data) {
    let infantDeathsAndLifeExpectancyData = data[0]
        .filter(d => d["Year"] === "2015") 
        .map(d => ({
            country: d["Country"],
            infantDeaths: +d["infant deaths"],
            lifeExpectancy: parseFloat(d["Life expectancy"]) || 0,
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

    mergedData = mergedData.filter(d => d.lifeExpectancy !== 0);
    mergedData = mergedData.filter(d => d.infantDeaths !== 0);
    mergedData = mergedData.filter(d => (d.Region || d.unemployment));

    // sort merged data by region
    mergedData.sort((a, b) => a.Region.localeCompare(b.Region));

    // merge 
    let unemploymentGroups = Array.from({ length: 21 }, (_, i) => i); 

    let groupedData = unemploymentGroups.map((unemploymentRate, index) => ({
        unemploymentRate: unemploymentRate,
        countries: mergedData.filter(d => Math.floor(d.unemployment) === unemploymentRate)
    }));

    // link 
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

    var margin = { top: 10, right: 30, bottom: 250, left: 60 },
        width = 1100 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    lifeExpectancySVG = d3.select("#life_expectancy_diagram")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 100 + ")");

    var allRegions = [...new Set(mergedData.map(d => d.Region))];

    var color = d3.scaleOrdinal()
        .domain(allRegions)
        .range(d3.schemeSet3);

    // linear scale based on life expectancy
    var size = d3.scaleLinear()
        .domain([0, d3.max(mergedData, d => d.lifeExpectancy)])
        .range([1, 15]); 

    // linear scale for position
    var x = d3.scalePoint()
        .range([0, width])
        .domain(mergedData.map(d => d.country))
        .padding(2);

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    var mouseover = function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Country: " + d.country + "<br/>Region: " + d.Region + "<br/>Life Expectancy: " + d.lifeExpectancy + "<br/>Unemployment Rate: " + d.unemployment)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
    };

    var mouseout = function(d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    };

    // link between nodes
    groupedData.forEach((group, index) => {
        lifeExpectancySVG.selectAll(`mylinks-${index}`) 
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

    var largerNodes = lifeExpectancySVG.selectAll(".largerNodes")
        .data(mergedData.filter(d => size(d.lifeExpectancy) >= 20))
        .enter()
        .append("circle")
        .attr("class", "largerNodes")
        .attr("cx", function(d) { return x(d.country) })
        .attr("cy", height - 30)
        .attr("r", function(d) { return size(d.lifeExpectancy) })
        .style("fill", function(d) { return color(d.Region) })
        .attr("stroke", "white")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    var smallerNodes = lifeExpectancySVG.selectAll(".smallerNodes")
        .data(mergedData.filter(d => size(d.lifeExpectancy) < 20))
        .enter()
        .append("circle")
        .attr("class", "smallerNodes")
        .attr("cx", function(d) { return x(d.country) })
        .attr("cy", height - 30)
        .attr("r", function(d) { return size(d.lifeExpectancy) })
        .style("fill", function(d) { return color(d.Region) })
        .attr("stroke", "white")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    var labels = lifeExpectancySVG.selectAll(".mylabels")
        .data(mergedData)
        .enter()
        .append("text")
        .attr("class", "mylabels")
        .attr("x", 0)
        .attr("y", 0)
        .text(function(d) { return d.country })
        .style("text-anchor", "end")
        .attr("transform", function(d) { return "translate(" + (x(d.country)) + "," + (height - 15) + ")rotate(-45)" })
        .style("font-size", 12);

    lifeExpectancySVG.selectAll("circle, text")
        .on('mouseover', function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);

            // find linked countries by unemployment rate
            let linkedCountries = links.filter(link => link.source.country === d.country || link.target.country === d.country)
                .map(link => link.source.country === d.country ? link.target.country : link.source.country);

            let tooltipContent = "Country: " + d.country + "<br/>Region: " + d.Region + "<br/>Life Expectancy: " + d.lifeExpectancy + "<br/>Unemployment Rate: " + d.unemployment + "%";
            
            if (linkedCountries.length > 0) {
                tooltipContent += "<br/>Linked Countries: " + linkedCountries.join(", ");
            }

            tooltip.html(tooltipContent)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");

            largerNodes.style('opacity', n => (n === d) ? 1 : .2);
            smallerNodes.style('opacity', n => (n === d) ? 1 : .2);
            d3.select(this).style('opacity', 1);

            lifeExpectancySVG.selectAll('path')
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
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);

            largerNodes.style('opacity', 1);
            smallerNodes.style('opacity', 1);
            lifeExpectancySVG.selectAll('path')
                .style('stroke', 'black')
                .style('opacity', 1);

            labels.style('opacity', 1)
                .style('font-size', 12);
    });

    // title
    lifeExpectancySVG.append("text")
        .attr("x", (width / 2))             
        .attr("y", -80)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "underline")  
        .text("Global Count of Life Expectancy & Unemployment Rate in 2015");

    // legend
    var legend = lifeExpectancySVG.selectAll(".legend")
        .data(allRegions)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (height + 40 + i * 20) + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
}

// infant deaths diagram
function initializeInfantDeathsDiagram(data) {
    let infantDeathsAndLifeExpectancyData = data[0]
        .filter(d => d["Year"] === "2015") 
        .map(d => ({
            country: d["Country"],
            infantDeaths: +d["infant deaths"],
            lifeExpectancy: parseFloat(d["Life expectancy"]) || 0,
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

    mergedData = mergedData.filter(d => d.lifeExpectancy !== 0);
    mergedData = mergedData.filter(d => d.infantDeaths !== 0);
    mergedData = mergedData.filter(d => (d.Region || d.unemployment));

    // sort merged data by region
    mergedData.sort((a, b) => a.Region.localeCompare(b.Region));

    // merge 
    let unemploymentGroups = Array.from({ length: 21 }, (_, i) => i); 

    let groupedData = unemploymentGroups.map((unemploymentRate, index) => ({
        unemploymentRate: unemploymentRate,
        countries: mergedData.filter(d => Math.floor(d.unemployment) === unemploymentRate)
    }));

    // link 
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

    var margin = { top: 10, right: 30, bottom: 250, left: 60 },
        width = 1100 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    infantDeathsSVG = d3.select("#infant_deaths_diagram")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 100 + ")");

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

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    var mouseover = function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Country: " + d.country + "<br/>Region: " + d.Region + "<br/>Infant Deaths: " + d.infantDeaths + "<br/>Unemployment Rate: " + d.unemployment)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY -30) + "px");
    };

    var mouseout = function(d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    };

    // link between nodes
    groupedData.forEach((group, index) => {
        infantDeathsSVG.selectAll(`mylinks-${index}`) 
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

    var largerNodes = infantDeathsSVG.selectAll(".largerNodes")
        .data(mergedData.filter(d => size(d.infantDeaths) >= 20))
        .enter()
        .append("circle")
        .attr("class", "largerNodes")
        .attr("cx", function(d) { return x(d.country) })
        .attr("cy", height - 30)
        .attr("r", function(d) { return size(d.infantDeaths) })
        .style("fill", function(d) { return color(d.Region) })
        .attr("stroke", "white")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    var smallerNodes = infantDeathsSVG.selectAll(".smallerNodes")
        .data(mergedData.filter(d => size(d.infantDeaths) < 20))
        .enter()
        .append("circle")
        .attr("class", "smallerNodes")
        .attr("cx", function(d) { return x(d.country) })
        .attr("cy", height - 30)
        .attr("r", function(d) { return size(d.infantDeaths) })
        .style("fill", function(d) { return color(d.Region) })
        .attr("stroke", "white")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    var labels = infantDeathsSVG.selectAll(".mylabels")
        .data(mergedData)
        .enter()
        .append("text")
        .attr("class", "mylabels")
        .attr("x", 0)
        .attr("y", 0)
        .text(function(d) { return d.country })
        .style("text-anchor", "end")
        .attr("transform", function(d) { return "translate(" + (x(d.country)) + "," + (height - 15) + ")rotate(-45)" })
        .style("font-size", 12);

    infantDeathsSVG.selectAll("circle, text")
        .on('mouseover', function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);

            // find linked countries by unemployment rate
            let linkedCountries = links.filter(link => link.source.country === d.country || link.target.country === d.country)
                .map(link => link.source.country === d.country ? link.target.country : link.source.country);

            let tooltipContent = "Country: " + d.country + "<br/>Region: " + d.Region + "<br/>Infant Deaths: " + d.infantDeaths + "<br/>Unemployment Rate: " + d.unemployment + "%";
            
            if (linkedCountries.length > 0) {
                tooltipContent += "<br/>Linked Countries: " + linkedCountries.join(", ");
            }

            tooltip.html(tooltipContent)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");

            largerNodes.style('opacity', n => (n === d) ? 1 : .2);
            smallerNodes.style('opacity', n => (n === d) ? 1 : .2);
            d3.select(this).style('opacity', 1);

            infantDeathsSVG.selectAll('path')
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
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);

            largerNodes.style('opacity', 1);
            smallerNodes.style('opacity', 1);
            infantDeathsSVG.selectAll('path')
                .style('stroke', 'black')
                .style('opacity', 1);

            labels.style('opacity', 1)
                .style('font-size', 12);
    });

    // title
    infantDeathsSVG.append("text")
        .attr("x", (width / 2))             
        .attr("y", -80)
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "underline")  
        .text("Global Count of Infant Deaths & Unemployment Rate in 2015");

    // legend
    var legend = infantDeathsSVG.selectAll(".legend")
        .data(allRegions)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (height + 40 + i * 20) + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
}

// switch between the two diagrams
function switchDiagram(diagram) {
    if (diagram === "life_expectancy") {
        document.getElementById("infant_deaths_diagram").style.display = "none";
        document.getElementById("life_expectancy_diagram").style.display = "block";
    } else if (diagram === "infant_deaths") {
        document.getElementById("life_expectancy_diagram").style.display = "none";
        document.getElementById("infant_deaths_diagram").style.display = "block";
    }
}

Promise.all([
    d3.csv("data/life-expectancy-data.csv"),
    d3.csv("data/life-expectancy.csv")
]).then(function(data) {
    initializeLifeExpectancyDiagram(data);
    initializeInfantDeathsDiagram(data);
}).catch(function(error) {
    console.log("Error loading CSV files:", error);
});

document.getElementById("infant_deaths_diagram").style.display = "none";

document.getElementById("life_expectancy_btn").addEventListener("click", function() {
    switchDiagram("life_expectancy");
});

document.getElementById("infant_deaths_btn").addEventListener("click", function() {
    switchDiagram("infant_deaths");
});