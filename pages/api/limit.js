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

function getRelativeTime (current, previous) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;
  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)} seconds`;
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} minutes`;
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} hours`;
  } else if (elapsed < msPerMonth) {
    return `approximately ${Math.round(elapsed / msPerDay)} days`;
  } else if (elapsed < msPerYear) {
    return `approximately ${Math.round(elapsed / msPerMonth)} months`;
  }
  return `approximately ${Math.round(elapsed / msPerYear)} years`;
}

export default async function handler (req, res) {
  /**
   * Run the middleware.
   */
  await runMiddleware(req, res, cors);
  const limit = await github.rateLimit.get();
  const limitData = { ...limit?.data?.resources?.core };
  limitData.relative_reset = getRelativeTime(new Date(), new Date(limit?.data?.resources?.core?.reset))
  res.json({ message: limitData });
}
