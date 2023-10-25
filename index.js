// Set graph margins and dimensions
var margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = 1200 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;

// Set ranges
var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]).nice();
var svg = d3
  .select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Get data
d3.csv('./data/23-10-17.csv').then(function (rawData) {
  console.log('rawData', rawData);

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

  console.log('data', data);

  const questions = data.reduce((acc, curr) => {
    if (!acc.includes(curr.question)) {
      acc.push(curr.question);
    }
    return acc;
  }, []);

  console.log('questions', questions);

  xScale.domain([
    d3.min(data, ({ timestamp }) => timestamp),
    d3.max(data, ({ timestamp }) => timestamp),
  ]);

  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 5)
    .style('fill', 'rgba(0,0,0,0.2)')
    .attr('cx', ({ timestamp }) => {
      console.log('timestamp', timestamp);
      console.log('xScale(timestamp)', xScale(timestamp));
      return xScale(timestamp);
    })
    .attr('cy', ({ answer }) => {
      return yScale(answer);
    });

  // Add x axis
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale));

  // Add y axis
  svg.append('g').call(d3.axisLeft(yScale));
});
