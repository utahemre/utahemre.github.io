var textJsonString = "{ \"type\": \"FeatureCollection\",\"features\": [{ \"type\": \"Feature\",\"geometry\": {\"type\": \"Point\", \"coordinates\": [32.84,39.92]},\"properties\": {\"popupContent\": \"This point loves Karl MALONE\"}},{ \"type\": \"Feature\",\"geometry\": {\"type\": \"LineString\",\"coordinates\": [[35.04, 40.52], [36.67, 38.97], [40.82, 39.28], [40.01, 40.59]]},\"properties\": {\"popupContent\": \"This line loves John STOCKTON\"}},{ \"type\": \"Feature\",\"geometry\": {\"type\": \"Polygon\",\"coordinates\": [[ [31.06, 38.58], [30.06, 39.58], [32.06, 39.58],[32.06, 39.58], [31.06, 38.58] ]]},\"properties\": {\"popupContent\": \"This polygon loves Jeff HORNACEK\"}}]}";
var geojsonLayer;

window.onload = function () {

    map = L.map('map', {
        center: [39.80, 34.00],
        zoom: 6,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Leaflet.GeoJSONAutocomplete Plug-in Geojson Test Page',
        subdomains: ['a', 'b', 'c']
    }).addTo(map);

    document.getElementById("textAreaTest").value = textJsonString;
};

function drawGeoJson() {

    var geoJsonObject = JSON.parse(document.getElementById("textAreaTest").value);

    if (geojsonLayer !== undefined) {
        map.removeLayer(geojsonLayer);
        geojsonLayer = undefined;
    }

    var myStyle = {
        color: "green",
        weight: 5,
        opacity: 0.65,
        fill: false
    };

    try {
        geojsonLayer = L.geoJson(geoJsonObject, {
            style: myStyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.popupContent);
            }
        });

        map.addLayer(geojsonLayer);
        map.fitBounds(geojsonLayer.getBounds());
    }
    catch (err) {
        alert("Invalid GeoJson Object");
    }




}

