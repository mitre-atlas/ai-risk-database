# AI Risk Database

The [AI Risk Database](https://airisk.io) is a tool for discovering and reporting the risks associated with public machine learning models. The database is specifically designed for organizations that rely on AI for their operations, providing them with a comprehensive and up-to-date overview of the risks and vulnerabilities associated with publicly available models.

To contibute model vulnerabilities, please [submit a report on the AI Risk Database website](https://airisk.io/report-vulnerability).

This repository contains source code for the AI Risk Database.

## Repository overview

Top-level directories - see `README.md` files within each for more information:

- `airdb`: Python modules that define AI Risk Database database schemas, repository scanners, and other utilities
- `docker`: Dockerfiles for the frontend and server
- `frontend`: Source code for the Next.js website
- `lint`: Bash scripts and configuration files for Python linting and formatting
- `scripts`: Python scripts for database management and population
- `server`: Python API server source code and Caddy reverse proxy configuration file

## Standing up a local instance of the AI Risk Database

### Docker

To use docker-compose to set up the system locally, ensure both Docker and Docker Compose V1 (i.e. `docker-compose`) are available.

1. Create the following files at the root of this project:
    - `API_KEY.secret`: a string representing the API secret that for frontend and server
      + For example, run `openssl rand -base64 32 > API_KEY.secret`
    - `DB_PASSWORD`: a string representing the MySQL database password
      + For example, run `openssl rand -base64 32 > DB_PASSWORD`
2. (Optional) For persisted local data, create the directories `data-mysql` and `data-caddy` and edit the `docker-compose.yml` file to comment them in as service volumes.
3. Run `docker-compose up` to launch the services.  `Ctrl+C` to stop.

## Get in touch

- See [CONTRIBUTING.md](./CONTRIBUTING.md) for getting started with development contributions
- Discuss at [#ai-risk-database](https://mitreatlas.slack.com/archives/C05L8DY5UQY) ([Join Slack](https://join.slack.com/t/mitreatlas/shared_invite/zt-10i6ka9xw-~dc70mXWrlbN9dfFNKyyzQ))
