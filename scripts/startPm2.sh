#!/bin/bash
pm2 start ../test/client/spec/e2e/runner/webdriver-manager.json
PORT=9042 pm2 start pm2.conf.json
