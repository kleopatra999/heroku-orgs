'use strict';

let cli     = require('heroku-cli-util');
let co      = require('co');
let _       = require('lodash');
let Utils   = require('../../lib/utils');

function printJSON (orgs) {
  cli.log(JSON.stringify(orgs, null, 2));
}

function print (orgs) {
  // Here we're filtering by these fields, though ideally we should filter by their flags
  orgs = _.sortBy(_.filter(orgs, { "provisioned_licenses": true, "credit_card_collections": false }), 'name');

  cli.table(orgs, {
    columns: [
      {key: 'name', label: 'Organization', format: o => cli.color.green(o)},
      {key: 'role', label: 'Role', format: r => Utils.roleName(r)},
    ]
  });
}

function* run (context, heroku) {
  let orgs = yield heroku.get('/organizations');
  if (context.flags.json) printJSON(orgs);
  else                    print(orgs);
}

module.exports = {
  topic:        'orgs',
  description:  'list the organizations that you are a member of',
  needsAuth:    true,
  flags: [
    {name: 'json', description: 'output in json format'},
  ],
  run:          cli.command(co.wrap(run))
};
