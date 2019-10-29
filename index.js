// set the dimensions and margins of the graph
var margin = { top: 60, right: 30, bottom: 30, left: 30 },
  width = 1200,
  height = 825;

const title = "United States Educational Attainment";
const desc =
  "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)";

var path = d3.geoPath();

// append the svg object to the body of the page
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("title", title)
  .attr("description", desc)
  .attr("width", width - margin.left - margin.right)
  .attr("height", height - margin.top - margin.bottom)
  .append("g")
  .attr("transform",
  "translate(60,"+margin.top +")")
 

//draw counties

const drawChart = (us, edu) => {
  //get min and max
  const minEducation = d3.min(edu, edu => edu.bachelorsOrHigher);
  const maxEducation = d3.max(edu, edu => edu.bachelorsOrHigher);

  console.log(minEducation);
  console.log(maxEducation);

  //set up the scales
  const x = d3
    .scaleLinear()
    .domain([minEducation, maxEducation])
    .rangeRound([600, 850]);

  const color = d3
    .scaleThreshold()
    .domain(
      d3.range(minEducation, maxEducation, (maxEducation - minEducation) / 8)
    )
    .range(d3.schemeBlues[9]);

    //
const heading = svg.append('g')



heading
.append('text')
.text(title)
.attr("font-family", "sans-serif")
.attr("font-size", "40px")
.attr("fill", "grey")
.style("text-anchor", "center")
.attr("transform",
"translate(220,0)")

heading
.append('text')
.text(desc)
.attr("font-family", "sans-serif")
.attr("font-size", "16px")
.attr("fill", "grey")
.style("text-anchor", "center")
.attr("transform",
"translate(235,35)")

  //attach the legend
  const g = svg
    .append("g")
    .attr("class", "key")
    .attr("id", "legend")
    .attr("transform", "translate(0,60)");

  g.selectAll("rect")
    .data(
      color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("x", function(d) {
      return x(d[0]);
    })
    .attr("width", function(d) {
      return x(d[1]) - x(d[0]);
    })
    .attr("fill", function(d) {
      return color(d[0]);
    });

  g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold");

  g.call(
    d3
      .axisBottom(x)
      .tickSize(13)
      .tickFormat(function(x) {
        return Math.round(x) + "%";
      })
      .tickValues(color.domain())
  )
    .select(".domain")
    .remove();

  // attach the tooltip

  const tooltip = d3
    .select("#chart")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")

    .style("opacity", 0);

  

  // mouse handlers

  const handleMouseOver = function(d, i) {
    const eduData = edu.find(o => o.fips === d.id)

    d3.select(this)
      .transition()
      .duration("0")
      .attr("opacity", ".85")
      .attr("fill", "grey");

    tooltip
      .transition("0")
      .style("opacity", "0.9")
      .style("left", event.clientX + 20+"px")
      .style("top", event.clientY -30 + "px")
      .attr('data-education', eduData.bachelorsOrHigher)
    tooltip.html(`${eduData.area_name}, ${eduData.state} <br/> ${eduData.bachelorsOrHigher}`);
  };

  const handleMouseOut = function(d, i) {
    d3.select(this)
      .transition()
      .duration("")
      .attr("opacity", "1")
      .attr("fill", d =>
        color(edu.find(o => o.fips === d.id).bachelorsOrHigher)
      );
    tooltip.transition("0").style("opacity", 0);
  };

  //create the counties

  svg
    .append("g")
    .attr("id", "Counties")
    .attr("transform",
"translate(0,30)")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("fill", d => color(edu.find(o => o.fips === d.id).bachelorsOrHigher))
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("data-education", d => {
      return edu.find(o => o.fips === d.id).bachelorsOrHigher;
    })
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .attr("d", path);

  //overlay the state borders
  svg
    .append("path")
    .attr("transform",
    "translate(0,30)")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("id", "States")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("d", path);
};

// const counties = fetch(
//   "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
// )
//   .then(response => response.json())
//   .then(json => {
//     drawCounties(json);
//   })
//   .catch(error => console.log(error));

//fetch data and draw char
(async function main() {
  try {
    let [counties, eduction] = await Promise.all([
      fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
      ).then(response => response.json()),
      fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
      ).then(response => response.json())
    ]);
    drawChart(counties, eduction);
  } catch (err) {
    console.log(err);
  }
})();
