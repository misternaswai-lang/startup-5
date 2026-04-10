#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

STAMP="$(date +%s)"
RAND="${RANDOM}"

EMAIL="user_${STAMP}_${RAND}@example.com"
USERNAME="user_${STAMP}_${RAND}"
PASSWORD="password123"

AGE=25
GENDER="male"
CITY="Москва"

INTEREST_1="дота"
INTEREST_2="кино"

KEYWORD_1="пикник"
KEYWORD_2="парк"
KEYWORD_UNIQ="k${STAMP}${RAND}"

DESCRIPTION="Собираемся на ${KEYWORD_1} в ${KEYWORD_2} (${KEYWORD_UNIQ})"
ADDRESS="Москва, Красная площадь"

register_body="$(
  jq -nc \
    --arg email "$EMAIL" \
    --arg username "$USERNAME" \
    --arg password "$PASSWORD" \
    --argjson age "$AGE" \
    --arg gender "$GENDER" \
    --arg city "$CITY" \
    --arg interest1 "$INTEREST_1" \
    --arg interest2 "$INTEREST_2" \
    '{email:$email,username:$username,password:$password,age:$age,gender:$gender,city:$city,interests:[$interest1,$interest2]}'
)"

echo "1) Регистрация: POST /register"
echo "curl -sS -X POST \"$BASE_URL/register\" -H \"Content-Type: application/json\" -d '$register_body'"
register_resp="$(
  curl -sS -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d "$register_body"
)"
echo "Ответ:"
echo "$register_resp" | jq .
echo

login_body="$(
  jq -nc \
    --arg email "$EMAIL" \
    --arg password "$PASSWORD" \
    '{email:$email,password:$password}'
)"

echo "2) Логин: POST /api/auth/login"
echo "curl -sS -X POST \"$BASE_URL/api/auth/login\" -H \"Content-Type: application/json\" -d '$login_body'"
login_resp="$(
  curl -sS -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$login_body"
)"
echo "Ответ:"
echo "$login_resp" | jq .
access_token="$(echo "$login_resp" | jq -r '.accessToken')"
echo

party_body="$(
  jq -nc \
    --arg description "$DESCRIPTION" \
    --arg address "$ADDRESS" \
    --arg keyword1 "$KEYWORD_1" \
    --arg keyword2 "$KEYWORD_2" \
    --arg keywordUniq "$KEYWORD_UNIQ" \
    '{description:$description,address:$address,keywords:[$keyword1,$keyword2,$keywordUniq]}'
)"

echo "3) Создание пати (минималка): POST /party/create"
echo "curl -sS -X POST \"$BASE_URL/party/create\" -H \"Authorization: Bearer <accessToken>\" -H \"Content-Type: application/json\" -d '$party_body'"
party_resp="$(
  curl -sS -X POST "$BASE_URL/party/create" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json" \
    -d "$party_body"
)"
echo "Ответ:"
echo "$party_resp" | jq .
party_id="$(echo "$party_resp" | jq -r '.id')"
party_name="$(echo "$party_resp" | jq -r '.partyName')"
echo

echo "4) Поиск по ключевому слову: GET /api/parties/search?keyword=$KEYWORD_UNIQ"
echo "curl -sS \"$BASE_URL/api/parties/search?keyword=$KEYWORD_UNIQ\""
search_kw_resp="$(curl -sS "$BASE_URL/api/parties/search?keyword=$KEYWORD_UNIQ")"
echo "Ответ:"
echo "$search_kw_resp" | jq .
echo

name_prefix="$(echo "$party_name" | awk '{print $1}')"
name_prefix_encoded="$(jq -rn --arg v "$name_prefix" '$v|@uri')"
echo "5) Поиск по partyName (ILIKE): GET /api/parties/search?partyName=$name_prefix"
echo "curl -sS \"$BASE_URL/api/parties/search?partyName=$name_prefix_encoded\""
search_name_resp="$(curl -sS "$BASE_URL/api/parties/search?partyName=$name_prefix_encoded")"
echo "Ответ:"
echo "$search_name_resp" | jq .
echo

echo "Готово: partyId=$party_id, keyword=$KEYWORD_UNIQ"
