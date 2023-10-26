var margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = 1200 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;

var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

var svg = d3
  .select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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

  const questions = data.reduce((acc, curr) => {
    if (!acc.includes(curr.question)) {
      acc.push(curr.question);
    }
    return acc;
  }, []);

  const filteredData = data.filter(({ question }) => question === questions[2]);

  xScale
    .domain([
      d3.min(data, ({ timestamp }) => timestamp),
      d3.max(data, ({ timestamp }) => timestamp),
    ])
    .nice()
    .tickFormat(50);

  yScale.domain([0, 10]);

  console.log('data', data);

  const points = svg
    .selectAll('circle')
    .data(filteredData)
    .enter()
    .append('circle')
    .attr('r', 15)
    .style('fill', 'red')
    .style('opacity', '0.3')
    .attr('cy', ({ answer }) => yScale(answer))
    .attr('cx', ({ timestamp }) => xScale(timestamp));

  const simulation = d3
    .forceSimulation(points)
    .force(
      'cx',
      d3.forceX((d) => d.x0),
    )
    .force(
      'cy',
      d3.forceY((d) => {
        console.log('test');
        return d.y0;
      }),
    )
    .force(
      'collide',
      d3.forceCollide((d) => d.r),
    );

  for (let i = 0; i < 700; i++) simulation.tick();

  // Add x axis
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('%Y-%m-%d')));

  // Add y axis
  svg.append('g').call(d3.axisLeft(yScale));
});
