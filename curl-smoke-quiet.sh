#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3001}"

STAMP="$(date +%s)"

EMAIL="smoke_${STAMP}@example.com"
USERNAME="smoke_${STAMP}"
PASSWORD="password123"

register_body="$(
  jq -nc \
    --arg email "$EMAIL" \
    --arg username "$USERNAME" \
    --arg password "$PASSWORD" \
    '{email:$email,username:$username,password:$password,age:null,gender:"",city:"",interests:[]}'
)"

register_code="$(
  curl -sS -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d "$register_body"
)"
printf "register: %s\n" "$register_code"

login_body="$(
  jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password}'
)"

login_resp="$(
  curl -sS -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$login_body"
)"
access_token="$(echo "$login_resp" | jq -r '.accessToken')"

if [[ -z "$access_token" || "$access_token" == "null" ]]; then
  echo "login: failed"
  exit 1
fi

echo "login: 200"

party_body="$(jq -nc '{description:"",address:"",keywords:[]}')"

party_resp="$(
  curl -sS -X POST "$BASE_URL/party/create" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json" \
    -d "$party_body"
)"
party_id="$(echo "$party_resp" | jq -r '.id')"
party_name="$(echo "$party_resp" | jq -r '.partyName')"

if [[ -z "$party_id" || "$party_id" == "null" ]]; then
  echo "party/create: failed"
  exit 1
fi

echo "party/create: 201"
printf "partyId: %s\n" "$party_id"

name_prefix="$(echo "$party_name" | awk '{print $1}')"
name_prefix_encoded="$(jq -rn --arg v "$name_prefix" '$v|@uri')"

search_code="$(
  curl -sS -o /dev/null -w "%{http_code}" \
    "$BASE_URL/api/parties/search?partyName=$name_prefix_encoded"
)"
printf "party/search: %s\n" "$search_code"

