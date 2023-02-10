//-----------------Data request----------------
(async function getData() {
  const kickstarterPledges = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json").then((response) => response.json());
  const movieSales = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json").then((response) => response.json());
  const videoGameSales = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json").then((response) => response.json());
  return buildTreeMap(kickstarterPledges, movieSales, videoGameSales);
})();

function buildTreeMap(kickstarter, movies, games) {
  //-----------------Header---------------------

  d3.select("body").append("text").attr("id", "title").text("Video Game Sales");

  d3.select("body").append("text").attr("id", "description").text("Top 100 Most Sold Video Games Grouped by Platform");

  //-----------------Creating main svg element ------------------

  width = 1000;
  height = 500;
  padding = 30;

  let dataHierarchy = d3
    .hierarchy(movies, (elem) => elem.children)
    .sum((subElem) => subElem.value)
    .sort((subElem1, subElem2) => subElem2.value - subElem1.value);

  console.log("dataHieratchy", dataHierarchy);

  const svgContainer = d3.select("body").append("div").attr("id", "svg-container");
  const svg = svgContainer.append("svg").attr("width", width).attr("height", height);

  const treeMap = d3.treemap().size([width, height]);
  treeMap(dataHierarchy);

  const leaves = dataHierarchy.leaves();

  //----------------Scaling-----------------

  let categories = [];
  for (elem in leaves) {
    let category = leaves[elem].data.category;
    if (!categories.includes(category)) categories.push(category);
  }

  const colorScale = d3
    .scaleSequential()
    .domain([0, categories.length - 1])
    .interpolator(d3.interpolateSpectral);

  // ------------------Bar Chart-----------------

  let tooltip = d3.select("body").append("div").attr("id", "tooltip");

  const ccyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const mainRectangle = svg
    .selectAll("g")
    .data(leaves)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(` + d.x0 + ", " + d.y0 + ")");

  mainRectangle
    .append("rect")
    .attr("class", "tile")
    .attr("fill", (d) => {
      return colorScale(categories.findIndex((elem) => elem === d.data.category));
    })
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .on("mousemove", (e, d) => {
      const tooltipText = `Name: ${d.data.name}\nCategory: ${d.data.category}\nValue: ${ccyFormat.format(d.data.value)}`;
      tooltip
        .style("opacity", 1)
        .text(tooltipText)
        .style("left", e.pageX + 9 + "px")
        .style("top", e.pageY - 15 + "px")
        .attr("data-value", d.data.value);
    })
    .on("mouseout", (event, d) => {
      tooltip
        .style("opacity", "0%")
        .style("left", -2000 + "px")
        .style("top", -2000 + "px");
    });

  mainRectangle
    .append("text")
    .attr("class", "tileText")
    .text((d) => d.data.name)
    .attr("x", 5)
    .attr("y", 20);

  //-----------Legend--------------
  let rectSide = 20;

  const legend = svgContainer.append("svg").attr("id", "legend").attr("width", 150).attr("height", height);

  const outerRectangle = legend
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", (d, ind) => `translate(0, ${(height - rectSide * categories.length) / 2 + rectSide * ind})`);

  outerRectangle
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", "100%")
    .attr("height", (d, ind) => rectSide)
    .style("fill", (d, ind) => colorScale(ind));

  outerRectangle
    .append("text")
    .text((d) => d)
    .style("text-anchor", "middle")
    .attr("x", "50%")
    .attr("y", rectSide - 5);

  //------------Footer--------------

  d3.select("body").append("footer").text("This Treemap Diagram was created using: HTML, CSS, JavaScript and D3 svg-based visualization library");
}
