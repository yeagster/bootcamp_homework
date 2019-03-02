// Set variables for URLs
var hourly_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
var daily_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var weekly_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var monthly_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var plateBoundaries_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Set circle colors based on the size of the earthquake (magnitude)
var magIntervals = [1,2,3,4,5,999];
var intervalLabels = ['<=1', '1-2', '2-3', '3-4', '4-5', '>5']
var circleColors = ['#99cc66', '#cee652', '#ffff33', '#ffc636', '#ff8436', '#ff0033'];
function getColor(magnitude) {
    for (var i = 0; i < magIntervals.length; i++) {
        if (magnitude <= magIntervals[i]) {
            return circleColors[i];
        }
    }
}

// Create map layers 
function createMap(hourly_eq, daily_eq, weekly_eq, monthly_eq, borders) {
    var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: api_key
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets-satellite",
        accessToken: api_key
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: api_key
    });
    
    var baseMaps = {
        Grayscale: grayscale,
        Satellite: satellite,
        Outdoors: outdoors
    };
  
    var overlayMaps = {
        'Last Hour': hourly_eq,
        'Last Day': daily_eq,
        'Last 7 Days': weekly_eq,
        'Last 30 Days': monthly_eq,
        'Tectonic Plates': borders
    };

    var earthquakeMap = L.map('earthquake-map', {
        center: [39, -98],
        zoom: 3.4,
        layers: [grayscale, weekly_eq, borders]
    });

    L.control.layers(baseMaps, overlayMaps).addTo(earthquakeMap);

    // Create map legend
    var legend = L.control({position: 'bottomleft'})
    legend.onAdd = function(earthquakeMap) {
        var div = L.DomUtil.create('div', 'info legend');
        for (var i = 0; i < magIntervals.length; i++){
            div.innerHTML += '<i style="background:'+getColor(magIntervals[i])+'"></i> '+(intervalLabels[i] ? intervalLabels[i] + '<br>' : '+');
        }
        return div;
    }
    legend.addTo(earthquakeMap)
}

// Convert geoJSON time to date time string
function convertTime(geoJSONTime) {
    var date = new Date(geoJSONTime);
    return date.toString();
}

//create circles layer
function createEarthquakes(earthquakeFeatures) {
    var earthquakes = L.geoJSON(earthquakeFeatures, {
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.circleMarker(latlng, {
                color: 'transparent',
                opacity: 0,
                fillColor: getColor(geoJsonPoint.properties.mag),
                fillOpacity: .95,
                radius: geoJsonPoint.properties.mag*5
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup('<p><strong>Location:</strong> '+feature.properties.place+'<br><strong>Magnitude:</strong> '+feature.properties.mag+'<br><strong>Time:</strong> '+convertTime(feature.properties.time)+'<p>')
        }
    });
    return earthquakes;
}

//create tectonic borders layer
function createBorders(borderFeatures) {
    var borders = L.geoJSON(borderFeatures, {
        style: {
            color: 'blue',
            fillOpacity: 0,
            weight: 3
        }
    })
    return borders;
}

//get earthquake data and build maps
d3.json(hourly_url, function(hourlyResponse) {
    d3.json(daily_url, function(dailyResponse) {
        d3.json(weekly_url, function(weeklyResponse) {
            d3.json(monthly_url, function(monthlyResponse) {
                d3.json(plateBoundaries_url, function(borderResponse) {
                var hourlyFeatures = hourlyResponse.features;
                var dailyFeatures = dailyResponse.features;
                var weeklyFeatures = weeklyResponse.features;
                var monthlyFeatures = monthlyResponse.features;
                var borderFeatures = borderResponse.features;
                var hourly_eq = createEarthquakes(hourlyFeatures);
                var daily_eq = createEarthquakes(dailyFeatures);
                var weekly_eq = createEarthquakes(weeklyFeatures);
                var monthly_eq = createEarthquakes(monthlyFeatures);
                var borders = createBorders(borderFeatures);
                createMap(hourly_eq, daily_eq, weekly_eq, monthly_eq, borders);
                })
            })
        })
    })
})