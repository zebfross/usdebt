var model;
var presidents = [];
var presidentsInflation = [];
var presidentsPercentage = [];
var presidentsOverlapped = [];
var serverRoot = "data";
var scale = 10;
var interestRate = .024;
var chart;
var TOTAL = 1;
var DATE = 0;

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
    value = value * (((inflationRates[date.getFullYear()] + interestRate) / 365) * (365 - dayOfYear) + 1);
    for (var i=date.getFullYear()+1; i < 2017; ++i) {
        value = value * (1 + inflationRates[i] + interestRate);
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

function DebtViewModel() {
    this.applyDefaultOptions = function() {
        this.inflation(true);
        this.absolute(true);
        this.percentage(false);
        this.continuous(true);
        this.selectedPresidents.removeAll();
        this.selectedPresidents.push("trump1");
        this.selectedPresidents.push("obama2");
        this.selectedPresidents.push("obama1");
        this.selectedPresidents.push("bush-jr2");
    };
    this.selectedPresidents = ko.observableArray(["trump1", "obama2", "obama1", "bush-jr2"]);
    this.presEnabled = function(id) {
        if(this.selectedPresidents.indexOf(id) > -1) {
            return true;
        }
        return false;
    };
    this.togglePres = function(id) {
        var index = this.selectedPresidents.indexOf(id);
        if(index > -1) {
            this.selectedPresidents.splice(index, 1);
        } else {
            this.selectedPresidents.push(id);
        }
    };
    this.scale = ko.observable(10);
    this.googleLoaded = ko.observable(false);
    this.inflation = ko.observable(true);
    this.toggleInflation = function() {
        this.inflation(!this.inflation());
    };
    this.absolute = ko.observable(true);
    this.toggleAbsolute = function() {
        this.absolute(!this.absolute());
    };
    this.absoluteText = ko.computed(function() {
        if(!this.absolute())
            return "Absolute";
        else
            return "Relative";
    }, this);
    this.percentage = ko.observable(false);
    this.togglePercentage = function() {
        this.percentage(!this.percentage());
    };
    this.continuous = ko.observable(true);
    this.toggleContinuous = function() {
        this.continuous(!this.continuous());
    };
    this.continuousText = ko.computed(function() {
        if(!this.continuous())
            return "Continuous";
        else
            return "Stacked";
    }, this);
    this.screenSize = ko.observable(1);
    this.render = ko.computed(function() {
        if(!this.googleLoaded() || this.screenSize() < 0) {
            return;
        }
        var data = new google.visualization.DataTable();
        var rows = [];
        if(this.continuous() && this.selectedPresidents().length > 0) {
            data.addColumn('date', 'X');
        } else if(this.selectedPresidents().length > 0) {
            data.addColumn('number', 'X');
        }
        for(var pres=0; pres<presidents.length; ++pres) {
            if(!this.presEnabled(presidents[pres].id)) {
                continue;
            }
            data.addColumn('number', presidents[pres].title);
            var startPoint = presidents[pres].dataPoints[0];
            var startTotal = startPoint[TOTAL];
            var lastPoint = -1;
            var lastI = -1;
            for(var i=0; i < presidents[pres].dataPoints.length; ++i) {
                if(presidents[pres].dataPoints.length > 100) {
                    if(i % this.scale() > 0) {
                        continue;
                    }
                }
                var prevPoint = ["", 0];
                if(lastI > -1) {
                    prevPoint = presidents[pres].dataPoints[lastI];
                }
                var datum = presidents[pres].dataPoints[i];
                var newPoint = [];
                if(this.continuous()) {
                    newPoint.push(datum[DATE]);
                    for(var p=0; p < pres; ++p) {
                        if(!this.presEnabled(presidents[p].id)) {
                            continue;
                        }
                        newPoint.push(null);
                    }
                } else {
                    lastPoint++;
                    if(lastPoint == rows.length) {
                        rows.push([]);
                        rows[lastPoint].push(i);
                        for(var p=0; p<pres; ++p) {
                            if(!this.presEnabled(presidents[p].id)) {
                                continue;
                            }
                            rows[lastPoint].push(null);
                        }
                    }
                    newPoint = rows[lastPoint];
                }
                var newValue = datum[TOTAL];
                if(!this.absolute()) {
                    newValue = newValue-startTotal;
                }
                if(this.inflation()) {
                    newValue = adjustForInflation(newValue, datum[DATE]);
                }
                if(this.percentage()) {
                    if(prevPoint[TOTAL] != 0) {
                        newValue = (datum[TOTAL] / prevPoint[TOTAL] - 1) * 100;
                    } else {
                        newValue = 0;
                    }
                }
                newPoint.push(newValue);
                if(this.continuous()) {
                    for(var p=pres+1; p < presidents.length; ++p) {
                        if(!this.presEnabled(presidents[p].id)) {
                            continue;
                        }
                        newPoint.push(null);
                    }
                    rows.push(newPoint);
                    lastPoint = rows.length - 1;
                }
                lastI = i;
            }
            if(!this.continuous()) {
                for(var r=lastPoint+1; r < rows.length; ++r) {
                    rows[r].push(null);
                }
            }
        }

      data.addRows(rows);

      var options = {
        legend: {textStyle: {color: 'white'}},
        backgroundColor: "#303030",
        hAxis: {
          title: 'Time',
          textStyle: {color: 'white'},
          titleTextStyle: {color: 'white'},
        },
        vAxis: {
          title: 'Debt (in Millions)',
          textStyle: {color: 'white'},
          titleTextStyle: {color: 'white'}
        },
        interpolateNulls: false,
        explorer: { 
            actions: ['dragToZoom', 'rightClickToReset'],
            axis: 'horizontal',
            maxZoomIn: .025
        }
      };

      var chart = new google.visualization.LineChart(document.getElementById('usdebtChart'));
      chart.draw(data, options);
        
    }, this).extend({throttle: 150});
}

model = new DebtViewModel();
window.onload = function() {
    $('[data-toggle="tooltip"]').tooltip();

    var scaleFactor = 1000000;
    for(var pres=0; pres<presidents.length; ++pres) {
        for(var i=0; i < presidents[pres].dataPoints.length; ++i) {
            presidents[pres].dataPoints[i][TOTAL] = presidents[pres].dataPoints[i][TOTAL] / scaleFactor;
        }
    }

    ko.applyBindings(model);

};

$(window).resize(function(e) {
    model.screenSize(Math.random()*100);
});
