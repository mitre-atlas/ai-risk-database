# AI Risk Database Scripts

This directory contains Python scripts for database management and population.

## Setup

Use Python 3.9+.

Install dependencies via `pip install -r requirements.txt` at the root project level.

## Run

Ensure the database is available with, started with `mysqld --sql_mode=""` to disable strict mode.

Ensure the following environemt variables are set:
```
export DB_ENDPOINT=<for ex. localhost>
export DB_PASSWORD=<the database password>
export DB_USER=<the database user>
```

Run the scripts in this order to populate the database:

```
# Update the repos index, re-scanning repos with last-scanned dates older than 5 days
python -m scripts.update_repos_table --force-older-than-days 5

# Scan files from `repos` index and create software bill of materials (sbom) index
python -m scripts.update_sbom_table --from-repos-table

# Create lookup table for sbom files by their sha256 hash value
python -m scripts.update_sha256_table

# Create lookup table for sbom files by artifacts they contain (i.e. pickle file artifacts)
python -m scripts.update_filescan_table

# Create lookup table for repos by tag (currently HuggingFace only)
python -m scripts.update_tags_table

# Create model info - summary for a model version and initial scores
python -m scripts.update_model_info_table
```

Run each script with `-h`` for further options.
