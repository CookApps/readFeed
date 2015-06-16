var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var feed = require("feed-read");
var DataAccess = require("./dataAccess");
var async = require("async");

/* GET home page. */
router.get('/', function(req, res) {
  console.log ("Entering get");
  res.render('index', { title: 'Sample App' });
});

router.post('/stories', function(req, res) {

	console.log ("Entering post");
	var rssLink = req.body.rssLink;

	getRssFeeds(rssLink, function(rssFeeds){

		storeFeedData(rssFeeds, function(){

			DataAccess.loadArticles(function (feeds){
				res.render('stories', { title: 'Stories', subTitle: 'Auto-refreshes the page every 5 seconds', feeds: feeds });	
			});
			
		});

	});

});

function feedFunction(rssFeeds, index, next){
	console.log ("Entering feedFunction");

	feed(rssFeeds[index], function(err, articles) {
	  if (err) throw err;

	  var feedArticles = [];

	  for (index in articles){
	  	feedArticles.push({
	  		title: articles[index].title,
	  		article_url : articles[index].link,
	  		posted_date : articles[index].published,
	  		summary : articles[index].content.split("<")[0],
	  		source : articles[index].feed.source
	  	});
	  }

	  storeArticle(feedArticles, 0, function(){
	  	next();
	  });
	  
	});
}

function storeArticle(feedArticles, index, next){
	console.log ("Entering storeArticle");
	if (index < feedArticles.length){
		DataAccess.saveArticle(feedArticles[index], function (){
			storeArticle(feedArticles, index + 1, next);
		});
	}
	else {
		next();
	}
}

function storeFeedData(rssFeeds, next){
	console.log ("Entering storeFeedData");
	async.parallel({
		one: function (next){
			feedFunction(rssFeeds, 0, next);
		},
		two: function (next){
			feedFunction(rssFeeds, 1, next);
		},
		three: function (next){
			feedFunction(rssFeeds, 2, next);
		},
		four: function (next){
			feedFunction(rssFeeds, 3, next);
		},
		five: function (next){
			feedFunction(rssFeeds, 4, next);
		}
	}, function(err, results){

		next();

	});
	
}

function getRssFeeds(rssLink, next){
	console.log ("Entering getRssFeeds");

	request(rssLink, function(error, response, html){

        if(!error){

            var $ = cheerio.load(html);

			var title, release, rating;
			var links = [];

			$('.rssp').filter(function(){

		        var data = $(this);

		        var link = data.children().first().attr('href');

		        links.push(link);
	        });

			next(links.slice(1, 6));
		}
	})
}

module.exports = router;
