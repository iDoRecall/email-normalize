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

Tinytest.add('Google Apps for Business', function (test) {
  test.equal(Email.normalize('a.b.c+tag@blueseed.com', {detectProvider: true}), 'abc@blueseed.com');
  test.equal(Email.normalize('a.b.c+tag@idorecall.com', {detectProvider: false}), 'a.b.c+tag@idorecall.com');
});

Tinytest.add('FastMail', function (test) {
  test.equal(Email.normalize('a.b.c+tag@fastmail.com'), 'a.b.c@fastmail.com');
  test.equal(Email.normalize('a.b.c+tag@fastmail.fm'), 'a.b.c@fastmail.fm');
  test.equal(Email.normalize('notpublic+tag@denis.gladkikh.email', {detectProvider: true}), 'notpublic@denis.gladkikh.email');  // http://outcoldman.com/en/archive/2014/05/08/fastmail/
  test.equal(Email.normalize('denis+tag@outcoldman.com', {detectProvider: false}), 'denis+tag@outcoldman.com');
});
