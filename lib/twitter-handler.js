'use strict'
const fs = require('fs');
const twitter = require('twitter');
const moment = require('moment');
const colors = require('colors');
const csv = require('./tiny-csv-handler.js');
const utility = require('./utils.js');
var keys = null;

const utils = new utility();

module.exports = class twitterAPI {
  constructor(consumer_key, consumer_secret, access_token_key, access_token_secret) {
    this.consumer_key = consumer_key;
    this.consumer_secret = consumer_secret;
    this.access_token_key = access_token_key;
    this.access_token_secret = access_token_secret;

    this.client = new twitter({
      consumer_key: this.consumer_key,
      consumer_secret: this.consumer_secret,
      access_token_key: this.access_token_key,
      access_token_secret: this.access_token_secret
    });

  }

  rateLimit() {
    this.client.get('application/rate_limit_status', (error, data) => {
      if (error) console.log(error);
      let rateLimitOfSearch = data.resources.search["/search/tweets"];
      let limitResetTime = moment.unix(rateLimitOfSearch.reset);
      console.log(`Search: ${rateLimitOfSearch.remaining}/${rateLimitOfSearch.limit} (reset: ${limitResetTime.format("YYYY-MM-DD HH:mm:ssZ")})`);
    });
  }

  searchTweets(queryArg, outputFileName, nextResultsMaxIdArg = null, countArg = 100, allowRetweets = false, allowBots = false) {
    let _this = this; //avoid "undefined" in `this.client.get()`;
    this.client.get('search/tweets', { q: queryArg, count: countArg, max_id: nextResultsMaxIdArg }, function (error, searchData, response) {
      for (let item in searchData.statuses) {
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

        let pushingArray =
          [tweet.created_at,
          tweet.id_str,
          tweet.text,
            twitterClientMatch,
          tweet.lang,
          tweet.coordinates,
          tweet.retweet_count,
          tweet.favorite_count,
          tweet.user.id_str,
          tweet.user.screen_name,
          tweet.user.name,
          tweet.user.location,
          tweet.user.description,
          tweet.user.protected,
          tweet.user.statuses_count,
          tweet.user.friends_count,
          tweet.user.followers_count,
          tweet.user.listed_count,
          tweet.user.favourites_count,
          tweet.user.created_at,
          tweet.user.verified
          ];

        let tweetIsRT = utils.isRT(tweet.text);
        let userIsHuman = utils.isHuman(twitterClientMatch);

        if ((allowBots && !tweetIsRT) || (!allowBots && userIsHuman && !tweetIsRT)) {
          csv.dataAppend(outputFileName, pushingArray);
        }

        /*[WIP]
        if (
          (allowRetweets && allowBots) ||
          (!allowRetweets && !utils.isRT(tweet.text) && !allowBots && utils.isHuman(twitterClientMatch)) ||
          (!allowRetweets && !utils.isRT(tweet.text) && allowBots) ||
          (allowRetweets && allowBots && utils.isHuman(twitterClientMatch))
        ) {
          csv.dataAppend(outputFileName, pushingArray);
        }
        

        if (!utils.isRT(tweet.text) && utils.isHuman(twitterClientMatch)) {
          csv.dataAppend(outputFileName, pushingArray);
        }*/

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
        _this.searchTweets(queryArg, outputFileName, maxId[1], countArg, allowRetweets, allowBots);
      } else {
        console.log(colors.yellow('+++++++ 🐤  Complete +++++++++'));
        return 0;
      }
    });
  }

  /* experimental */
  stream(queryArg, outputFileName) {
    this.client.stream('statuses/filter', { track: queryArg }, (stream) => {
      stream.on('data', (tweet) => {
        if (tweet.text == undefined) {
          return 1;
        }
        if (!tweet.text.includes('RT \@')) {

          let twitterClientMatch;
          if (tweet.source != undefined) {
            let twitterClient = tweet.source.match(/<a href=\".*\">([^<]*)<\/a>/);
            if (twitterClient != null && twitterClient != undefined) {
              twitterClientMatch = twitterClient.length < 2 ? 'null' : twitterClient[1];
            }
          } else {
            twitterClientMatch = 'NA';
          }

          let pushingArray =
            [tweet.created_at,
            tweet.id_str,
            tweet.text,
              twitterClientMatch,
            tweet.lang,
            tweet.coordinates,
            tweet.retweet_count,
            tweet.favorite_count,
            tweet.user.id_str,
            tweet.user.screen_name,
            tweet.user.name,
            tweet.user.location,
            tweet.user.description,
            tweet.user.protected,
            tweet.user.statuses_count,
            tweet.user.friends_count,
            tweet.user.followers_count,
            tweet.user.listed_count,
            tweet.user.favourites_count,
            tweet.user.created_at,
            tweet.user.verified
            ];

          csv.dataAppend(outputFileName, pushingArray);

        }
      });

      stream.on('error', function (error) {
        console.log(error);
      });

      stream.on('close', function (cls) {
        console.error(cls);
      })
    });
  }



}




