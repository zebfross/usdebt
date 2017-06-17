var assert = require('assert');
var presidents = require('../data/test-data');
var DebtViewModel = require('../models')(presidents);

function makeModel(options) {
    if(options == undefined) options = {};
    var model = new DebtViewModel();
    model.scale(options.scale || 2);
    model.dayScale(options.dayScale || 5);
    model.renderEnabled(true);
    model.continuous((options.continuous == undefined) ? true : options.continuous);
    if(options.selectedPresidents == undefined) {
        model.selectedPresidents(presidents.map(function(p) { return p.id; }));
    } else {
        model.selectedPresidents(options.selectedPresidents);
    }
    return model;
}

function verifyRows(model, rows) {
    var numColumns = 1 + model.selectedPresidents().length;
    rows.map(function(row) {
        assert(row.length == numColumns, "Expected " + numColumns + " columns, actual " + row.length);
    });
}

var describe, it;
if(describe == undefined) {
    describe = function(name, foo) {
        foo();
    };
    it = function(name, foo) {
        foo();
    };
}

describe('Model', function () {
    describe('Render', function () {
        it('should properly render multiple presidents', function () {
            var model = makeModel();
            var rows = model.render();
            verifyRows(model, rows);
        })
        it('should properly render multiple presidents without scale', function () {
            var model = makeModel({dayScale: 9000, scale: 1});
            var rows = model.render();
            verifyRows(model, rows);
        })
        it('should properly render with stacked view', function () {
            var model = makeModel({dayScale: 5, scale: 2, continuous: false});
            var rows = model.render();
            verifyRows(model, rows);
        })
        it('should properly render with few presidents selected', function () {
            var model = makeModel({dayScale: 5, 
                scale: 2, continuous: false, 
                selectedPresidents: ["3", "4", "5"]});
            var rows = model.render();
            verifyRows(model, rows);
        })
        it('should properly render with duplicate dates', function () {
            var model = makeModel({dayScale: 9000, 
                scale: 1, continuous: false, 
                selectedPresidents: ["5"]});
            var rows = model.render();
            verifyRows(model, rows);
        })
        it('should handle duplicate dates', function () {
            var model = makeModel({dayScale: 9000, 
                scale: 1, continuous: false, 
                selectedPresidents: ["5", "6", "7"]});
            var rows = model.render();
            verifyRows(model, rows);
            console.log(rows);
        })
    })
})