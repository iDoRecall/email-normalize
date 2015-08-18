'use strict';

Package.describe({
  name: 'idorecall:email-normalize',
  version: '1.0.0',
  summary: 'Normalize email address to canonical form: rm dots, address tags: a.b+tag@gmail.com -> ab@gmail.com',
  git: 'https://github.com/idorecall/email-normalize',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.use('http', 'client');
  api.addFiles('email.js');
  api.export('Email');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('idorecall:email-normalize');
  api.addFiles('tests.js');
});
