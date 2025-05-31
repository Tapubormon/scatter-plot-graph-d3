
const svg = d3.select("#chart");
    const tooltip = d3.select("#tooltip");
    const legend = d3.select("#legend");

    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 60, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Fetch and process data
    d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then(data => {
      data.forEach(d => {
        d.Year = new Date(d.Year, 0);
        const [minutes, seconds] = d.Time.split(":").map(Number);
        d.Time = new Date(1970, 0, 1, 0, minutes, seconds);
      });

      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Year))
        .range([0, innerWidth]);

      const yScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Time))
        .range([0, innerHeight]);

      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%Y"));

      const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat("%M:%S"));

      const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // X-axis
      chartGroup.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis);

      // Y-axis
      chartGroup.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

      // Dots
      chartGroup.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Time))
        .attr("r", 5)
        .attr("data-xvalue", d => d.Year.getFullYear())
        .attr("data-yvalue", d => d.Time.toISOString())
        .attr("fill", d => d.Doping ? "#3c69bb" : "#e4e72c")
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.Name}</strong> (${d.Nationality})<br/>
               Year: ${d.Year.getFullYear()}, Time: ${d3.timeFormat("%M:%S")(d.Time)}<br/>
               ${d.Doping ? d.Doping : "No doping allegations"}`
            )
            .attr("data-year", d.Year.getFullYear())
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      // Legend
      const legendData = [
        { label: "No doping allegations", color: "#e4e72c" },
        { label: "Riders with doping allegations", color: "#3c69bb" }
      ];

      const legendGroup = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${width - 200}, ${margin.top})`);

      legendGroup.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 25)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => d.color);

      legendGroup.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 25)
        .attr("y", (d, i) => i * 25 + 13)
        .text(d => d.label);
    });