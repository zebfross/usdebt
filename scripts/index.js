var model;
var presidents = [];
var presidentsInflation = [];
var presidentsPercentage = [];
var presidentsOverlapped = [];
var serverRoot = "data";
var scale = 10;
var chart;
var TOTAL = 1;
var DATE = 0;
var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds

var inflationRates = {
"1971": 0.044,
"1972": 0.032,
"1973": 0.062,
"1974": 0.11,
"1975": 0.091,
"1976": 0.058,
"1977": 0.065,
"1978": 0.076,
"1979": 0.113,
"1980": 0.135,
"1981": 0.103,
"1982": 0.062,
"1983": 0.032,
"1984": 0.043,
"1985": 0.036,
"1986": 0.019,
"1987": 0.036,
"1988": 0.041,
"1989": 0.048,
"1990": 0.054,
"1991": 0.042,
"1992": 0.03,
"1993": 0.03,
"1994": 0.026,
"1995": 0.028,
"1996": 0.03,
"1997": 0.023,
"1998": 0.016,
"1999": 0.022,
"2000": 0.034,
"2001": 0.028,
"2002": 0.016,
"2003": 0.023,
"2004": 0.027,
"2005": 0.034,
"2006": 0.032,
"2007": 0.028,
"2008": 0.038,
"2009": -0.004,
"2010": 0.016,
"2011": 0.032,
"2012": 0.021,
"2013": 0.015,
"2014": 0.016,
"2015": 0.001,
"2016": 0.013
};

function getDayOfYear(date) {
    var start = new Date(date.getFullYear(), 0, 0);
    var diff = date - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    return day;
}

function adjustForInflation(value, date) {
    if(date.getFullYear() > 2016) {
        return value;
    }
    var dayOfYear = getDayOfYear(date);
    value = value * ((inflationRates[date.getFullYear()] / 365) * (365 - dayOfYear) + 1);
    for (var i=date.getFullYear()+1; i < 2017; ++i) {
        value = value * (1 + inflationRates[i]);
    }
    return value;
}

function max(arr, start, end) {
    if(arr.length == 0)
        return 0;
    if(!start) start=0;
    if(!end) end=arr.length;
    var m = arr[start];
    for(var i=start+1; i<end; ++i) {
        if(arr[i] > m)
            m = arr[i];
    }
    return m;
}
function min(arr, start, end) { 
    if(arr.length == 0)
        return 0;
    if(!start) start=0;
    if(!end) end=arr.length;
    var m = arr[start];
    for(var i=start+1; i<end; ++i) {
        if(arr[i] < m)
            m = arr[i];
    }
    return m;
}

var ui = {
    render: function(rows) {
        var options = {
            legend: {textStyle: {color: 'white'}},
            backgroundColor: "#303030",
            hAxis: {
            title: (model.continuous()) ? 'Date recorded' : 'Days in Office',
            textStyle: {color: 'white'},
            titleTextStyle: {color: 'white'},
            },
            vAxis: {
            title: 'Debt (in Millions)',
            textStyle: {color: 'white'},
            titleTextStyle: {color: 'white'}
            },
            interpolateNulls: true,
            explorer: { 
                actions: ['dragToZoom', 'rightClickToReset'],
                axis: 'horizontal',
                maxZoomIn: .025
            }
        };

        var data = new google.visualization.DataTable();
        if(model.continuous() && model.selectedPresidents().length > 0) {
            data.addColumn('date', 'X');
        } else if(model.selectedPresidents().length > 0) {
            data.addColumn('number', 'X');
        }

        for(var pres=0; pres<presidents.length; ++pres) {
            if(!model.presEnabled(presidents[pres].id)) {
                continue;
            }
            data.addColumn('number', presidents[pres].title);
        }

        data.addRows(rows);

        var chart = new google.visualization.LineChart(document.getElementById('usdebtChart'));
        chart.draw(data, options);
    }
}

model = new DebtViewModel();
window.addEventListener("load", function() {
    var scaleFactor = 1000000; // one million
    for(var pres=0; pres<presidents.length; ++pres) {
        for(var i=0; i < presidents[pres].dataPoints.length; ++i) {
            presidents[pres].dataPoints[i][TOTAL] = presidents[pres].dataPoints[i][TOTAL] / scaleFactor;
        }

        presidents[pres].dataPoints = presidents[pres].dataPoints.sort(function(a, b) {
            if(a[0] < b[0]) {
                return -1;
            }
            return 1;
        });
    }

    ko.applyBindings(model);
});

window.addEventListener("resize", function(e) {
    model.screenSize(Math.random()*100);
});
