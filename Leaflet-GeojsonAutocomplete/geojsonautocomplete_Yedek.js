var activeResult = -1;
var resultCount = 0;
var lastSearch = "";
var searchLayer;
var features = [];
var limit = 10;
var offset = 0;

$.fn.delayKeyup = function (callback, ms) {
    var timer = 0;
    var el = $(this);
    $(this).keyup(function (event) {

        if (event.keyCode !== 13 && event.keyCode !== 38 && event.keyCode !== 40) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback(event);
            }, ms);
        }
        else{
           callback(event); 
        }
    });
    return $(this);
};

function initializeGeoJsonAutocomplete() {

    $("#searchBox")[0].value = "";

    $("#searchBox").delayKeyup(function (event) {


        switch (event.keyCode) {
            case 13: // enter
                searchButtonClick();
                break;
            case 38: // up arrow
                prevResult();
                break;
            case 40: // down arrow
                nextResult();
                break;
            default:
                if ($("#searchBox")[0].value.length > 0) {
                    getValuesAsGeoJson();
                }
                else {
                    clearButtonClick();
                }
                break;
        }

    }, 300);
}

function searchBoxOnBlur() {
    if ($("#resultsDiv")[0] !== undefined) {
        $("#resultsDiv")[0].style.visibility = "collapse";
    }
}

function searchBoxOnFocus() {
    /*if ($("#searchBox")[0].value.length > 2) {
     getValuesAsGeoJson();
     }*/

    if ($("#resultsDiv")[0] !== undefined) {
        $("#resultsDiv")[0].style.visibility = "visible";
    }
}

function listElementMouseEnter(listElement) {

    var index = parseInt(listElement.id.substr(11));

    if (index !== activeResult) {
        $('#listElement' + index).toggleClass('mouseover');
    }

}

function listElementMouseLeave(listElement) {
    var index = parseInt(listElement.id.substr(11));

    if (index !== activeResult) {
        $('#listElement' + index).removeClass('mouseover');
    }
}

function listElementMouseDown(listElement) {
    var index = parseInt(listElement.id.substr(11));

    if (index !== activeResult) {
        if (activeResult !== -1) {
            $('#listElement' + activeResult).removeClass('active');
        }

        $('#listElement' + index).removeClass('mouseover');
        $('#listElement' + index).addClass('active');

        activeResult = index;
        fillSearchBox();
        drawGeoJson(activeResult);
    }
}


function drawGeoJson(index) {

    if (searchLayer !== undefined) {
        map.removeLayer(searchLayer);
        searchLayer = undefined;
    }

    if (index === -1)
        return;

    var myStyle = {
        color: "green",
        weight: 5,
        opacity: 0.65,
        fill: false
    };

    searchLayer = L.geoJson(features[index].geometry, {
        style: myStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(features[index].properties.popupContent);
        }
    });

    map.addLayer(searchLayer);
    map.fitBounds(searchLayer.getBounds());


}

function fillSearchBox() {
    if (activeResult === -1) {
        $("#searchBox")[0].value = lastSearch;
    }
    else {
        $("#searchBox")[0].value = $('#listElementContent' + (activeResult))[0].textContent;
    }
}

function nextResult() {

    if (resultCount > 0) {
        if (activeResult !== -1) {
            $('#listElement' + activeResult).toggleClass('active');
        }

        if (activeResult < resultCount - 1) {
            $('#listElement' + (activeResult + 1)).toggleClass('active');
            activeResult++;
        }
        else {
            activeResult = -1;
        }

        fillSearchBox();
        drawGeoJson(activeResult);
    }
}

function prevResult() {
    if (resultCount > 0) {
        if (activeResult !== -1) {
            $('#listElement' + activeResult).toggleClass('active');
        }

        if (activeResult === -1) {
            $('#listElement' + (resultCount - 1)).toggleClass('active');
            activeResult = resultCount - 1;
        }
        else if (activeResult === 0) {
            activeResult--;
        }
        else {
            $('#listElement' + (activeResult - 1)).toggleClass('active');
            activeResult--;
        }

        fillSearchBox();
        drawGeoJson(activeResult);
    }
}

function clearButtonClick() {
    $("#searchBox")[0].value = "";
    lastSearch = "";
    resultCount = 0;
    features = [];
    activeResult = -1;
    $("#resultsDiv").remove();
    if (searchLayer !== undefined) {
        map.removeLayer(searchLayer);
        searchLayer = undefined;
    }
}

function searchButtonClick() {
    
}

function getValuesAsGeoJson() {

    lastSearch = $("#searchBox")[0].value;
    $.ajax({
        url: './FullTextSearchServlet',
        type: 'GET',
        data: 
        {
            search: $("#searchBox")[0].value,
            limit: limit,
            offsst: offset
        },
        dataType: 'json',
        success: function (json) {

            if (json.type === "Feature") {
                resultCount = 1;
                features[0] = json;
            }
            else {
                resultCount = json.features.length;
                features = json.features;
            }
            createDropDown();
        }
    });

}

function createDropDown() {
    var parent = $("#searchBox").parent();

    $("#resultsDiv").remove();
    parent.append("<div id='resultsDiv'><ul id='resultList' style='list-style-type:none;padding-left:0;'></ul><div>");

    $("#resultsDiv")[0].style.position = $("#searchBox")[0].style.position;
    $("#resultsDiv")[0].style.left = $("#searchBox")[0].style.left;
    $("#resultsDiv")[0].style.bottom = $("#searchBox")[0].style.bottom;
    $("#resultsDiv")[0].style.right = $("#searchBox")[0].style.right;
    $("#resultsDiv")[0].style.top = (parseInt($("#searchBox")[0].style.top) + 25) + "px";
    $("#resultsDiv")[0].style.width = $("#searchBox")[0].style.width;
    $("#resultsDiv")[0].style.height = $("#searchBox")[0].style.height;
    $("#resultsDiv")[0].style.zIndex = $("#searchBox")[0].style.zIndex;
    $("#resultsDiv")[0].style.marginLeft = $("#searchBox")[0].style.marginLeft;

    for (var i = 0; i < features.length; i++) {

        var html = "<li id='listElement" + i + "' class='listResult'>";

        html += "<img src='./image/" + features[i].properties.image + "' class='iconStyle'>";

        html += "<span id='listElementContent" + i + "' class='content'>" + features[i].properties.title + "</span></li>";

        $("#resultList").append(html);

        $("#listElement" + i).mouseenter(function () {
            listElementMouseEnter(this);
        });

        $("#listElement" + i).mouseleave(function () {
            listElementMouseLeave(this);
        });

        $("#listElement" + i).mousedown(function () {
            listElementMouseDown(this);
        });


    }

}