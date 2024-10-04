#!/bin/bash

$(> docs.sqlite)
cat migrate.sql | sqlite3 docs.sqlite
