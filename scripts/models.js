var ko, ui;
var presidents;
var TOTAL = 1;
var DATE = 0;
var adjustForInflation;
var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds

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
    this.selectedPresidents = ko.observableArray(["trump1", /*"obama2", "obama1", "bush-jr2"*/]);
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
    this.dayScale = ko.observable(100);
    this.scale = ko.observable(10);
    this.renderEnabled = ko.observable(false);
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
        var self = this;
        if(!this.renderEnabled() || this.screenSize() < 0) {
            return;
        }
        
        var rows = [];
        var rowMap = {};
        var presIndex = -1;
        for(var pres=0; pres<presidents.length; ++pres) {
            if(!this.presEnabled(presidents[pres].id)) {
                continue;
            }
            presIndex++;
            var startPoint = presidents[pres].dataPoints[0];
            var startTotal = startPoint[TOTAL];
            var lastPoint = -1;
            var lastI = -1;
            for(var i=0; i < presidents[pres].dataPoints.length; ++i) {
                if(presidents[pres].dataPoints.length > this.dayScale()) {
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
                    var diffDays = Math.round(Math.abs((startPoint[DATE].getTime() - datum[DATE].getTime())/(oneDay)));
                    if(rowMap[diffDays] == undefined) {
                        rowMap[diffDays] = rows.length;
                        rows.push([]);
                        rows[rows.length - 1].push(diffDays);
                        for(var p=0; p<pres; ++p) {
                            if(!this.presEnabled(presidents[p].id)) {
                                continue;
                            }
                            rows[rows.length - 1].push(null);
                        }
                    }
                    newPoint = rows[rowMap[diffDays]];
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
                rows = rows.map(function(row) {
                    if(row.length < presIndex + 2)
                        row.push(null);
                    if(row.length > presIndex+2) {
                        var spliceStart = row.length - (row.length - presIndex) + 2;
                        row.splice(spliceStart);
                    }
                    return row;
                });
            }
        }
 
        rows = rows.sort(function(a, b) {
            if(a[0] < b[0]) {
                return -1;
            }
            return 1;
        });
        
        ui.render(rows);

        return rows;
    }, this).extend({throttle: 150});
}

if(module) {
    adjustForInflation = function(val, date) {
        return val;
    };
    ui = {
        render: function(rows) {
        }
    };
    ko = require("./test/mock-ko");

    module.exports = function(_presidents) {
        presidents = _presidents;
        return DebtViewModel;
    };
}
