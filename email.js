'use strict';

var dns = Npm.require('dns');
var dnsResolve = Meteor.wrapAsync(dns.resolve);
// TODO client-side DNS resolver: http://enclout.com/api/v1/dns/show.json?url=domain.com
// http://stackoverflow.com/questions/6048504/synchronous-request-in-nodejs

Email = Email || {};

Email.domainsWithTags = {
  // Google only has two Gmail domains: https://en.wikipedia.org/wiki/List_of_Google_domains
  'gmail.com': '+',
  'googlemail.com': '+',
  'google.com': '+',  // corporate email addresses; TODO presumably country domains also receive corporate email?
  // Microsoft
  'outlook.com': '+',
  'hotmail.com': '+',
  'live.com': '+',
  // Fastmail - https://www.fastmail.com/help/receive/addressing.html TODO: whatever@username.fastmail.com -> username@fastmail.com
  'fastmail.com': '+',
  'fastmail.fm': '+',
  // Yahoo Mail Plus accounts, per https://en.wikipedia.org/wiki/Yahoo!_Mail#Email_domains, use hyphens - http://www.cnet.com/forums/discussions/did-yahoo-break-disposable-email-addresses-mail-plus-395088/
  'yahoo.com.ar' : '-',
  'yahoo.com.au' : '-',
  'yahoo.at' : '-',
  'yahoo.be/fr' : '-',
  'yahoo.be/nl' : '-',
  'yahoo.com.br' : '-',
  'ca.yahoo.com' : '-',
  'qc.yahoo.com' : '-',
  'yahoo.com.co' : '-',
  'yahoo.com.hr' : '-',
  'yahoo.cz' : '-',
  'yahoo.dk' : '-',
  'yahoo.fi' : '-',
  'yahoo.fr' : '-',
  'yahoo.de' : '-',
  'yahoo.gr' : '-',
  'yahoo.com.hk' : '-',
  'yahoo.hu' : '-',
  'yahoo.co.in/yahoo.in' : '-',
  'yahoo.co.id' : '-',
  'yahoo.ie' : '-',
  'yahoo.co.il' : '-',
  'yahoo.it' : '-',
  'yahoo.co.jp' : '-',
  'yahoo.com.my' : '-',
  'yahoo.com.mx' : '-',
  'yahoo.ae' : '-',
  'yahoo.nl' : '-',
  'yahoo.co.nz' : '-',
  'yahoo.no' : '-',
  'yahoo.com.ph' : '-',
  'yahoo.pl' : '-',
  'yahoo.pt' : '-',
  'yahoo.ro' : '-',
  'yahoo.ru' : '-',
  'yahoo.com.sg' : '-',
  'yahoo.co.za' : '-',
  'yahoo.es' : '-',
  'yahoo.se' : '-',
  'yahoo.ch/fr' : '-',
  'yahoo.ch/de' : '-',
  'yahoo.com.tw' : '-',
  'yahoo.co.th' : '-',
  'yahoo.com.tr' : '-',
  'yahoo.co.uk' : '-',
  'yahoo.com' : '-',
  'yahoo.com.vn' : '-'
};


/**
 * Normalize an email address by removing the dots and address tag.
 * @param {string} email
 * @param {object} [options]
 * @returns {string}
 */
Email.normalize = function normalizeEmail(email, options) {
  options = options || {};
  options.forceRemoveDots = options.forceRemoveDots || false;
  options.forceRemoveTags = options.forceRemoveTags || false;
  options.detectProvider = options.detectProvider || false;

  email = email.trim().toLowerCase();
  
  var emailParts = email.split(/@/);
  var user = emailParts[0];
  var domain = emailParts[1];

  if (options.detectProvider) {
    // detect custom domain email hosting providers TODO providers from https://news.ycombinator.com/item?id=8533588
    var addresses = dnsResolve(domain, 'MX');
    addresses.forEach(function (address) {
      address = address.exchange.toLowerCase();
      // presumably, if at least one MX points to a service provider, then the user should expect the provider's special handling when it comes to dots or address tags
      if (/aspmx.*google.*\.com$/.test(address)) {
        user = user.split('+')[0].replace(/\./g, '');  // Fastmail
        return user + '@' + domain;
      }
      // FastMail - https://www.fastmail.com/help/receive/domains.html
      if (/\.messagingengine\.com$/.test(address)) {
        user = user.split('+')[0];  // dots are significant - https://www.fastmail.com/help/account/changeusername.html
        return user + '@' + domain;
      }
    });
  }

  if (options.forceRemoveTags) {
    user = user.replace(/[-+=].*/, '');
  } else {
    var separator = Email.domainsWithTags[domain];
    if (separator) user = user.split(separator)[0];
  }

  if (options.forceRemoveDots || /^(gmail|googlemail|google)\.com$/.test(domain)) {
    user = user.replace(/\./g, '');
  }

  if (domain === 'googlemail.com') {
    domain = 'gmail.com';
  }

  return user + '@' + domain;
};
