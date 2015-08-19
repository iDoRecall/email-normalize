# iDoRecall:email-normalize
[![Build Status](https://travis-ci.org/iDoRecall/email-normalize.svg)](https://travis-ci.org/iDoRecall/email-normalize) [![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/idorecall/email-normalize.svg)](http://isitmaintained.com/project/idorecall/email-normalize "Average time to resolve an issue") [![Percentage of issues still open](http://isitmaintained.com/badge/open/idorecall/email-normalize.svg)](http://isitmaintained.com/project/idorecall/email-normalize "Percentage of issues still open") ![GitHub license](https://img.shields.io/:license-mit-blue.svg?style=flat)

Client/server Meteor package to normalize email addresses to their canonical form:

* remove dots in GMail or email addresses hosted by similar services (Google Apps for Work, FastMail)
* remove [address tags](https://en.wikipedia.org/wiki/Email_address#Sub-addressing) starting with '+', or '-' for Yahoo!, or '=' as well if desired
* converts alias domains to the canonical one, e.g. googlemail.com to gmail

This is useful for a variety of reasons:

* Get the real Gravatar of a user who registers for your service with theiremail+yourservice@gmail.com. We use this at [iDoRecall](https://idorecall.com).
* Detect duplicate emails for fraud prevention.

## Works for

* `gmail.com`, `googlemail.com` and `google.com` - the [only domains Google is known to use for incoming email](https://en.wikipedia.org/wiki/List_of_Google_domains)
* Any domain [hosted with Google Apps for Work](https://en.wikipedia.org/wiki/Google_Apps_for_Work#Gmail)
* FastMail and [domains hosted with FastMail](https://www.fastmail.com/help/receive/domains.html)
* Microsoft's outlook.com, hotmail.com, live.com
* Yahoo! domains

Pull requests to factor out the Meteor-independent code to use as a Node package are welcome.


## Usage

The most common and general invocation is asynchronous:

```js
let normalizedEmail = Email.normalize('a.b.c+tag@domain.com', {detectProvider: true}, function callback(error, result) {
  // result will be abc@domain.com if they use Google Apps, or unchanged otherwise
});
```

The general syntax is:

```js
var normalizedEmail = Email.normalize(emailAddress, options, [callback]);  // abc@gmail.com
```

`options` is an object with the following keys, all optional:

* `forceRemovePeriods` - default `false`
* `forceRemoveTags` - default `false`; if true, will remove anything between the first '+', '-' or '=' and the '@' sign
* `detectProvider` - default `false` because it makes a DNS lookup request for the MX record of the domain to see if it might be a Google Apps for Business or a Fastmail domain, in which case appropriate rules will apply. If `detectProvider` is true, a callback is *required* on the client and optional on the server.
* `callback` - only required if `detectProvider` is true, and the code runs on the client

The email provider detection is done on the client by using the [Enclout DNS API](http://enclout.com/api/v1/dns). If you run into any rate limits, please [file an issue](issues) to add support for authentication.

### Notes

If you're using this package to canonicalize email addresses for Gravatar, make sure to search (i.e. compute the hash for) the original email address first, since the user might legitimately always use something like `first.last@gmail.com`. Also, the original email address should always have priority (consider a user who has Gravatars for both `user+games@example.com` and `user+professional@example.com`).

When sending email use the original as well - it's respectful to your users to email them at the address they have supplied, since custom filter rules might depend on it.


## Prior art

* [normalize-email](https://github.com/johnotander/normalize-email) npm package - doesn't support Yahoo! or FastMail. We [started contributing](https://github.com/johnotander/normalize-email/issues/1) by fixing the naive removal of dots from Microsoft accounts (which was an error), but it quickly became apparent that a more comprehensive approach was needed.
* [djanho-canonical-email](https://github.com/julianwachholz/django-canonical-email) - written in Python, doesn't support anything but Gmail
* [soundcloud/normailize](https://github.com/soundcloud/normailize) - Ruby, not maintained since March 2013


## License and copyright

Maintainer: Dan Dascalescu ([@dandv](https://github.com/dandv))

Copyright (C) 2015 [iDoRecall](http://idorecall.com), Inc.

The MIT License (MIT)
