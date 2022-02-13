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

const Avatars = Object.freeze({
  get DEFAULT_THEME_1 () { return 'https://cdn.vizality.com/assets/default-theme-1.png'; },
  get DEFAULT_THEME_2 () { return 'https://cdn.vizality.com/assets/default-theme-2.png'; },
  get DEFAULT_THEME_3 () { return 'https://cdn.vizality.com/assets/default-theme-3.png'; },
  get DEFAULT_THEME_4 () { return 'https://cdn.vizality.com/assets/default-theme-4.png'; },
  get DEFAULT_THEME_5 () { return 'https://cdn.vizality.com/assets/default-theme-5.png'; },
  // ---
  get DEFAULT_PLUGIN_1 () { return 'https://cdn.vizality.com/assets/default-plugin-1.png'; },
  get DEFAULT_PLUGIN_2 () { return 'https://cdn.vizality.com/assets/default-plugin-2.png'; },
  get DEFAULT_PLUGIN_3 () { return 'https://cdn.vizality.com/assets/default-plugin-3.png'; },
  get DEFAULT_PLUGIN_4 () { return 'https://cdn.vizality.com/assets/default-plugin-4.png'; },
  get DEFAULT_PLUGIN_5 () { return 'https://cdn.vizality.com/assets/default-plugin-5.png'; }
});

const toHash = text => {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < text.length; i++) {
    ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString();
};

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


/**
 * Gets all of the addon repos currently active on the addon community repo.
 * @private
 */
export const generateAddonsList = async () => {
  const addons = {
    plugins: {},
    themes: {}
  };

  const org = await github.repos
    .listForOrg({
      org: 'vizality',
      repo: 'community',
      type: 'public'
    });

  // Filter out archived repos, as well as suggestions, applications, and guidelines repos
  const _addons = org?.data?.filter(d => !d.archive && d.name !== 'suggestions' && d.name !== 'applications' && d.name !== 'guidelines');
  for (const addon of _addons) {
    let type;
    // Determine if it's a plugin or theme
    const repoTopics = await github.repos
      .getAllTopics({
        owner: 'vizality-community',
        repo: addon.name
      });
    if (repoTopics?.data?.names?.includes('plugin')) type = 'plugins';
    if (repoTopics?.data?.names?.includes('theme')) type = 'themes';
    const tags = repoTopics?.data?.names?.filter(d => d !== 'plugin' && d !== 'theme' && d !== 'vizality');
    const _addon = addons[type][addon.name] = {};
    _addon.repo = addon.html_url;
    _addon.raw = `https://raw.githubusercontent.com/${addon.full_name}/${addon.default_branch}`;
    _addon.git = addon.clone_url;
    _addon.addonId = addon.name;
    _addon.tags = tags;
    // Get and set the manifest for the addon
    const manifest = await github.repos
      .getContent({
        owner: 'vizality-community',
        repo: addon.name,
        path: 'manifest.json'
      });

    const _manifest = JSON.parse(Buffer.from(manifest?.data?.content, 'base64').toString());

    const validExtensions = [ '.png', '.jpg', '.jpeg' ];

    const assets = await github.repos
      .getContent({
        owner: 'vizality-community',
        repo: addon.name,
        path: 'assets'
      });

    if (_manifest.icon) {
      if (validExtensions.some(ext => _manifest.icon.endsWith(ext))) {
        _manifest.icon = `${_addon.raw}/${_manifest.icon}`;
      } else {
        const addonIdHash = toHash(_addon.addonId);
        _manifest.icon = Avatars[`DEFAULT_${type.slice(0, -1).toUpperCase()}_${(addonIdHash % 5) + 1}`];
      }
    } else {
      const foundIcon = assets?.data?.find(a => a.name === 'icon.png' || a.name === 'icon.jpg' || a.name === 'icon.jpeg');
      if (foundIcon) {
        _manifest.icon = foundIcon.download_url;
      } else {
        const addonIdHash = toHash(_addon.addonId);
        _manifest.icon = Avatars[`DEFAULT_${type.slice(0, -1).toUpperCase()}_${(addonIdHash % 5) + 1}`];
      }
    }

    if (_manifest.banner) {
      if (validExtensions.some(ext => _manifest.banner.endsWith(ext))) {
        _manifest.banner = `${_addon.raw}/${_manifest.banner}`;
      }
    } else {
      const foundBanner = assets?.data?.find(a => a.name === 'banner.png' || a.name === 'banner.jpg' || a.name === 'banner.jpeg');
      if (foundBanner) {
        _manifest.banner = foundBanner.download_url;
      }
    }

    _addon.manifest = _manifest;
    _addon.sections = {};
    if (_manifest.sections?.readme) _addon.sections.readme = _manifest.sections.readme;
    if (_manifest.sections?.license) _addon.sections.license = _manifest.sections.license;
    if (_manifest.sections?.changelog) _addon.sections.changelog = _manifest.sections.changelog;

    if (!_addon.sections.readme || !_addon.sections.license || addon.sections.changelog) {
      const repoContent = await github.repos
        .getContent({
          owner: 'vizality-community',
          repo: addon.name
        });
      if (!_addon.sections.readme) {
        const readme = repoContent?.data?.find(d => d.path === 'README' || d.path === 'README.md')?.download_url;
        if (readme) _addon.sections.readme = readme;
      }
      if (!_addon.sections.license) {
        const license = repoContent?.data?.find(d => d.path === 'LICENSE' || d.path === 'LICENSE.md')?.download_url;
        if (license) _addon.sections.license = license;
      }
      if (!_addon.sections.changelog) {
        const changelog = repoContent?.data?.find(d => d.path === 'CHANGELOG' || d.path === 'CHANGELOG.md')?.download_url;
        if (changelog) _addon.sections.changelog = changelog;
      }
    }
    _addon.stars = addon.stargazers_count || 0;
  }
  return addons;
};

export default async function handler (req, res) {
  /**
   * Run the middleware.
   */
  await runMiddleware(req, res, cors);
  /**
   * Return the JSON response.
   */
  res.json({ message: (await generateAddonsList()) });
}
