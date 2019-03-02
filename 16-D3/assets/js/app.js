// @TODO: YOUR CODE HERE!
// Setup SVG
var svgWidth = 800;
var svgHeight = 600;
var margin = {
    top: 50,
    right: 50,
    bottom: 100,
    left: 120
};
var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.right - margin.left;
var svg = d3.select('#scatter')
    .append('svg')
    .classed('chart', true)
    .attr('width', svgWidth)
    .attr('height', svgHeight);
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Initial setup for x and y axis
var chosenXaxis = "income";
var chosenYaxis = "obesity";

// Create xScale function
function createXScale(healthData, chosenXaxis) {
    var xScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXaxis]) * .9, d3.max(healthData, d => d[chosenXaxis]) * 1.1])
        .range([0, width]);
    return xScale;
}

// Render xAxis function
function renderXAxis(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Create yScale function
function createYScale(healthData, chosenYaxis) {
    var yScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYaxis]) * .9, d3.max(healthData, d => d[chosenYaxis]) * 1.1])
        .range([height, 0]);
    return yScale;
}

// Render yAxis function
function renderYAxis(newYscale, yAxis) {
    var leftAxis = d3.axisLeft(newYscale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Render circles function
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[chosenXaxis]))
        .attr('cy', d => newYScale(d[chosenYaxis]));
    return circlesGroup;
}

// Render text function
function renderText(circleText, newXScale, chosenXaxis, newYScale, chosenYaxis) {
    circleText.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[chosenXaxis]))
        .attr('y', d => newYScale(d[chosenYaxis]));
    return circleText;
}

// Change active axis label function
function activeAxis(axisLabels, chosenAxis) {
    axisLabels.forEach(function(label) {
        if (label.attr('value') === chosenAxis) {
            label 
                .classed('active', true)
                .classed('inactive', false);
        }
        else {
            label
                .classed('active', false)
                .classed('inactive', true);
        }
    })
}

// Change tooltips function
function toolTips(xAxisValue, yAxisValue, xAxisValues, yAxisValues, xLabelDescriptions, yLabelDescriptions, circlesGroup, circleText){
    var xLabelIndex =  xAxisValues.indexOf(xAxisValue);
    var yLabelIndex = yAxisValues.indexOf(yAxisValue);
    var xLabel = xLabelDescriptions[xLabelIndex];
    var yLabel = yLabelDescriptions[yLabelIndex];
    var toolTip = d3.tip()
        .attr('class','d3-tip')
        .html(function(d) {
            return (`${d.state}<br>${xLabel}${d[xAxisValue]}<br>${yLabel}${d[yAxisValue]}`);
        });

    chartGroup.call(toolTip);
    circlesGroup
        .on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);
    circleText
        .on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);
}

// Load data and built plot
d3.csv("./assets/data/data.csv")
    .then(function(healthData) {
        healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            data.noHealthInsurance =+ data.noHealthInsurance;
        });

        var xScale = createXScale(healthData, chosenXaxis);
        var yScale = createYScale(healthData, chosenYaxis);
        var bottomAxis = d3.axisBottom(xScale);
        var leftAxis = d3.axisLeft(yScale);
        var xAxis = chartGroup.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(bottomAxis);
        var yAxis = chartGroup.append('g')
            .call(leftAxis);
        
        // Set X axis labels for charts
        var xLabelsGroup = chartGroup.append('g')
            .attr('transform', `translate(${width/2}, ${height +20})`)
            .classed('xOptions', true);
        var incomeLabel = xLabelsGroup.append('text')
            .attr('x', 0)
            .attr('y', 20)
            .attr('value', 'income')
            .text('Median Household Income ($)')
            .classed('aText', true)
            .classed('active', true);
        var ageLabel = xLabelsGroup.append('text')
            .attr('x', 0)
            .attr('y', 40)
            .attr('value', 'age')
            .text('Median Age')
            .classed('aText', true)
            .classed('inactive', true);
        var povertyLabel = xLabelsGroup.append('text')
            .attr('x', 0)
            .attr('y', 60)
            .attr('value', 'poverty')
            .text('Poverty (%)')
            .classed('aText', true)
            .classed('inactive', true)
        
        // Set X axis labels for charts
        var yLabelsGroup = chartGroup.append('g')
            .attr('transform','rotate(-90)');
        var obesityLabel = yLabelsGroup.append('text')
            .attr('x', 0 - (height / 2))
            .attr('y', - margin.left)
            .attr('dy', '1em')
            .attr('value', 'obesity')
            .text('Obesity (%)')
            .classed('aText', true)
            .classed('active', true);
        var smokeLabel = yLabelsGroup.append('text')
            .attr('x', 0 - (height / 2))
            .attr('y', 0 - margin.left*.8)
            .attr('dy', '1em')
            .attr('value', 'smokes')
            .text('Smokes (%)')
            .classed('aText', true)
            .classed('inactive', true);
        var healthInsLabel = yLabelsGroup.append('text')
            .attr('x', 0 - (height / 2))
            .attr('y', 0 - margin.left*.6)
            .attr('dy', '1em')
            .attr('value', 'noHealthInsurance')
            .text('Lacks Health Insurance (%)')
            .classed('aText', true)
            .classed('inactive', true);

        var xAxisLabels = [incomeLabel, ageLabel, povertyLabel];
        var yAxisLabels =  [obesityLabel, smokeLabel, healthInsLabel];

        var xLabelDescriptions = ['Median Income: $', 'Median Age: ', 'Poverty%: '];
        var yLabelDescriptions =  ['Obesity%: ', 'Smoking%: ', 'Uninsured%: '];

        var xAxisValues = ['income', 'age', 'poverty'];
        var yAxisValues = ['obesity', 'smokes', 'noHealthInsurance'];
    
        // Circles and text    
        var circlesGroup = chartGroup.append('g').selectAll('circle')
            .data(healthData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d[chosenXaxis]))
            .attr('cy', d => yScale(d[chosenYaxis]))
            .attr('r', '12')
            .classed('stateCircle', true);

        var circleText = chartGroup.append('g').selectAll('text')
            .data(healthData)
            .enter()
            .append('text')
            .text(d => d.abbr)
            .attr('x', d => xScale(d[chosenXaxis]))
            .attr('y', d => yScale(d[chosenYaxis]))
            .classed('stateText', true)
            .attr('font-size', '10')
            .style('alignment-baseline', 'middle');

        // Create tooltips
        toolTips(chosenXaxis,chosenYaxis,xAxisValues,yAxisValues,xLabelDescriptions,yLabelDescriptions, circlesGroup, circleText);

        // Set up updates in case axes change
        xLabelsGroup.selectAll('text')
            .on('click', function() {
                var xAxisValue = d3.select(this).attr('value');
                if (xAxisValue !== chosenXaxis) {
                    chosenXaxis = xAxisValue;
                    xScale = createXScale(healthData, chosenXaxis);
                    xAxis = renderXAxis(xScale, xAxis);
                    circlesGroup = renderCircles(circlesGroup, xScale, chosenXaxis, yScale, chosenYaxis);
                    circleText = renderText(circleText, xScale, chosenXaxis, yScale, chosenYaxis);
                    toolTips(chosenXaxis,chosenYaxis,xAxisValues,yAxisValues,xLabelDescriptions,yLabelDescriptions, circlesGroup, circleText);
                }
                activeAxis(xAxisLabels, chosenXaxis);
            });
        yLabelsGroup.selectAll('text')
            .on('click', function() {
                var yAxisValue = d3.select(this).attr('value');
                if (yAxisValue !== chosenYaxis) {
                    chosenYaxis = yAxisValue;
                    yScale = createYScale(healthData, chosenYaxis);
                    yAxis = renderYAxis(yScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, xScale, chosenXaxis, yScale, chosenYaxis);
                    circleText = renderText(circleText, xScale, chosenXaxis, yScale, chosenYaxis);
                    toolTips(chosenXaxis,chosenYaxis,xAxisValues,yAxisValues,xLabelDescriptions,yLabelDescriptions, circlesGroup, circleText);
                }
                activeAxis(yAxisLabels, chosenYaxis);
            });
    });
