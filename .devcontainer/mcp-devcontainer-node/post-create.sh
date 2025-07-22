#!/bin/bash

# Enable strict mode:
# -e  Exit immediately if a command exits with a non-zero status
# -u  Treat unset variables as an error
# -o pipefail  The return value of a pipeline is the status of the last command to exit with a non-zero status
# -x  Print commands and their arguments as they are executed (debug mode)
set -euxo pipefail

# Function to handle errors
error_handler() {
    local line="$1"
    local message="$2"
    local code="${3:-1}"
    echo "Error on line ${line}: ${message}; exiting with status ${code}" >&2
    exit "${code}"
}

# Trap errors and call error handler
trap 'error_handler ${LINENO} "Command failed"' ERR

# Main execution starts here
main() {
    echo "Starting npm dependency installation..."
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
    
    # Install npm dependencies
    # --audit=false skips vulnerability audit (optional, remove if you want audits)
    echo "Running npm install..."
    npm install --audit=false
    
    echo "npm install completed successfully."
    echo "Installed dependencies:"
    npm list --depth=0
}

# Execute main function
main "$@"
