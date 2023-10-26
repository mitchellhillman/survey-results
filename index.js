// Get data
d3.csv('./data/23-10-17.csv').then(function (rawData) {
  const data = rawData
    .map((response) => {
      const timestamp = response['Timestamp'];
      return Object.keys(response).reduce((acc, key) => {
        if (key !== 'Timestamp') {
          acc.push({
            question: key,
            answer: Number(response[key]),
            timestamp: new Date(timestamp),
          });
        }
        return acc;
      }, []);
    })
    .flat();

  const colors = [
    '#ea5545',
    '#f46a9b',
    '#ef9b20',
    '#edbf33',
    '#ede15b',
    '#bdcf32',
    '#87bc45',
    '#27aeef',
    '#b33dc6',
  ];

  const questions = data.reduce((acc, curr) => {
    if (!acc.includes(curr.question)) {
      acc.push(curr.question);
    }
    return acc;
  }, []);

  var margin = { top: 60, right: 20, bottom: 30, left: 40 },
    width = 560 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
  const radius = 5;
  var xScale = d3.scaleTime().range([0, width]);

  xScale
    .domain([
      d3.min(data, ({ timestamp }) => timestamp),
      d3.max(data, ({ timestamp }) => timestamp),
    ])
    .nice()
    .tickFormat(50);

  var yScale = d3.scaleLinear().range([height, 0]);

  yScale.domain([0, 10]);

  for (let step = 0; step < questions.length; step++) {
    const filteredData = data.filter(({ question }) => question === questions[step]);

    var graph = d3
      .select('body')
      .append('svg')
      .style('float', 'left')
      .style('margin', '20px')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    graph
      .append('g')
      .attr('transform', 'translate(-20, -30)')
      .style('font-family', 'sans-serif')
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .append('text')
      .text(step + 1 + '.) ' + questions[step]);

    graph
      // .attr('transform', 'translate(-20, -30)')
      .append('line')
      .attr('stroke', '#ddd')
      .attr('x1', 0)
      .attr('y1', yScale(5))
      .attr('x2', width)
      .attr('y2', yScale(5));

    graph
      .selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('r', radius)
      .style('fill', colors[step])
      .style('stroke', '#fff')
      .style('stroke-width', '1')
      .style('opacity', '1')
      .attr('cy', ({ answer }) => yScale(answer))
      .attr('cx', ({ timestamp }) => xScale(timestamp));

    // Add x axis
    graph
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('%Y-%m-%d')));

    // Add y axis
    graph.append('g').call(d3.axisLeft(yScale));
  }
});
