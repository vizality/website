const withPlugins = require('next-compose-plugins');
const { withDokz } = require('dokz/dist/plugin');

const nextConfiguration = {
  // Target must be serverless
  target: 'serverless'
};

const redirects = {
  async redirects () {
    return [
      {
        source: '/docs',
        destination: '/docs/start/getting-started',
        permanent: true
      }
    ];
  }
};

module.exports = withPlugins(
  [
    [ withDokz, { pageExtensions: [ 'js', 'jsx', 'md', 'mdx', 'ts', 'tsx' ] } ],
    [ redirects ]
  ],
  nextConfiguration
);
