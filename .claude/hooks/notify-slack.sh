#!/usr/bin/env bash

set -euo pipefail

# Configuration
WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
LOG_FILE="${CLAUDE_PROJECT_DIR}/.claude/hooks/slack-hook.log"
DEBUG="${CLAUDE_HOOK_DEBUG:-false}"

# Function to log messages
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to debug log
debug() {
  if [[ "$DEBUG" == "true" ]]; then
    log "DEBUG: $1"
  fi
}

# Function to get event emoji
get_event_emoji() {
  case "$1" in
    "Notification") echo "🔔" ;;
    "Stop") echo "🏁" ;;
    "PreToolUse") echo "🛠️" ;;
    "PostToolUse") echo "👍" ;;
    "UserPromptSubmit") echo "💬" ;;
    "SessionStart") echo "🚀" ;;
    "SessionEnd") echo "⏻" ;;
    *) echo "ℹ️" ;;
  esac
}

# Function to get event color
get_event_color() {
  case "$1" in
    "Notification") echo "good" ;;
    "Stop") echo "warning" ;;
    "PreToolUse") echo "#439FE0" ;;
    "PostToolUse") echo "good" ;;
    "UserPromptSubmit") echo "#9013FE" ;;
    "SessionStart") echo "good" ;;
    "SessionEnd") echo "#757575" ;;
    *) echo "#757575" ;;
  esac
}

# Main function
main() {
  # Check if webhook URL is configured
  if [[ -z "$WEBHOOK_URL" ]]; then
    log "ERROR: SLACK_WEBHOOK_URL environment variable not set"
    exit 1
  fi

  # Read JSON input from stdin
  EVENT_JSON=$(cat)
  debug "Received JSON: $EVENT_JSON"

  # Parse JSON for additional context if available
  EVENT_TYPE=""
  EVENT_MESSAGE=""
  USER_NAME=""
  TOOL_NAME=""
  if command -v jq &> /dev/null && [[ -n "$EVENT_JSON" ]]; then
    EVENT_TYPE=$(echo "$EVENT_JSON" | jq -r '.hook_event_name // empty' 2>/dev/null || echo "")
    EVENT_MESSAGE=$(echo "$EVENT_JSON" | jq -r '.message // empty' 2>/dev/null || echo "")
    USER_NAME=$(echo "$EVENT_JSON" | jq -r '.transcript_path // empty' | awk -F'/' '{print $3}' 2>/dev/null || echo "")
    TOOL_NAME=$(echo "$EVENT_JSON" | jq -r '.tool_name // empty' 2>/dev/null || echo "")
  fi

  # Get event details
  EMOJI=$(get_event_emoji "$EVENT_TYPE")
  COLOR=$(get_event_color "$EVENT_TYPE")
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  # Build message
  MESSAGE_TEXT="$EMOJI *$USER_NAME*"
  if [[ -n "$EVENT_MESSAGE" ]]; then
    MESSAGE_TEXT="$MESSAGE_TEXT: $EVENT_MESSAGE"
  fi

  # Send to Slack
  debug "Sending message: $MESSAGE_TEXT"

  RESPONSE=$(curl -s -X POST -H 'Content-type: application/json' \
    --data "{
      \"text\": \"$MESSAGE_TEXT\"
    }" \
    "$WEBHOOK_URL" 2>&1)

  if [[ $? -eq 0 ]]; then
    log "SUCCESS: Notification sent for event '$EVENT_TYPE'"
    debug "Slack response: $RESPONSE"
  else
    log "ERROR: Failed to send notification for event '$EVENT_TYPE': $RESPONSE"
    exit 1
  fi
}

# Run main function
main "$@"
