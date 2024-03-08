Promise.all([
    d3.csv("data/life-expectancy-data.csv"),
    d3.csv("data/life-expectancy.csv")
]).then(function(data) {
    let infantDeathsAndLifeExpectancyData = data[0]
        .filter(d => d["Year"] >= 2001 && d["Year"] <= 2015)
        .map(d => ({
            country: d["Country"],
            year: +d["Year"],
            infantDeaths: +d["infant deaths"],
            lifeExpectancy: parseFloat(d["Life expectancy"]) || 0, 
        }));

    let unemploymentData = data[1]
        .filter(d => d["Year"] >= 2001 && d["Year"] <= 2015)
        .map(d => ({
            country: d["Country Name"],
            year: +d["Year"],
            unemployment: +d["Unemployment"],
            Region: d["Region"],
            IncomeGroup: d["IncomeGroup"]
        }));

    // merge based on country name and year
    let mergedData = infantDeathsAndLifeExpectancyData.map(d => {
        let unemploymentObj = unemploymentData.find(e => e.country === d.country && e.year === d.year);
        return {
            ...d,
            ...unemploymentObj
        };
    });

    mergedData = mergedData.filter(d => d.infantDeaths !== undefined && d.lifeExpectancy !== undefined && d.unemployment !== undefined);
    mergedData = mergedData.filter(d => d.lifeExpectancy !== 0 || d.infantDeaths !== 0);

    // merge by region
    let groupedData = d3.nest()
        .key(d => d.Region)
        .entries(mergedData);

    console.log(groupedData);
}).catch(function(error) {
    console.error("Error loading or processing data:", error);
});