const fs = require('fs');
const twitter = require('twitter');
const moment = require('moment');
const colors = require('colors');
const csv = require('./tiny-csv-handler.js');
const utility = require('./utils.js');
var keys = null;

const utils = new utility();

exports.search = (arg) => {
  searchTweet(arg.keyword, arg.output, null, 100, arg.consumer_key, arg.consumer_secret, arg.access_token_key, arg.access_token_secret);
};

exports.rateLimit = (arg)=>{
  ratelimit(arg.consumer_key, arg.consumer_secret, arg.access_token_key, arg.access_token_secret);
};

function ratelimit(consumer_key, consumer_secret, access_token_key, access_token_secret){
  let client = new twitter({
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    access_token_key: access_token_key,
    access_token_secret: access_token_secret
  });
  
    client.get('application/rate_limit_status', function(error, data) {
      if(error) throw error;
      let rateLimitOfSearch = data.resources.search["/search/tweets"];
      let limitResetTime = moment.unix(rateLimitOfSearch.reset);
      console.log(`Search: ${rateLimitOfSearch.remaining}/${rateLimitOfSearch.limit} (reset: ${limitResetTime.format("YYYY-MM-DD HH:mm:ssZ")})`);
    });
}


function searchTweet(queryArg, outputFileName, nextResultsMaxIdArg = null, countArg = 100, consumer_key, consumer_secret, access_token_key, access_token_secret) {
  let client = new twitter({
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    access_token_key: access_token_key,
    access_token_secret: access_token_secret
  });

  client.get('search/tweets', { q: queryArg, count: countArg, max_id: nextResultsMaxIdArg }, function (error, searchData, response) {
    for (item in searchData.statuses) {
      let tweet = searchData.statuses[item];
      let twitterClientMatch;
      if (tweet.source != undefined) {
        let twitterClient = tweet.source.match(/<a href=\".*\">([^<]*)<\/a>/);
        if (twitterClient != null && twitterClient != undefined) {
          twitterClientMatch = twitterClient.length < 2 ? 'null' : twitterClient[1];
        }
      } else {
        twitterClientMatch = 'NA';
      }

      pushingArray =
        [tweet.created_at,
        tweet.id_str,
        tweet.text,
          twitterClientMatch,
        tweet.user.id_str,
        tweet.user.name,
        tweet.user.friends_count,
        tweet.user.followers_count,
        tweet.user.location,
        tweet.user.verified
        ]; //"Date","tweetId","text","source","userId","userName","following","followers","location","verified"
      if (!tweet.text.includes('RT @') && utils.isHuman(tweet.source)) {
        csv.dataAppend(outputFileName, pushingArray);
      }
    }
    if (searchData.search_metadata == undefined) {
      console.log(colors.yellow('+++++++ 🐤  Complete (no metadata) +++++++++'));
      return 0;
    }
    else if (searchData.search_metadata.next_results) {
      let maxId = searchData.search_metadata.next_results.match(/\?max_id=(\d*)/);
      if (maxId[1] == null) {
        return 0;
      }
      console.log(colors.green(`↓↓↓↓↓↓↓ 🔍  Searching (Next:${maxId[1]})　↓↓↓↓↓↓↓`));
      searchTweet(queryArg, outputFileName, maxId[1], countArg, consumer_key, consumer_secret, access_token_key, access_token_secret);
    } else {
      console.log(colors.yellow('+++++++ 🐤  Complete +++++++++'));
      return 0;
    }
  });
}

