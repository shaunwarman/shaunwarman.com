const ghpages = require('gh-pages');
const child = require('child_process');

const cmd = 'git rev-parse --abbrev-ref HEAD';
const branch = child.execSync(cmd, { encoding: 'utf-8' }).trim();

const repo = 'shaunwarman.com';
console.log(
  `On branch ${branch}. Deploying documentation to the shaunwarman/${repo} repo..`
);

ghpages.publish(
  'public',
  {
    message: 'Auto-generated commit',
    repo: `git@github.com:shaunwarman/${repo}.git`
  },
  err => {
    if (err) {
      console.error(`❌  There was an error publishing docs`);
      console.error(err);
      process.exit(1);
    } else {
      console.log(`✅  Docs published successfully`);
      console.log(
        `    https://github.com/pages/shaunwarman/${repo}/`
      );
    }
  }
);
