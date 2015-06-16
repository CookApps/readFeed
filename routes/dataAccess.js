var mongoose = require('mongoose');
var DataAccess = {};
mongoose.connect('mongodb://localhost/feeds');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("Database connection open!!");
});

var feedsSchema = mongoose.Schema({
    title: {type: String, index: { unique: true }},
    article_url: String,
    posted_date: String,
    summary: String,
    source: String
});

var Feed = mongoose.model('Feed', feedsSchema);

DataAccess.saveArticle = function(article, next){
	console.log ("Entering saveArticle");

	var feedData = new Feed({ title: article.title, article_url: article.article_url, 
		posted_date: article.posted_date, summary: article.summary, source: article.source});

	feedData.save(function (err, feedData) {
	  if (err) {
	  	console.error(err);
	  }

	  next();
	});
}

DataAccess.loadArticles = function (next){
	console.log ("Entering loadArticles");

	Feed.find(function (err, feeds) {
	  if (err) {
	  	console.error(err);
	  }

	  console.log(feeds);
	  next(feeds);
	});
}

module.exports = DataAccess;
