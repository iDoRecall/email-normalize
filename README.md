iDoRecall:email-normalize [![Build Status](https://travis-ci.org/iDoRecall/email-normalize.svg)](https://travis-ci.org/iDoRecall/email-normalize) ![GitHub license](https://img.shields.io/:license-mit-blue.svg?style=flat)
=========================

Meteor package to normalize email addresses to their canonical form:

* remove dots in Google Mail addresses
* remove [address tags](https://en.wikipedia.org/wiki/Email_address#Sub-addressing) starting with '+', or '-' for Yahoo!, or '=' as well if desired
* converts alias domains to the canonical one, e.g. googlemail.com to gmail

This is useful for a variety of reasons:

* Get the real Gravatar of a user who registers for your service with theiremail+yourservice@gmail.com. We use this at [iDoRecall](https://idorecall.com).
* Detect duplicate emails.

Works for:

* `gmail.com`, `googlemail.com` and `google.com` - the [only domains Google is known to use for incoming email](https://en.wikipedia.org/wiki/List_of_Google_domains)
* Any domain [hosted with Google Apps for Work](https://en.wikipedia.org/wiki/Google_Apps_for_Work#Gmail)
* FastMail and [domains hosted with FastMail](https://www.fastmail.com/help/receive/domains.html)
* Microsoft's outlook.com, hotmail.com, live.com
* Yahoo! domains

Pull requests to factor out the Meteor-independent code to use as a Node package are welcome.


## Usage

```js
var normalizedEmail = Email.normalize('a.b.c+tag@gmail.com', options);  // abc@gmail.com
```

`options` is an object with the following keys, all options:

* `forceRemovePeriods` - default `false`
* `forceRemoveTags` - default `false`; if true, will remove anything between the first '+', '-' or '=' and the '@' sign
* `detectProvider` - default `false` because it makes a DNS lookup request for the MX record of the domain to see if it might be a Google Apps for Business domain, in which case Gmail rules will be applied


### Notes

If you're using this package to canonicalize email addresses for Gravatar, make sure to search (i.e. compute the hash for) the original email address first, since the user might legitimately always use something like `first.last@gmail.com`. Also, the original email address should always have priority (consider a user who has Gravatars for both `user+games@example.com` and `user+professional@example.com`).

When sending email use the original as well - it's respectful to your users to email them at the address they have supplied, since custom filter rules might depend on it.


## Prior art

* [normalize-email](https://github.com/johnotander/normalize-email) npm package - doesn't support Yahoo! or FastMail. We [started contributing](https://github.com/johnotander/normalize-email/issues/1) by fixing the naive removal of dots from Microsoft accounts, which was an, but it quickly became apparent that a more comprehensive approach was needed.
* [djanho-canonical-email](https://github.com/julianwachholz/django-canonical-email) - written in Python, doesn't support anything but Gmail
* [soundcloud/normailize](https://github.com/soundcloud/normailize) - Ruby, not maintained since March 2013


## License and copyright

Maintainer: Dan Dascalescu ([@dandv](https://github.com/dandv))

Copyright (C) 2015 [iDoRecall](http://idorecall.com), Inc.

The MIT License (MIT)
