#!/usr/bin/env node
const fs = require('fs');
const cac = require('cac');
const colors = require('colors');
const utility = require('./lib/utils.js');
const twitterHandler = require('./lib/twitter-handler.js');

const cli = cac();
const utils = new utility();

const configFileName = 'tw2csv-config.json';

console.log(`${colors.cyan.bold('tw')}${colors.magenta.bold('2')}${colors.green.bold('csv')}`);

if (!utils.fileExists(configFileName)) {
  console.error(`${colors.red('ERR! NO CONFIG FILE')} : tw2csv generated ${colors.underline(configFileName)} in this directory.\nPlease edit ${configFileName} before running any other tw2csv commands.`);
  utils.generateJSON();
  return 1;
}

const config = require('./' + configFileName);
const twitterAPI = new twitterHandler(config.consumer_key, config.consumer_secret, config.access_token_key, config.access_token_secret);

const searchTweets = cli.command('search', {
  desc: 'Save tweets from search/tweets to CSV file'
}, (query, flags) => {
  let outputCSVPath = config.output_dir + '/' + query[1];
  console.log(`${colors.green('[search/tweets to CSV]')} Filter: ${query[0]}, CSV File: ${query[1]}`);

  if (!utils.fileExists(outputCSVPath)) {
    utils.generateBlankCSVwithHeader(outputCSVPath);
  }

  
  let allowRetweets = false, allowBots = false;
  /*
  [WIP]
  if (flags.retweets) {
    allowRetweets = true;
    console.log('RTS')
  }

  if (flags.bots) {
    allowBots = true;
  }
  */

  twitterAPI.searchTweets(query[0], outputCSVPath, null, 100, allowRetweets, allowBots);

})

/*[WIP]
searchTweets.option('retweets', {
  desc: 'Including retweets.'
})

searchTweets.option('bots', {
  desc: 'Including bot tweets'
})
*/

const streamFilter = cli.command('stream', {
  desc: 'Save tweets from statuses/filter to CSV file'
}, (query, flags) => {
  let outputCSVPath = config.output_dir + '/' + query[1];

  if (!utils.fileExists(outputCSVPath)) {
    utils.generateBlankCSVwithHeader(outputCSVPath);
  }

  console.log(`${colors.green('[Stream to CSV]')} Filter: ${query[0]}, CSV File: ${query[1]}`);
  console.log(`${colors.yellow('This is an experimental feature')}`);
  twitterAPI.stream(query[0], outputCSVPath);

})


const rateLimit = cli.command('limit', {
  desc: 'API Access Limit'
}, () => {
  twitterAPI.rateLimit();
});


cli.parse();
