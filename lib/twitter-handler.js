const fs = require('fs');
const path = require('path');
const colors = require('colors');
const { TwitterApi, TwitterV2IncludesHelper } = require('twitter-api-v2');
const { TwitterApiRateLimitPlugin } = require('@twitter-api-v2/plugin-rate-limit');
const rateLimitPlugin = new TwitterApiRateLimitPlugin();
const { stringify } = require('csv-stringify/sync');
const utilLib = require('./utils.js');

const clientAllowList = require('../res/client-allow-list.json');
const utils = new utilLib();

const csvHeaderFilePath = path.join(path.dirname(fs.realpathSync(process.argv[1])), './res/csvHeader.template');
const csvHeaderFromFile = fs.readFileSync(csvHeaderFilePath);
const csvHeader = csvHeaderFromFile.toString().replace(/(\r\n|\n\r|\n|\r)/g, '') + '\n'; //sanitize and append a line break

module.exports =
    class twitterAPI {
        constructor(appKey, appSecret, accessToken, accessSecret) {
            this.appKey = appKey;
            this.appSecret = appSecret;
            this.accessToken = accessToken;
            this.accessSecret = accessSecret;
            this.userClient = new TwitterApi({ appKey, appSecret, accessToken, accessSecret }, { plugins: [rateLimitPlugin] });
        }

        async getLimit() {
            await this.userClient.v2.me();
            const currentRateLimitForMe = await rateLimitPlugin.v2.getRateLimit('users/me');
            const resetTimeStamp = new Date(currentRateLimitForMe.reset * 1000);
            console.log(`[${colors.green('Info')}] API Limit ( ${currentRateLimitForMe.remaining} / ${currentRateLimitForMe.limit} ), Reset: ${resetTimeStamp.toLocaleString()}`) // 74
        }

        async searchTw(searchKeyword, options) {
            const numberOfTweets = { all: 0, normal: 0, retweets: 0, replies: 0, quotes: 0, bots: 0 };

            fs.writeFileSync(options.outfile, csvHeader, 'utf-8', (err) => {
                if (err) throw err;
            });

            const searchTwitterList = await this.userClient.v2.search(searchKeyword, { "tweet.fields": ["created_at", "source", "attachments", "lang", "referenced_tweets", "possibly_sensitive", "geo", "public_metrics", "reply_settings"], "expansions": ["author_id", "attachments.media_keys"], "media.fields": ["type", "url"], "user.fields": ["name", "username", "description", "public_metrics", "verified", "protected", "url", "created_at"] });
            const includes = new TwitterV2IncludesHelper(searchTwitterList);

            for await (const tweet of searchTwitterList) {
                const author = searchTwitterList.includes.author(tweet);
                //const medias = searchTwitterList.includes.medias(tweet);

                let reftw = '';
                if (tweet.referenced_tweets) {
                    reftw = tweet.referenced_tweets[0].type;
                }

                let tweetLat, tweetLng, tweetPlaceId = null;
                if (tweet.geo != undefined) {
                    if (tweet.geo.coordinates != undefined) {
                        tweetLat = tweet.geo.coordinates.coordinates[1];
                        tweetLng = tweet.geo.coordinates.coordinates[0];
                    }
                    tweetPlaceId = tweet.geo.place_id || null;
                }

                let tweetType = tweet.referenced_tweets ? tweet.referenced_tweets[0].type : 0;

                if (tweetType == 'retweeted') {
                    numberOfTweets.retweets++;
                } else if (tweetType == 'replied_to') {
                    numberOfTweets.replies++;
                } else if (tweetType == 'quoted') {
                    numberOfTweets.quotes++;
                } else {
                    numberOfTweets.normal++;
                }

                let maybeBot = 0;

                if (!clientAllowList.includes(tweet.source)) {
                    maybeBot = 1;
                    numberOfTweets.bots++;
                }

                numberOfTweets.all = numberOfTweets.retweets + numberOfTweets.replies + numberOfTweets.quotes + numberOfTweets.normal;

                if (
                    !(tweetType == 'retweeted' && options.ignoreRetweets == true) &&
                    !(tweetType == 'replied_to' && options.ignoreMentions == true) &&
                    !(tweetType == 'quoted' && options.ignoreQuotes == true) &&
                    !(maybeBot == 1 && options.ignoreBots == true)
                ) {
                    numberOfTweets.normal++;
                    let tweetData = [[
                        utils.removeLineBreakFromString(tweet.text, options.removeLineBreak),
                        tweet.created_at,
                        tweet.source,
                        maybeBot,
                        tweet.referenced_tweets ? tweet.referenced_tweets[0].type : 0,
                        tweet.public_metrics.like_count,
                        tweet.public_metrics.retweet_count,
                        tweet.possibly_sensitive,
                        tweet.reply_settings,
                        tweetLat,
                        tweetLng,
                        tweetPlaceId,
                        author.name,
                        author.username,
                        utils.removeLineBreakFromString(author.description, options.removeLineBreak),
                        author.url,
                        author.verified,
                        author.protected,
                        author.created_at,
                        author.public_metrics.tweet_count,
                        author.public_metrics.following_count,
                        author.public_metrics.followers_count,
                        author.public_metrics.listed_count,
                    ]];

                    if (options.verboseMode) {
                        console.log(tweetData);
                    }

                    fs.appendFile(options.outfile, stringify(tweetData, {
                        quoted: true
                    }), 'utf-8', (err) => {
                        if (err) throw err;
                    });

                    updateProgress(numberOfTweets, options);
                }
            }
            console.log('\nDone.');
        }
    }

function updateProgress(numberOfTweets, options) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Total: ${numberOfTweets.all} tweets (Normal : ${numberOfTweets.normal} / RTs${options.ignoreRetweets ? colors.gray(' (ignored)') : ''}: ${numberOfTweets.retweets} / Mentions${options.ignoreMentions ? colors.gray(' (ignored)') : ''}: ${numberOfTweets.replies} / Quotes${options.ignoreQuotes ? colors.gray(' (ignored)') : ''} : ${numberOfTweets.quotes}) (Possible bots${options.ignoreBots ? colors.gray(' (ignored)') : ''} : ${numberOfTweets.bots})`);
}