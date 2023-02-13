//-----------------Data request----------------
data = {
  movies: {
    name: "Movie Sales",
    description: "Top 100 Highest Grossing Movies Grouped By Genre",
    base: "",
  },
  games: {
    name: "Video Game Sales",
    description: "Top 100 Most Sold Video Games Grouped by Platform",
    base: "",
  },
  kickstarter: {
    name: "Kickstarter Pledges",
    description: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    base: "",
  },
};

(async function getData() {
  data.movies.base = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json").then((response) => response.json());
  data.games.base = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json").then((response) => response.json());
  data.kickstarter.base = kickstarterPledges = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json").then((response) => response.json());
  return buildTreeMap(data.movies);
})();

const buttonBox = d3.select("body").append("div").attr("id", "buttonBox");

function deleteAll() {
  d3.select("#title").remove();
  d3.select("#description").remove();
  d3.select("#svg-container").remove();
}

buttonBox
  .append("button")
  .text("Movies Data Set")
  .on("click", () => {
    deleteAll();
    buildTreeMap(data.movies);
  });

buttonBox
  .append("button")
  .text("Video Game Data Set")
  .on("click", () => {
    deleteAll();
    buildTreeMap(data.games);
  });

buttonBox
  .append("button")
  .text("Kickstarter Data Set")
  .on("click", () => {
    deleteAll();
    buildTreeMap(data.kickstarter);
  });

function buildTreeMap(dataset) {
  //-----------------Data declaration-------------

  let dataHierarchy = d3
    .hierarchy(dataset.base, (elem) => elem.children)
    .sum((subElem) => subElem.value)
    .sort((subElem1, subElem2) => subElem2.value - subElem1.value);

  //-----------------Header---------------------

  d3.select("body").append("text").attr("id", "title").text(dataset.name);

  d3.select("body").append("text").attr("id", "description").text(dataset.description);

  //-----------------Creating main svg element ------------------

  width = 1000;
  height = 500;
  padding = 30;

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
    .interpolator(d3.interpolateRainbow);

  // ------------------Tree map-----------------

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
    .attr("fill", (d) => colorScale(categories.findIndex((elem) => elem === d.data.category)))
    .attr("stroke-width", 0.2)
    .attr("stroke", "black")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .on("mousemove", (e, d) => {
      const tooltipText = `Name: ${d.data.name}\nCategory: ${d.data.category}\nValue: ${dataset.name === "Video Game Sales" ? d.data.value + " mln. copies" : ccyFormat.format(d.data.value)}`;
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
    .append("foreignObject")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("y", (d) => (d.y1 - d.y0) / 10)
    .append("xhtml:div")
    .attr("class", "tileText")
    .text((d) => d.data.name)
    .on("mouseover", (e, d) => {
      const tooltipText = `Name: ${d.data.name}\nCategory: ${d.data.category}\nValue: ${dataset.name === "Video Game Sales" ? d.data.value + " mln. copies" : ccyFormat.format(d.data.value)}`;
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
    .attr("height", rectSide)
    .style("fill", (d, ind) => colorScale(ind));

  outerRectangle

    .append("text")
    .text((d) => d)
    .attr("class", "legendText")
    .style("text-anchor", "middle")
    .attr("x", "50%")
    .attr("y", rectSide - 5);
}

//------------Footer--------------

d3.select("body").append("footer").text("This Treemap Diagram was created using: HTML, CSS, JavaScript and D3 svg-based visualization library");
