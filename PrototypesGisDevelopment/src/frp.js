/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* 
 Created on : Jan 6, 2016, 6:58:20 PM
 Author     : yeozkaya
 */

var linesArray = [];
window.onload = function () {
    getTitleCaseInput();
};

function getTitleCaseInput() {
    $.ajax({
        url: "./data/titlecase_input.txt",
        type: 'GET',
        dataType: 'text',
        success: function (text) {
            linesArray = text.split("\n");
            processTitleCase();

        }
    });
}

function processTitleCase() {

    return linesArray.
            filter(function (line) {
                return line.indexOf("@") === -1 && line.indexOf("istanbul") === -1;
            }).
            map(function (line) {
                $("#outputText").append(line.toProperCase() + "<p>");
                return line.toProperCase();
            });
}

String.prototype.toProperCase = function () {
    var arr = this.toLowerCase().split(' ');
    arr = processStringArray(arr);
    return arr.join(' ');
};

function processStringArray(stringArray) {

    return stringArray.
            map(function (word) {
                return word.charAt(0).toUpperCase() + word.substr(1);
            });
}

