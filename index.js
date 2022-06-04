#! /usr/bin/env node
const fs = require('fs');
const cli = require('cac')();
const colors = require('colors');
const packagejson = require('./package.json');
const twitterHandler = require('./lib/twitter-handler.js');
const utilLib = require('./lib/utils.js');

const configFileName = 'tw2csv.config.json';
const utils = new utilLib();

console.log(`${colors.cyan.bold('tw')}${colors.magenta.bold('2')}${colors.green.bold('csv')} ver ${packagejson.version}`);

if (!fs.existsSync('./' + configFileName)) {
  console.error(`[${colors.red('ERROR')}] No config file (tw2csv.config.json) found in this directory. `);
  utils.generateJSON();
  console.log(`[${colors.green('Info')}] tw2csv.config.json is generated on the current directory. ${colors.yellow('Please update it with your credential by yourself')}.`);
  console.log(`[${colors.green('Info')}] The current directory : ${process.cwd()}`)
} else {
  const config = JSON.parse(fs.readFileSync('./' + configFileName));
  const twitterAPI = new twitterHandler(config.appKey, config.appSecret, config.accessToken, config.accessSecret);

  (async () => {
    await twitterAPI.userClient.appLogin();
  })();

  // search (main command)
  cli
    .command('search <keyword> <outfile>', 'Search tweets')
    .option('-b, --bot', 'Ignore (possible) bot tweets')
    .option('-r, --rt', 'Ignore retweets')
    .option('-q, --quote', 'Ignore quote tweets')
    .option('-m, --mention', 'Ignore mentions')
    .option('-l, --linebreak', 'Remove line breaking (like \\n -> space)')
    .option('-v, --verbose', 'Verbose mode (show results in the console)')
    .action((keyword, outfile, options) => {
      const parsedOptions = {
        outfile,
        ignoreBots: options.bot || false,
        ignoreRetweets: options.rt || false,
        ignoreQuotes: options.quote || false,
        ignoreMentions: options.mention || false,
        removeLineBreak: options.linebreak || false,
        verboseMode: options.verbose || false
      }
      console.log(`${colors.yellow.bold('Search Tweets')} : ${keyword}`);
      console.log(`${colors.bold('Output Filename')} : ${outfile}`);
      console.log(`Options : \n  Ignore Bot Tweets: ${utils.decorateBoolean(parsedOptions.ignoreBots)}\n  Ignore Retweets: ${utils.decorateBoolean(parsedOptions.ignoreRetweets)}\n  Ignore Quote Tweets: ${utils.decorateBoolean(parsedOptions.ignoreQuotes)}\n  Ignore Mentions: ${utils.decorateBoolean(parsedOptions.ignoreMentions)}\n  Remove Line Breaking: ${utils.decorateBoolean(parsedOptions.removeLineBreak)}\n  Verbose Mode: ${utils.decorateBoolean(parsedOptions.verboseMode)}`);
      console.log(`-----------------------------`)
      twitterAPI.searchTw(keyword, parsedOptions);
    });

  //user home timeline (TODO)
  /*
  cli
    .command('user <userId> <outfile>', 'Search tweets')
    .option('-b, --bot', 'Ignore bot tweets')
    .option('-r, --rt', 'Ignore retweets')
    .option('-q, --quote', 'Ignore quote tweets')
    .option('-m, --mention', 'Ignore mentions')
    .option('-l, --linebreak', 'Keep line breaking')
    .option('-v, --verbose', 'Verbose mode (show results in the console)')
    .action((userId, outfile, options) => {

      console.log(`${colors.yellow.bold('User Timeline')} : @${userId}`);
      console.log(`${colors.bold('Output Filename')} : ${outfile}`);

    });*/

  // API Access Limit Check
  cli
    .command('limit')
    .action(() => {
      twitterAPI.getLimit();
    });

  cli.help();
  cli.parse();
}