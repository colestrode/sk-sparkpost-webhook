# sk-sparkpost-webhook
[![Build Status](https://travis-ci.org/colestrode/sk-sparkpost-webhook.svg?branch=master)](https://travis-ci.org/colestrode/sk-sparkpost-webhook)
[![Coverage Status](https://coveralls.io/repos/github/colestrode/sk-sparkpost-webhook/badge.svg?branch=master)](https://coveralls.io/github/colestrode/sk-sparkpost-webhook?branch=master)

A [Skellington](https://github.com/colestrode/skellington) plugin to get a sample SparkPost webhook payload.


## Getting Sample Events

This plugin will upload a sample SparkPost webhook payload and upload it as a file
in your Slack channel:

`@bot webhooks sample events`

These are sample events and not real data.

### Specifying Events

You can ask for specific events by passing a comma delimited list:

`@bot webhooks sample events: click, open, bounce`

