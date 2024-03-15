var regionData = {};

var margin1 = { top: 10, right: 30, bottom: 70, left: 50 },
  width1 = 460 - margin1.left - margin1.right,
  height1 = 400 - margin1.top - margin1.bottom;

var svg1 = d3
  .select("#bubble-container")
  .append("svg")
  .attr("width", width1 + margin1.left + margin1.right)
  .attr("height", height1 + margin1.top + margin1.bottom)
  .append("g")
  .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

d3.csv("data/life expectancy.csv", function (data) {
  data = data.filter(function (d) {
    return (
      d["Prevelance of Undernourishment"] !== "" &&
      d["Life Expectancy World Bank"] !== "" &&
      d["Unemployment"] !== ""
    );
  });

  var nestedData = d3
    .nest()
    .key(function (d) {
      return d["Country Name"];
    })
    .entries(data);

  var processedData = [];

  nestedData.forEach(function (countryData) {
    var key = countryData.key;
    var values = countryData.values;

    var sumLifeExpectancy = 0;
    var sumUndernourishment = 0;
    var sumUnemployment = 0;
    var region = values[0]["Region"];

    values.forEach(function (entry) {
      var lifeExpectancy = parseFloat(entry["Life Expectancy World Bank"]);
      var undernourishment = parseFloat(
        entry["Prevelance of Undernourishment"]
      );
      var unemployment = parseFloat(entry["Unemployment"]);
      sumLifeExpectancy += lifeExpectancy;
      sumUndernourishment += undernourishment;
      sumUnemployment += unemployment;
    });

    var avgLifeExpectancy = sumLifeExpectancy / values.length;
    var avgUndernourishment = sumUndernourishment / values.length;
    var avgUnemployment = sumUnemployment / values.length;
    var avgData = {
      "Country Name": key,
      Region: region,
      "Life Expectancy World Bank": avgLifeExpectancy,
      "Prevelance of Undernourishment": avgUndernourishment,
      Unemployment: avgUnemployment,
    };

    processedData.push(avgData);
  });

  data = processedData;

  data.forEach(function (d) {
    regionData[d["Country Name"]] = d.Region;
  });

  console.log("data:", data);
  console.log("regionData:", regionData);

  var x1 = d3.scaleLinear().domain([0, 100]).range([0, width1]);
  svg1
    .append("g")
    .attr("transform", "translate(0," + height1 + ")")
    .call(d3.axisBottom(x1).tickSizeOuter(0));
  svg1
    .append("text")
    .attr(
      "transform",
      "translate(" + width1 / 2 + " ," + (height1 + margin1.top + 30) + ")"
    )
    .style("text-anchor", "middle")
    .text("Prevelance of Undernourishment");

  var y1 = d3.scaleLinear().domain([35, 90]).range([height1, 0]);
  svg1.append("g").call(d3.axisLeft(y1).tickSizeOuter(0));
  svg1
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin1.left)
    .attr("x", 0 - height1 / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Life Expectancy")
    .attr("y", -margin1.left - 5);

  var z1 = d3.scaleLinear().domain([0, 100]).range([2, 50]);

  var myColor1 = d3
    .scaleOrdinal()
    .domain([
      "South Asia",
      "Sub-Saharan Africa",
      "Europe & Central Asia",
      "Middle East & North Africa",
      "Latin America & Caribbean",
      "East Asia & Pacific",
      "North America",
    ])
    .range(d3.schemeSet2);

  var domains1 = [
    "South Asia",
    "Sub-Saharan Africa",
    "Europe & Central Asia",
    "Middle East & North Africa",
    "Latin America & Caribbean",
    "East Asia & Pacific",
    "North America",
  ];
  var colors1 = d3.schemeSet2;

  var legend1 = svg1
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width1 - 150) + ", 10)");

  legend1
    .selectAll("rect")
    .data(domains1)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function (d, i) {
      return i * 15;
    })
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function (d, i) {
      return colors1[i];
    });

  legend1
    .selectAll("text")
    .data(domains1)
    .enter()
    .append("text")
    .attr("x", 15)
    .attr("y", function (d, i) {
      return i * 15 + 9;
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", "10px")
    .attr("alignment-baseline", "middle");

  var tooltip1 = d3
    .select("#bubble-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("color", "white");

  var showTooltip1 = function (d) {
    tooltip1.transition().duration(200);
    tooltip1
      .style("opacity", 1)
      .html(
        "Country: " +
          d["Country Name"] +
          "<br/>" +
          "Life Expectancy: " +
          d["Life Expectancy World Bank"] +
          "<br/>" +
          "Unemployment: " +
          d["Unemployment"] +
          "<br/>" +
          "Prevelance of Undernourishment: " +
          d["Prevelance of Undernourishment"]
      )
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + 20 + "px");
  };

  var moveTooltip1 = function (d) {
    tooltip1
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + 20 + "px");
  };

  var hideTooltip1 = function (d) {
    tooltip1.transition().duration(200).style("opacity", 0);
  };

  svg1
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "bubbles")
    .attr("cx", function (d) {
      return x1(d["Prevelance of Undernourishment"]);
    })
    .attr("cy", function (d) {
      return y1(d["Life Expectancy World Bank"]);
    })
    .attr("r", function (d) {
      return z1(d["Unemployment"]);
    })
    .style("fill", function (d) {
      return myColor1(d["Region"]);
    })
    .on("mouseover", showTooltip1)
    .on("mousemove", moveTooltip1)
    .on("mouseleave", hideTooltip1);
});

var margin = { top: 10, right: 30, bottom: 70, left: 50 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var svg = d3
  .select("#bubble-container2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/Life Expectancy Data.csv", function (data) {
  data.forEach(function (d) {
    d["infant deaths"] = +d["infant deaths"];
    d["Polio"] = +d["Polio"];
    d["GDP"] = +d["GDP"];
  });

  var nestedData = d3
    .nest()
    .key(function (d) {
      return d["Country"];
    })
    .entries(data);

  var processedData = [];

  nestedData.forEach(function (countryData) {
    var key = countryData.key;
    var values = countryData.values;

    var sumInfantDeaths = 0;
    var sumPolio = 0;
    var sumGDP = 0;
    var region;

    values.forEach(function (entry) {
      region = regionData[entry.Country];
      sumInfantDeaths += entry["infant deaths"];
      sumPolio += entry["Polio"];
      sumGDP += entry["GDP"];
    });

    var avgInfantDeaths = sumInfantDeaths / values.length;
    var avgPolio = sumPolio / values.length;
    var avgGDP = sumGDP / values.length;
    var avgData = {
      Country: key,
      Region: region,
      "infant deaths": avgInfantDeaths,
      Polio: avgPolio,
      GDP: avgGDP,
    };

    processedData.push(avgData);
  });

  console.log("processedData:", processedData);

  var x = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(processedData, function (d) {
        return d["GDP"];
      }),
    ])
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));
  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 30) + ")"
    )
    .style("text-anchor", "middle")
    .text("GDP");

  var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y).tickSizeOuter(0));
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Polio")
    .attr("y", -margin.left - 5);

  var z = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(processedData, function (d) {
        return d["infant deaths"];
      }),
    ])
    .range([5, 40]);

  var myColor1 = d3
    .scaleOrdinal()
    .domain([
      "South Asia",
      "Sub-Saharan Africa",
      "Europe & Central Asia",
      "Middle East & North Africa",
      "Latin America & Caribbean",
      "East Asia & Pacific",
      "North America",
    ])
    .range(d3.schemeSet2);

  var domains1 = [
    "South Asia",
    "Sub-Saharan Africa",
    "Europe & Central Asia",
    "Middle East & North Africa",
    "Latin America & Caribbean",
    "East Asia & Pacific",
    "North America",
  ];
  var colors1 = d3.schemeSet2;

  var legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 150) + ", 100)");

  legend
    .selectAll("rect")
    .data(domains1)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function (d, i) {
      return i * 15;
    })
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function (d, i) {
      return colors1[i];
    });

  legend
    .selectAll("text")
    .data(domains1)
    .enter()
    .append("text")
    .attr("x", 15)
    .attr("y", function (d, i) {
      return i * 15 + 9;
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", "10px")
    .attr("alignment-baseline", "middle");

  var tooltip = d3
    .select("#bubble-container2")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("color", "white");

  var showTooltip = function (d) {
    tooltip.transition().duration(200);
    tooltip
      .style("opacity", 1)
      .html(
        "Country: " +
          d.Country +
          "<br/>" +
          "Infant Deaths: " +
          d["infant deaths"] +
          "<br/>" +
          "Polio: " +
          d.Polio +
          "<br/>" +
          "GDP: " +
          d.GDP
      )
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + 20 + "px");
  };

  var moveTooltip = function (d) {
    tooltip
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + 20 + "px");
  };

  var hideTooltip = function (d) {
    tooltip.transition().duration(200).style("opacity", 0);
  };

  svg
    .selectAll("dot")
    .data(processedData)
    .enter()
    .append("circle")
    .attr("class", "bubbles")
    .attr("cx", function (d) {
      return x(d.GDP);
    })
    .attr("cy", function (d) {
      return y(d.Polio);
    })
    .attr("r", function (d) {
      return z(d["infant deaths"]);
    })
    .style("fill", function (d) {
      return myColor1(d.Region);
    })
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip);
});
