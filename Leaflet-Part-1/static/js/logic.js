let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Define a function to get a color based on depth of earthquakes
//color source: https://www.webucator.com/article/python-color-constants-module/
function getColor(depth) {
    if (depth >= -10 && depth < 10) {
      return "#ADFF2F"; // Light Green
    } else if (depth >= 10 && depth < 30) {
      return "#00FF00"; // Lime Green
    } else if (depth >= 30 && depth < 50) {
      return "#FFFF00"; // Yellow 
    } else if (depth >= 70 && depth < 90) {
      return "#FFB6C1"; // Light Pink
    } else if (depth >= 50 && depth < 70) {
      return "#FF4500"; // Orange
    } else {
      return "#FF0000"; // Red
    }
}
// fetch earthquake data from url and call it data
d3.json(url).then(function(data) {
  let magnitudeMarkers = [];
  
  // create for loop that extracts magnitude, depth, coordinates, and bindpop with description of earthquake
  for (let i = 0; i < data.features.length; i++) {
    let feature = data.features[i];
    let geometry = feature.geometry;
    let properties = feature.properties;

    let depth = geometry.coordinates[2]; // Depth is the third coordinate
    
    //// generate circle markers for each earthquake based on depth and magnitude
    magnitudeMarkers.push(
      L.circle([geometry.coordinates[1], geometry.coordinates[0]], {
        color: "black", 
        weight: 1,   
        fillOpacity: 0.75,
        fillColor: getColor(depth),
        radius: properties.mag * 25000 
      }).bindPopup(properties.place + "<br>Magnitude: " + properties.mag + "<br>Depth: " + depth)
    ); // popup displays earthquake location, magnitude, and depth
  }
  
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  
  let magnitude = L.layerGroup(magnitudeMarkers);
  
  // Create a baseMaps object
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold overlay
  let overlayMaps = {
    "Earthquakes": magnitude,
    
  };

  // produce map with streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, magnitude]
  });

  // Add Legend with depth ranges and corresponding color from getColor function
  //legend source: https://stackoverflow.com/questions/68162805/how-to-add-legend-in-leaflet-map 
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Depth Ranges</h4>";
  
    var depthRanges = [-10, 10, 30, 50, 70, 90];
    for (var i = 0; i < depthRanges.length; i++) {
      var color = getColor(depthRanges[i]);
      div.innerHTML +=
        '<i style="background:' + color + '"></i> ' +
        depthRanges[i] + (depthRanges[i + 1] ? "&ndash;" + (depthRanges[i + 1]) + "<br>" : "+");
    }//displays depth ranges and color on legend
  
    return div;
  };
  
  //add legend to map
  legend.addTo(myMap);

  // Create a layer control, pass baseMaps and overlayMaps, & add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
});