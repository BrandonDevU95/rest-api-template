const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageLockPath = path.join(projectRoot, 'package-lock.json');

const toTitleFromSlug = (slug) =>
  slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

const readEnv = () => {
  if (fs.existsSync(envPath)) {
    return dotenv.parse(fs.readFileSync(envPath));
  }

  if (fs.existsSync(envExamplePath)) {
    return dotenv.parse(fs.readFileSync(envExamplePath));
  }

  throw new Error('Neither .env nor .env.example was found.');
};

const env = readEnv();
const slug = env.PROJECT_SLUG;

if (!slug) {
  throw new Error('PROJECT_SLUG is required in .env (or .env.example).');
}

const title = toTitleFromSlug(slug);
const packageDescription = `${title} API template with Clean Architecture using Express, TypeScript, Sequelize, MySQL, Passport, JWT, Joi, Winston, and Swagger.`;

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.name = slug;
packageJson.description = packageDescription;
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

if (fs.existsSync(packageLockPath)) {
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
  packageLock.name = slug;

  if (packageLock.packages && packageLock.packages['']) {
    packageLock.packages[''].name = slug;
  }

  fs.writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
}

console.log(`Synchronized project metadata from PROJECT_SLUG=${slug}`);