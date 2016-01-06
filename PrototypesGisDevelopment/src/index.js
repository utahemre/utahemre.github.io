/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* 
 Created on : Jan 5, 2016, 3:58:20 PM
 Author     : yeozkaya
 */

//These layers for PRO01
var parcelLayer, buildingLayer, roadLayer;

//These layers for PRO03
var rasterImage;

//These layers for PRO09
var polygonInputLayer;

window.onload = function () {
    map = L.map('map', {
        center: [39.80, 34.00],
        zoom: 6
    });

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Prototypes by yeozkaya@gmail.com',
        subdomains: ['a', 'b', 'c']
    }).addTo(map);

    map.on('click', function (e) {
        var geometryNames = "";
        $.each(parcelLayer._layers, function (key, element) {
            var pt = turf.point([e.latlng.lng, e.latlng.lat]);
            if (turf.intersect(pt, element.feature.geometry)) {
                geometryNames += element.feature.properties.name + ", ";
            }
        });

        $.each(buildingLayer._layers, function (key, element) {
            var pt = turf.point([e.latlng.lng, e.latlng.lat]);
            if (turf.intersect(pt, element.feature.geometry)) {
                geometryNames += element.feature.properties.name + ", ";
            }
        });

        $.each(roadLayer._layers, function (key, element) {
            var buffered = turf.buffer(element.feature, 0.1, "degrees").features[0].geometry;
            var pt = turf.point([e.latlng.lng, e.latlng.lat]);
            if (turf.intersect(pt, buffered)) {
                geometryNames += element.feature.properties.name + ", ";
            }
        });

        if (geometryNames !== "") {
            L.popup()
                    .setLatLng(e.latlng)
                    .setContent("Tıklanan noktada bulunan geometriler : " + geometryNames)
                    .openOn(map);
        }

    });

    getParcelData();
    getBuildingData();
    getRoadData();
    addRasterImage();
    getClip();
    getPolygonInputData();
    getAreaOfInterest();
};

function getParcelData() {
    $.ajax({
        url: "./data/parceldata.json",
        type: 'GET',
        dataType: 'json',
        success: function (json) {
            parcelLayer = L.geoJson(json, {
                style: function (feature) {
                    return {color: "green", clickable: false};
                }
            }).addTo(map);
        }
    });
}

function getBuildingData() {
    $.ajax({
        url: "./data/buildingdata.json",
        type: 'GET',
        dataType: 'json',
        success: function (json) {
            buildingLayer = L.geoJson(json, {
                style: function (feature) {
                    return {color: "purple", clickable: false};
                }
            }).addTo(map);
        }
    });
}

function getRoadData() {
    $.ajax({
        url: "./data/roaddata.json",
        type: 'GET',
        dataType: 'json',
        success: function (json) {
            roadLayer = L.geoJson(json, {
                style: function (feature) {
                    return {color: "red", clickable: false};
                }
            }).addTo(map);
        }
    });
}

function addRasterImage() {
    var imageUrl = './data/exampleraster.png',
            imageBounds = [[38.00, 31.00], [40.00, 34.00]];

    rasterImage = L.imageOverlay(imageUrl, imageBounds).addTo(map);
}

function getClip() {
    $.ajax({
        url: "./data/clip.json",
        type: 'GET',
        dataType: 'json',
        success: function (json) {

            var latLngCoordinates = changeAxisOrder(json.geometry.coordinates[0]);
            var clip = L.polygon(latLngCoordinates, {color: "black", weight: 1}).addTo(map);
            clip.on('click', function (e) {

                var anchors = [
                    rasterImage._bounds.getNorthWest(),
                    rasterImage._bounds.getSouthWest(),
                    rasterImage._bounds.getSouthEast(),
                    rasterImage._bounds.getNorthEast()];
                
                var transformedImage = L.imageTransform(rasterImage._url, anchors, {clip: latLngCoordinates});
                transformedImage.addTo(map);
                map.removeLayer(rasterImage);
                map.removeLayer(clip);
                
            });
        }
    });
}

function getPolygonInputData() {
    $.ajax({
        url: "./data/polygoninputdata.json",
        type: 'GET',
        dataType: 'json',
        success: function (json) {
            polygonInputLayer = L.geoJson(json, {
                style: function (feature) {
                    var categoryColor;
                    if (feature.properties.categoryA === "A1") {
                        categoryColor = "green";
                    }
                    else if (feature.properties.categoryA === "A2") {
                        categoryColor = "blue";
                    }
                    else {
                        categoryColor = "orange";
                    }
                    return {fillColor: categoryColor, clickable: false, color: "black", weight: 1, fillOpacity: 0.5};
                }
            }).addTo(map);
        }
    });
}

function getAreaOfInterest() {
    $.ajax({
        url: "./data/areaofinterest.json",
        type: 'GET',
        dataType: 'json',
        success: function (json) {

            var latLngCoordinates = changeAxisOrder(json.geometry.coordinates[0]);
            var areaOfInterest = L.polygon(latLngCoordinates, {color: "white", weight: 1}).addTo(map);
            areaOfInterest.bringToFront();
            areaOfInterest.on('click', function (e) {
                var resultTable = [];
                $.each(polygonInputLayer._layers, function (key, element) {
                    var intersection = turf.intersect(areaOfInterest.toGeoJSON().geometry, element.feature.geometry);
                    if (intersection) {
                        var area = turf.area(intersection);
                        var categoryA = element.feature.properties.categoryA;
                        var categoryB = element.feature.properties.categoryB;
                        if (resultTable[categoryA + ";" + categoryB] === undefined) {
                            resultTable[categoryA + ";" + categoryB] = area;
                        }
                        else {
                            resultTable[categoryA + ";" + categoryB] += area;
                        }
                    }
                });

                var resultTableHtml = "<table>";
                resultTableHtml += "<tr style='font-weight: bold'><td>CategoryA</td><td>CategoryB</td><td>Area(m2)</td></tr>";

                for (var key in resultTable) {
                    resultTableHtml += "<tr><td>" + key.split(";")[0] + "</td><td>" + key.split(";")[1] + "</td><td>" + parseInt(resultTable[key]) + "</td></tr>";
                }

                resultTableHtml += "</table>";

                L.popup()
                        .setLatLng(e.latlng)
                        .setContent(resultTableHtml)
                        .openOn(map);


            });
        }
    });
}

function changeAxisOrder(coordinates) {
    var reverseOrderCoordinates = [];
    for (var i = 0; i < coordinates.length; i++) {
        var reverseCoordinate = [];
        reverseCoordinate[0] = coordinates[i][1];
        reverseCoordinate[1] = coordinates[i][0];
        reverseOrderCoordinates[i] = reverseCoordinate;
    }
    return reverseOrderCoordinates;
}