# GoldMine WebAPI

---

## Directory Structure

- `server.js` is the entry point for the webAPI

### husky/

- contains all git hooks
- [Husky](https://www.npmjs.com/package/husky). Library To Setup Git Hooks
- [Learn How To Set Git Hooks](https://www.freecodecamp.org/news/how-to-add-commit-hooks-to-git-with-husky-to-automate-code-tasks/)

### apiDocs/

- contains Swagger API documentation File (api.yaml)
- this configuration file is auto generated when you run command `npm run apiDocs` (Check npm scripts in package.json)

### app/

- `app` contains the whole source code of the api. Inside `app`, there are three directories: `config`, `controllers`, `services`, `test`.
- `config` contains the configuration file for the webAPI server.
- `controllers` contains API controllers files
- `services` contains API services files
- `test` contains test files

### bin/

- `bin` contains various startup scripts. there are 2 more directories: `apiDocs` and `docker`.
  - `apiDocs` contains all the script to generate the api configuration file (`apiDocs/api.yaml`)
  - `docker` contains all the script to start application in docker

### cloudbuild/

- `cloudbuild` contains all the cloud build configuration file
- this configuration file define steps to do when even the certain event happens, events like create a pull request for certain branch like dev and beta, merge PP into main branches like dev and beta.

### helpers/

- `helpers` contains all the server level helpers files for logging, pagination, validation, etc.

### nginx/

- `nginx` contains all the configuration file like certificates and domain configuration
- [Read More About Nginx](https://www.nginx.com/resources/glossary/nginx/)

### terraform/

- `terraform` contains all the infrastructure related configuration files, there are 2 more directories: `dev`, `beta`
- `dev` contains all the Infra configuration for Dev Environment
- `beta` contains all the Infra configuration for Beta Environment
- we have used technic called [`Infrastructure as Code`](https://learn.hashicorp.com/tutorials/terraform/infrastructure-as-code)

### Configuration Files

- Linting & Formatting [Read More About Linting and Formatting](https://www.digitalocean.com/community/tutorials/linting-and-formatting-with-eslint-in-vs-code)
  - `.prettierignore`
  - `.prettierrc`
  - `.eslintignore`
- Sequelize
  - `.sequelizerc`
- Test Coverage
  - `.nycrc`
- Git
  - `.gitignore`
  - `known_hosts.github`
  - `pull_request_template.md`
- Docker
  - `DockerFile`
  - `.dockerignore`
  - `docker-compose.yml`
  - `docker-compose.text.yml`
- WebAPI Env Vars
  - `.env.local`
  - `.env.test`
- Node
  - `.nvmrc`
  - `package.json`
  - `package-lock.json`

### Scripts

- email patterns uploader
  - `emailPatternUploader.js`
    - script that read a email patterns from a CSV file and upload the patterns in GoldMine Database

- database relates operations
  - `syncMasterDBModels.js`
    - script that sync sequelize model of master to masterDB.
  - `dropMasterDBModels.js`
    - script that destroy the sequelize models of master in masterDB.
  - `syncModels.js`
    - script that sync sequelize model of goldmine to goldmineDB.
  - `dropModels.js`
    - script that drop sequelize models of goldMine from goldmineDB

- package requirement checker
  - `check-node-version.js`
    - script to check users current node version is compatibile with webAPI or not.
