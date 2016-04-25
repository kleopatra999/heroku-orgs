'use strict';

let cli    = require('heroku-cli-util');
let co     = require('co');
let extend = require('util')._extend;

function* run (context, heroku) {
  const FREE_TEAM_LIMIT = 5;
  let org   = context.org;
  let email = context.args.email;
  let role  = context.flags.role;
  let members = yield heroku.get(`/organizations/${org}/members`);
  let features = yield heroku.get('/account/features');
  let orgCreationFeature = features.find(function(feature) {
    return feature.name === 'standard-org-creation';
  });

  let request = heroku.request({
    method: 'PUT',
    path:   `/organizations/${org}/members`,
    body:   {email, role},
  });
  yield cli.action(`Adding ${cli.color.cyan(email)} to ${cli.color.magenta(org)} as ${cli.color.green(role)}`, request);
  if ((members.length === FREE_TEAM_LIMIT) && orgCreationFeature) {
    cli.log("You'll be billed monthly for teams over 5 members.");
  }
}

let cmd = {
  topic:        'members',
  command:      'add',
  description:  'adds a user to an organization',
  needsAuth:    true,
  needsOrg:     true,
  args:         [{name: 'email'}],
  flags: [
    {name: 'role', char: 'r', hasValue: true, required: true, description: 'member role (admin, collaborator, member, owner)'},
  ],
  run:          cli.command(co.wrap(run))
};


module.exports.add = cmd;
module.exports.set = extend({}, cmd);
module.exports.set.command = 'set';
module.exports.set.description = 'sets a members role in an organization';
