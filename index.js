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

function scripture(book, chapter, verseNum) {
    if (verseNum.indexOf(',') > -1) {
        verseNum = verseNum.split(',');
    }
    console.log(verseNum);
    for (i=0; i<verseNum.length; i++) {
        if (verseNum[i].length == 1) {
            verseNum[i] = "00" + verseNum[i];
        } else if (verseNum[i].length == 2) {
            verseNum[i] = "0" + verseNum[i];
        }
    }
    
    console.log(verseNum);
    /*if (verseNum.length == 1) {
        verseNum = "00" + verseNum;
    } else if (verseNum.length == 2) {
        verseNum = "0" + verseNum;
    }*/
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