'use strict';

Tinytest.add('Only supported domains', function (test) {
  test.equal(Email.normalize('a.b.c+tag@example.com'), 'a.b.c+tag@example.com');
});

Tinytest.add('Gmail dots', function (test) {
  test.equal(Email.normalize('a.b.c@gmail.com'), 'abc@gmail.com');
  test.equal(Email.normalize('a.b.c@yahoo.com'), 'a.b.c@yahoo.com');
});

Tinytest.add('plus', function (test) {
  test.equal(Email.normalize('a.b.c+tag@gmail.com'), 'abc@gmail.com');
  test.equal(Email.normalize('a.b.c+tag@yahoo.com'), 'a.b.c+tag@yahoo.com');
});

Tinytest.add('Non-standard TLDs', function (test) {
  test.equal(Email.normalize('a.b.c+tag@something.co.uk'), 'a.b.c+tag@something.co.uk');
  test.equal(Email.normalize('a.b.c+tag@something.co.uk', {forceRemoveDots: true, forceRemoveTags: true}), 'abc@something.co.uk');
});

Tinytest.add('Yahoo!', function (test) {
  test.equal(Email.normalize('a.b.c+tag@yahoo.com'), 'a.b.c+tag@yahoo.com');
  test.equal(Email.normalize('a.b.c-tag@yahoo.com'), 'a.b.c@yahoo.com');
  test.equal(Email.normalize('a.b.c-tag@yahoo.co.uk'), 'a.b.c@yahoo.co.uk');
  test.equal(Email.normalize('a-b.c-tag@yahoo.ro'), 'a@yahoo.ro');
});

Tinytest.add('Microsoft', function (test) {
  test.equal(Email.normalize('a.b.c+tag@outlook.com'), 'a.b.c@outlook.com');
  test.equal(Email.normalize('a.b.c-tag@hotmail.com'), 'a.b.c-tag@hotmail.com');
  test.equal(Email.normalize('a.b.c-tag@outlook.co.uk'), 'a.b.c-tag@outlook.co.uk');
  test.equal(Email.normalize('a.b.c+d@live.com'), 'a.b.c@live.com');
});

Tinytest.add('Google Apps for Work', function (test) {
  test.equal(Email.normalize('a.b.c+tag@idorecall.com', {detectProvider: false}), 'a.b.c+tag@idorecall.com');
  if (Meteor.isServer) test.equal(Email.normalize('a.b.c+tag@blueseed.com', {detectProvider: true}), 'abc@blueseed.com');  // sync server call
});

Tinytest.add('FastMail', function (test) {
  test.equal(Email.normalize('a.b.c+tag@fastmail.com'), 'a.b.c@fastmail.com');
  test.equal(Email.normalize('a.b.c+tag@fastmail.fm'), 'a.b.c@fastmail.fm');
  // http://outcoldman.com/en/archive/2014/05/08/fastmail/
  test.equal(Email.normalize('denis+tag@outcoldman.com', {detectProvider: false}), 'denis+tag@outcoldman.com');
});

Tinytest.addAsync('Async test Google Apps for Work', function (test, done) {
  Email.normalize('a.b.c+tag@blueseed.com', {detectProvider: true}, function (error, result) {
    test.equal(result, 'abc@blueseed.com');
    done();
  });
});

Tinytest.addAsync('Async test Fastmail', function (test, done) {
  Email.normalize('notpublic+tag@denis.gladkikh.email', {detectProvider: true}, function (error, result) {
    test.equal(result, 'notpublic@denis.gladkikh.email');
    done();
  });
});

Tinytest.addAsync('Async test no special provider', function (test, done) {
  Email.normalize('ad.missions+impossible@stanford.edu', {detectProvider: true}, function (error, result) {
    test.equal(result, 'ad.missions+impossible@stanford.edu', 'Returning the same email when no providers have been detected');
    done();
  });
});

if (Meteor.isClient) Tinytest.add('Async test on the client requires callback', function (test) {
  test.throws(function () {
    Email.normalize('a.b.c+tag@blueseed.com', {detectProvider: true});
  }, /callback/);
});
