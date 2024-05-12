// Define map options
// Set Los Angeles as the Center
var map = L.map('map').setView([34.052235, -118.243683], 4.5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to determine marker size based on magnitude
function getMarkerSize(magnitude) {
  return magnitude * 5;
}

// Function to determine marker color based on depth
function getMarkerColor(depth) {
  if (depth < 10) {
    return 'green';
  } else if (depth < 30) {
    return '#ADFF2F'; // Yellowish green
  } else if (depth < 50) {
    return 'yellow';
  } else if (depth < 70) {
    return 'orange';
  } else if (depth < 90) {
    return 'pink';
  } else {
    return 'red';
  }
}

// Function to create marker popup content
function createPopup(feature) {
  return '<h3>' + feature.properties.place + '</h3>' +
         '<p>Magnitude: ' + feature.properties.mag + '<br>' +
         'Depth: ' + feature.geometry.coordinates[2] + '</p>';
}

// Fetch earthquake data using D3 and add markers to the map
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(data => {
    data.features.forEach(feature => {
      var coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
      var magnitude = feature.properties.mag;
      var depth = feature.geometry.coordinates[2];
      var markerSize = getMarkerSize(magnitude);
      var markerColor = getMarkerColor(depth);
      var popupContent = createPopup(feature);

      var marker = L.circleMarker(coordinates, {
        radius: markerSize,
        color: markerColor,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup(popupContent);
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

// Add legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  div.style.backgroundColor = 'white'; // Adding white background
  div.style.padding = '10px'; // Adding padding
  
  var depths = [-10, 10, 30, 50, 70, 90]; // Adjusted depth ranges
  var labels = ['<strong>Depth</strong>'];
  
  // Loop through depth ranges
  for (var i = 0; i < depths.length - 1; i++) {
    var color = getMarkerColor(depths[i] + 1);
    var range = depths[i] + ' - ' + depths[i + 1]; // Create depth range string
    labels.push(
      '<span style="background:' + color + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></span>' + range
    );
  }
  
  // Add the last depth range separately
  var lastColor = getMarkerColor(90);
  labels.push(
    '<span style="background:' + lastColor + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></span>90+'
  );
  
  div.innerHTML = labels.join('<br>');
  return div;
};
legend.addTo(map);