'use strict';

// TODO extract out Node.js module. See http://stackoverflow.com/questions/6048504/synchronous-request-in-nodejs

Email = this.Email || {};

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
 * @param {boolean} options.forceRemoveDots
 * @param {boolean} options.forceRemoveTags
 * @param {boolean} options.detectProvider - Make a DNS call to detect if the email host provider is one that might
 *        provide email address tags, such as Google Apps for Work. Requires callback on the client.
 * @param {function} [callback] - On the client and only if `detectProvider` is true: callback that will be passed
 *        `error` and `result`. This is required because we make an async HTTP request to DNS resolve the domain.
 * @returns {string}
 */
Email.normalize = function normalizeEmail(email, options, callback) {
  // TODO destructure when ES6 lands
  options = options || {};
  options.forceRemoveDots = options.forceRemoveDots || false;
  options.forceRemoveTags = options.forceRemoveTags || false;
  options.detectProvider = options.detectProvider || false;

  email = email.trim().toLowerCase();
  
  var emailParts = email.split(/@/);
  var user = emailParts[0];
  var domain = emailParts[1];

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

  if (options.detectProvider) {
    // detect custom domain email hosting providers TODO providers from https://news.ycombinator.com/item?id=8533588

    var processMXRecords = function processMXRecords(address, user) {
      // presumably, if at least one MX points to a service provider, then the user should expect the provider's special handling when it comes to dots or address tags
      if (/aspmx.*google.*\.com\.?$/i.test(address)) {
        return user.split('+')[0].replace(/\./g, '');  // Google Apps for Work
      }
      // FastMail - https://www.fastmail.com/help/receive/domains.html
      if (/\.messagingengine\.com\.?$/i.test(address)) {
        return user.split('+')[0];  // dots are significant - https://www.fastmail.com/help/account/changeusername.html
      }
      return user;
    };

    if (Meteor.isClient) {
      if (typeof callback !== 'function')
        throw new Error('Detecting the provider from the client requires a callback.');

      return HTTP.get('http://enclout.com/api/v1/dns/show.json', {params: {url: domain}}, function (error, result) {
        if (error) return callback(error);
        console.log(result);
        var addresses = result.data.dns_entries;
        for (var i = 0; i < addresses.length; i++) {
          if (!addresses[i].Type) return callback('Could not find Type field in Enclout API result. Has the format changed?');
          if (addresses[i].Type === 'MX') user = processMXRecords(addresses[i].RData, user);
        }
        // Either nothing matched, or some MX record did, and `user` was changed. Yes, multiple records could in theory match, but how would anyone decide in that case how to treat the user part?
        return callback(null, user + '@' + domain);
      });
    } else {
      // On the server, we can use directly https://nodejs.org/api/dns.html#dns_dns_resolvemx_hostname_callback
      var resolveMx = Meteor.wrapAsync(Npm.require('dns').resolveMx);
      if (typeof callback === 'function') {
        resolveMx(domain, function (error, addresses) {
          if (error) return callback(error);

          for (var i = 0; i < addresses.length; i++) {
            user = processMXRecords(addresses[i].exchange, user);
          }
          // nothing matched
          return callback(null, user + '@' + domain);
        });
      } else {
        // synchronous server code
        var addresses = resolveMx(domain);
        for (var i = 0; i < addresses.length; i++ ) {
          user = processMXRecords(addresses[i].exchange, user);
        }
        return user + '@' + domain;
      }
    }
  }

  return user + '@' + domain;
};
