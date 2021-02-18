import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { Octokit } from '@octokit/rest';
import Cors from 'cors';

const github = new Octokit({
  authStrategy: createOAuthAppAuth,
  auth: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  }
});

// Initializing the cors middleware
const cors = Cors({
  methods: [ 'GET', 'HEAD' ]
});

/*
 * Helper method to wait for a middleware to execute before continuing
 * And to throw an error when an error happens in a middleware
 */
function runMiddleware (req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

this.addons = {
  plugins: {},
  themes: {}
};

/**
 * Gets all of the addon repos currently active on the addon community organization.
 * @private
 */
async function _getAddons () {
  const _addons = {
    plugins: {},
    themes: {}
  };

  const org = await github.repos
    .listForOrg({
      org: 'vizality-community',
      type: 'public'
    });

  // Filter out archived repos, as well as suggestions, applications, and guidelines repos
  const addons = org?.data?.filter(d => !d.archive && d.name !== 'suggestions' && d.name !== 'applications' && d.name !== 'guidelines');
  for (const addon of addons) {
    let type;
    // Determine if it's a plugin or theme
    const repo = await github.repos
      .getAllTopics({
        owner: 'vizality-community',
        repo: addon.name
      });
    if (repo?.data?.names?.includes('plugin')) type = 'plugins';
    if (repo?.data?.names?.includes('theme')) type = 'themes';
    const tags = repo?.data?.names?.filter(d => d !== 'plugin' && d !== 'theme' && d !== 'vizality');
    const _addon = _addons[type][addon.name] = {};
    _addon.repo = addon.html_url;
    _addon.git = addon.clone_url;
    _addon.addonId = addon.name;
    _addon.tags = tags;
    // Get and set the manifest for the addon
    const _manifest = await github.repos
      .getContent({
        owner: 'vizality-community',
        repo: addon.name,
        path: 'manifest.json'
      });

    const manifest = JSON.parse(Buffer.from(_manifest?.data?.content, 'base64').toString());
    _addon.manifest = manifest;
    _addon.sections = {};
    if (manifest.sections?.readme) _addon.sections.readme = manifest.sections.readme;
    if (manifest.sections?.license) _addon.sections.license = manifest.sections.license;
    if (manifest.sections?.changelog) _addon.sections.changelog = manifest.sections.changelog;

    if (!_addon.sections.readme || !_addon.sections.license || addon.sections.changelog) {
      const repo = await github.repos
        .getContent({
          owner: 'vizality-community',
          repo: addon.name
        });
      if (!_addon.sections.readme) {
        const readme = repo?.data?.find(d => d.path === 'README' || d.path === 'README.md')?.download_url;
        if (readme) _addon.sections.readme = readme;
      }
      if (!_addon.sections.license) {
        const license = repo?.data?.find(d => d.path === 'LICENSE' || d.path === 'LICENSE.md')?.download_url;
        if (license) _addon.sections.license = license;
      }
      if (!_addon.sections.changelog) {
        const changelog = repo?.data?.find(d => d.path === 'CHANGELOG' || d.path === 'CHANGELOG.md')?.download_url;
        if (changelog) _addon.sections.changelog = changelog;
      }
    }
  }
  return _addons;
}

if (!this.addons) {
  (async () => _getAddons())();
}

export default async function handler (req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);
  // Rest of the API logic
  res.json({ message: this.addons });
}
