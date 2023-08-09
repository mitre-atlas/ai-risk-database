.PHONY: lint lint_diff quick_lint_format format test

## Lint using pylint, black, isort, pydocstyle, and mypy
lint:
	@echo "You are running full lint, which is quite slow. Use 'make quick_lint_format' for a quicker linting experience"
	( \
	    mypy --ignore-missing-imports --disallow-untyped-defs --show-error-codes airdb && \
	    PATH=$(PATH):$(PWD)/lint lint/run_ri_lint \
	)

## Only lint (modified, unchecked, changed against master) files
lint_diff:
	( \
	    mypy --ignore-missing-imports --disallow-untyped-defs --show-error-codes airdb && \
	    PATH=$(PATH):$(PWD)/lint lint/run_ri_lint_diff \
	)

# Run format and mypy for a quick linting experience
quick_lint_format:
	( \
	    mypy --ignore-missing-imports --disallow-untyped-defs --show-error-codes airdb && \
	    PATH=$(PATH):$(PWD)/lint lint/run_ri_format \
	)

## Format using black and isort
format:
	PATH=$(PATH):$(PWD)/lint lint/run_ri_format

# Remove unused Python imports
autoflake:
	autoflake --remove-all-unused-imports --ignore-pass-after-docstring --exclude venv* --ignore-init-module-imports -i -r .

test:
	pytest tests

## start the webserver
serve-local:
	cd frontend && npm i && cd .. && ./start_server.bash

serve:
	./start_server.bash --prod --load_balance=3 --domain="airisk.io, airiskdatabase.com, www.airisk.io, www.airiskdatabase.com"
        # to serve on 0.0.0.0, must do this as root after sourcing .venv/bin/activate

serve-staging:
	cd frontend && npm i && cd .. && ./start_server.bash --domain="staging.airisk.io" --sudo
        # to serve on 0.0.0.0, must do this as root after sourcing .venv/bin/activate

# managing docker images
build_frontend_docker:
	cd frontend && sudo docker build -t airdb-frontend -f ../docker/frontend.Dockerfile .

build_filescan_docker:
	docker build -t airdb-filescan -f docker/filescanning/Dockerfile .

stop_docker:
	sudo docker stop airdb-frontend-container && sudo docker rm airdb-frontend-container

replace_frontend_docker: build_frontend_docker
	sudo docker stop airdb-frontend-container && sudo docker rm airdb-frontend-container && sudo docker run -d --network=host --name airdb-frontend-container airdb-frontend

# updating derived tables
update_derived_tables:
	python -m scripts.update_tags_table && python -m scripts.update_sha256_table && python -m scripts.update_filescan_table
