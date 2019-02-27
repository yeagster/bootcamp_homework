// from data.js
var tableData = data;
// Get a reference to the table body

var tbody = d3.select("tbody");
var $searchBtn = document.querySelector("#search");
var $dateTimeInput = document.querySelector("#date_time");  

// adding rows to table for each alien report 
data.forEach(function(alienReport) {
    //   console.log(alienReport);

    var row = tbody.append("tr");

  Object.entries(alienReport).forEach(function([key, value]) {
    // console.log(key, value);
    var cell = row.append("td");
    cell.text(value);
  });
});

var text = d3.select("#datetime");
var submit = d3.select("#filter-btn");

// Complete the click handler for the form
submit.on("click", function() {

    // Prevent the page from refreshing
  d3.event.preventDefault();

  // Select the input element and get the raw HTML node
  var inputElement = d3.select("#datetime");

  // Get the value property of the input element
  var inputValue = inputElement.property("value");
  console.log(inputValue);

  // Use the form input to filter the data by blood type
  var filteredData = data.filter(data => data.datetime === inputValue); 
  console.log(filteredData);
  tbody.html("");

  filteredData.forEach(function(alienReport) {
    //   console.log(alienReport);
      var row = tbody.append("tr");

      Object.entries(alienReport).forEach(function([key, value]) {
        // console.log(key, value);
        var cell = row.append("td");
        cell.text(value);
        });
    });
});