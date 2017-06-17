var request = require('request');
var xml = require('xml2js');
var XRegExp = require('xregexp');
var currentData = require('../scripts/data/trump-1.js').data[0].dataPoints;
var fs = require('fs');

function alreadyHaveDate(d) {
    for(var i=0; i < currentData.length; ++i) {
        if(currentData[i][0].getTime() === d.getTime())
            return true;
    }
    return false;
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

function parseTotal(txt) {
    var reg = XRegExp('([0-9,\.]+)');
    var match;
    var matches = [];
    var pos = 0;
    console.log(txt);
    XRegExp.forEach(txt, reg, function(match, val) {
        var v = match[0].replace(/,/g, '');
        console.log("found value: " + v);
        matches.push(Number(v));
    });
    if(matches.length != 3) {
        console.log("Unexpected number of values");
    }
    console.log(JSON.stringify(matches));
    return max(matches);
}

request('https://www.treasurydirect.gov/NP/debt/rss', function (error, response, body) {
  if(error) {
      console.log(error);
      return;
  }
  xml.parseString(body, function(err, results) {
      var items = results.rss.channel[0].item;
      for(var i=0; i < items.length; ++i) {
          var d = new Date(items[i].pubDate[0]);
          if(!alreadyHaveDate(new Date(d.toDateString()))) {
            console.log("Didn't find date: " + d);
            var total = parseTotal(items[i]['content:encoded'][0]);
            var line = 'presidents[presidents.length-1].dataPoints.push([new Date("';
            line = line + d.toDateString() + '"), ' + total + ']);\n';
            fs.appendFile('scripts/data/trump-1.js', line, function(err) {if(err) console.log(err);});
          }
      }
  });
});