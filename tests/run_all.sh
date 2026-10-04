#!/bin/sh
# Full verification: syntax + unit + integration scenarios.
# Usage: ./run_all.sh   (from the tests/ directory)
set -e
cd "$(dirname "$0")"
python3 extract_module.py
python3 gen_unit_tests.py
node --check app_module.mjs && echo "MODULE SYNTAX OK"
node --check nomodule.js && echo "NOMODULE SYNTAX OK"
node test_parse.mjs | tail -1
for sc in 1 2 3 4 5 6 7; do
  node test_integration.mjs $sc 2>/dev/null | grep -E "PASSED|FAILURES" || true
done
