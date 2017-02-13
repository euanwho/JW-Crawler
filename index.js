var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var bodyParser = require('body-parser');

var app = express();

app.listen(3000, function(){
    console.log('Listening on port 3000');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(bodyParser.urlencoded({extended: true}));

app.post('/scripture', function(req, res){
    scripture(req.body.book, req.body.chapter, req.body.verseNum);
    res.redirect('/');
});

function format(arr) {
    for (i=0; i<arr.length; i++) {
        if (arr[i].length == 1) {
            arr[i] = "00" + arr[i];
        } else if (arr[i].length == 2) {
            arr[i] = "0" + arr[i];
        }
    }
    console.log(arr);
    return arr;
}

function scripture(book, chapter, verseNum) {
    verseNum = verseNum.replace(/\s/g, '');
    if (verseNum.indexOf(',') > -1) {
        verseNum = verseNum.split(',');
        verseNum = format(verseNum);
    } else if(verseNum.indexOf('-') > -1) {
        verseNum = verseNum.split('-');
        console.log(verseNum);
        var lowEnd = parseInt(verseNum[0]);
        var highEnd = parseInt(verseNum[1]);
        console.log(lowEnd);
        console.log(highEnd);
        verseNum = [];
        for (x=lowEnd; x<=highEnd; x++) {
            verseNum.push(x.toString());
        }
        console.log(verseNum);
        verseNum = format(verseNum);
    } else {
        if (verseNum.length == 1) {
            verseNum = "00" + verseNum;
        } else if (verseNum.length == 2) {
            verseNum = "0" + verseNum;
        }
    }
    
    var pageToVisit = ''; 
    book = book.replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/ /g,"-");;
    pageToVisit = "https://www.jw.org/en/publications/bible/nwt/books/" + book + "/" + chapter + "/";

    request(pageToVisit, function(error, response, body) {
        if(error) {
            console.log("Error: " + error);
        }
     // Check status code (200 is HTTP OK)
     //console.log("Status code: " + response.statusCode);
        if(response.statusCode === 200) {
            var $ = cheerio.load(body);
            $('.verse span').children().remove();
            var verse = '';
            if (Array.isArray(verseNum)) {
                for (v=0;v<verseNum.length;v++){
                    verse += $('[id$="' + verseNum[v] + '"]').text();
                }
            } else {
                verse = $('[id$="' + verseNum + '"]').text();
            }
            verse = verse.replace(/\r?\n|\r/g, ' ');
            console.log(verse);
        }
  });
}