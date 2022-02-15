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

function getRelativeTime (reset, current) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;
  const timeLeft = reset - current;

  if (timeLeft < msPerMinute) {
    return `${Math.round(timeLeft / 1000)} seconds`;
  } else if (timeLeft < msPerHour) {
    return `${Math.round(timeLeft / msPerMinute)} minutes`;
  } else if (timeLeft < msPerDay) {
    return `${Math.round(timeLeft / msPerHour)} hours`;
  } else if (timeLeft < msPerMonth) {
    return `approximately ${Math.round(timeLeft / msPerDay)} days`;
  } else if (timeLeft < msPerYear) {
    return `approximately ${Math.round(timeLeft / msPerMonth)} months`;
  }
  return `approximately ${Math.round(timeLeft / msPerYear)} years`;
}

export default async function handler (req, res) {
  /**
   * Run the middleware.
   */
  await runMiddleware(req, res, cors);
  const limit = await github.rateLimit.get();
  const limitData = { ...limit?.data?.resources?.core };
  limitData.relative_reset = getRelativeTime(new Date(limit?.data?.resources?.core?.reset * 1000), new Date());
  return res.status(200).json(limitData);
}
