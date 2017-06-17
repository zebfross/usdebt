// mock knockout for unit tests
var mockKO = {
    observable: function (val) {
        var innerVal = val;
        var ret = function (v) {
            if (v === undefined)
                return innerVal;
            innerVal = v;
            return v;
        };
        ret.subscribe = function (foo) { }
        return ret
    },
    computed: function (func) {
		func.extend = function(obj) {return func;};
        return func
    },
    observableArray: function (val) {
        var innerVal = val;
        var ret = function (v) {
            if (v === undefined)
                return innerVal;
            innerVal = v;
            return v;
        };
		ret.indexOf = function(v) {
			return innerVal.indexOf(v);
		};
		ret.removeAll = function() {
			return innerVal.removeAll();
		};
		ret.push = function(v) {
			innerVal.push(v);
		};
        ret.splice = function (start, count, item) {
            if (count > 0)
                return innerVal.splice(start, count);
            else
                return innerVal.splice(start, count, item);
        }
        return ret;
    }
};

module.exports = mockKO;