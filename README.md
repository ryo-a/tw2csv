# tw2csv

Useful CLI tool for collecting tweets.

If you haven't set up Node.js environment, you should install it.  

## v0.x -> v1

There are destructive changes from v0.x to v1.x. Please re-setup the app configuration file.

## Install

```
npm install -g tw2csv
```

## How to use

At first, get your application's keys from [developer.twitter.com](https://developer.twitter.com/en) and setup command.

```sh
# directory name "tweets" is just an example
$ mkdir ~/tweets
$ cd ~/tweets
$ tw2csv
```

If there isn't `tw2csv-config.json`, tw2csv will generate it automatically.
You have to set Twitter app's keys to `tw2csv-config.json` like below.

```json
{
    "appKey": "***************************",,
    "appSecret": "***************************",,
    "accessToken": "***************************",
    "accessSecret": "***************************"
}
```

Then you can run tw2csv!

```sh
$ tw2csv search "Node.js" results.csv
```

## Commands

### Search Tweets

REST API: `search/tweets`

```sh
$ tw2csv search "KEYWORDS FOR SEARCH" OUTPUT_FILENAME.csv
```

#### Options

- `--bot` (`-b`) : Ignore tweets from possible bots. tw2csv detect bots based on the source is on its allow list. So if you need to be careful at the misdetection, I recommend not to turn on.
- `--rt` (`-r`) : Ignore retweets.
- `--quote` (`-q`) : Ignore quote tweets.
- `--mention` (`-m`) : Ignore replies (mentions).
- `--linebreak` (`-l`) : Remove line breaks in tweets and user's bio. Please turn it on if your tool or script have a trouble with multi-lined CSV file.
- `--verbose` (`-v`) : verbose mode. Show all logs on console.

### Check API Access Limits

```sh
$ tw2csv limit
```


