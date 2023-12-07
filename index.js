// Get data
d3.csv('./data/responses.csv').then(function (rawData) {
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
    '#fde725',
    '#b5de2b',
    '#6ece58',
    '#35b779',
    '#1f9e89',
    '#26828e',
    '#31688e',
    '#3e4989',
    '#482878',
    '#440154',
  ];

  const sprintDates = [
    new Date('10/08/23'),
    new Date('10/22/23'),
    new Date('11/05/23'),
    new Date('11/19/23'),
    new Date('12/03/23'),
  ];

  const questions = data.reduce((acc, curr) => {
    if (!acc.includes(curr.question)) {
      acc.push(curr.question);
    }
    return acc;
  }, []);

  var margin = { top: 60, right: 30, bottom: 30, left: 30 },
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  const radius = 7;

  var xScale = d3.scaleTime().range([0, width]);

  const datedomain = data.map(({ timestamp }) => timestamp).concat(sprintDates);

  xScale
    .domain([d3.min(datedomain), d3.max(datedomain)])
    .nice()
    .tickFormat(50);

  var yScale = d3.scaleLinear().range([height, 0]);

  yScale.domain([0, 10]);

  for (let step = 0; step < questions.length; step++) {
    const filteredData = data.filter(({ question }) => question === questions[step]);

    // Canvas
    var graph = d3
      .select('body')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Title

    const question = questions[step];
    const maxLength = 70;
    var title = graph
      .append('g')
      .style('font-family', "'Roboto Condensed', sans-serif")
      .style('font-size', '18px');

    title
      .append('g')
      .attr('transform', 'translate(-20, -30)')
      .style('font-weight', 'bold')
      .append('text')
      .text(`${step + 1}.)`);

    title
      .append('g')
      .attr('transform', 'translate(10, -30)')
      .append('text')
      .text(
        `${question.substring(0, maxLength).trim()}${question.length > maxLength ? '... ' : ''}`,
      );

    // Lines

    // middle line
    graph
      .append('line')
      .attr('stroke', '#ddd')
      .style('stroke-width', '1')
      .attr('x1', 0)
      .attr('y1', yScale(5))
      .attr('x2', width)
      .attr('y2', yScale(5));

    // sprint dates
    for (let sprint = 0; sprint < sprintDates.length; sprint++) {
      graph
        .append('line')
        .attr('stroke', '#ddd')
        .style('stroke-width', '1')
        .attr('x1', xScale(sprintDates[sprint]))
        .attr('y1', 0)
        .attr('x2', xScale(sprintDates[sprint]))
        .attr('y2', height);
    }

    // x axis
    graph
      .append('g')
      .style('font-family', "'Roboto Condensed', sans-serif")
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat('%Y-%m-%d')));

    // y axis
    graph
      .append('g')
      .style('font-family', "'Roboto Condensed', sans-serif")
      .call(d3.axisLeft(yScale));

    // circles
    graph
      .selectAll('.circ')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'circ')
      .style('fill', ({ answer }) => colors[10 - answer])
      .attr('r', radius)
      .attr('cx', ({ timestamp }) => xScale(timestamp))
      .attr('cy', ({ answer }) => yScale(answer));

    let simulation = d3
      .forceSimulation(filteredData)
      .force(
        'x',
        d3.forceX(({ timestamp }) => xScale(timestamp)),
      )
      .force(
        'y',
        d3.forceY(({ answer }) => yScale(answer)),
      )
      .force('collide', d3.forceCollide(radius))
      .alphaDecay(0)
      .alpha(0.3)
      .on('tick', () => {
        d3.selectAll('.circ')
          .attr('cx', ({ x }) => x)
          .attr('cy', ({ y }) => y);
      });

    let init_decay = setTimeout(() => {
      simulation.alphaDecay(0.1);
    }, 3000);
  }
});
