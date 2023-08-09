#!/bin/bash
if [[ -z "${API_KEY}" ]]; then
    API_KEY=`cat API_KEY.secret`
fi

if [[ -z "${API_SERVER}" ]]; then
    API_SERVER="http://localhost:4445"
fi

echo "API_KEY: ${API_KEY}"
echo "API_SERVER: ${API_SERVER}"

set -e # exit when any command fails
# keep track of the last executed command
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
trap 'echo "\"${last_command}\" command failed with exit code $?." && (tail -n 1 api_requests.json | jq .)' EXIT
set -x # verbose debug mode

### TEST routes
# /api/alive
curl --fail -X GET "${API_SERVER}/api/alive"

# /api/file_info
curl --fail -X GET "${API_SERVER}/api/file_info?sha256=00c0dcab98b14b5b8effa5724cc2b02d01624539460420c0ca13cbd9878da2ce" -H "Authorization: Bearer ${API_KEY}"

# /api/get_report
curl --fail -X GET "${API_SERVER}/api/get_report?id=report-002d495ee9ea47eea013b7f9d4df167e" -H "Authorization: Bearer ${API_KEY}"

# /api/model_info
curl --fail -X GET "${API_SERVER}/api/model_info?q=drhyrum/bert-tiny-torch-vuln" -H "Authorization: Bearer ${API_KEY}"

# /api/register_user
cat <<EOT >> github.json
{
  "provider": "github",
  "type": "User",
  "providerAccountId": "83820006",
  "access_token": "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",
  "token_type": "bearer",
  "scope": "read:user,user:email",
  "login": "antbysh",
  "id": "83820006",
  "node_id": "MDQ6VXNlcjgzODIwMDA2",
  "avatar_url": "https://avatars.githubusercontent.com/u/83820006?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/antbysh",
  "html_url": "https://github.com/antbysh",
  "followers_url": "https://api.github.com/users/antbysh/followers",
  "following_url": "https://api.github.com/users/antbysh/following{/other_user}",
  "gists_url": "https://api.github.com/users/antbysh/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/antbysh/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/antbysh/subscriptions",
  "organizations_url": "https://api.github.com/users/antbysh/orgs",
  "repos_url": "https://api.github.com/users/antbysh/repos",
  "events_url": "https://api.github.com/users/antbysh/events{/privacy}",
  "received_events_url": "https://api.github.com/users/antbysh/received_events",
  "site_admin": false,
    "name": "antbysh",
  "company": null,
  "blog": "",
  "location": null,
  "email": "antek.byszewski@gmail.com",
  "hireable": null,
  "bio": null,
  "twitter_username": null,
  "public_repos": 1,
  "public_gists": 0,
  "followers": 1,
  "following": 0,
  "created_at": "2021-05-07T11:57:07Z",
  "updated_at": "2023-01-20T17:36:07Z",
  "private_gists": 0,
  "total_private_repos": 3,
  "owned_private_repos": 3,
  "disk_usage": 1247,
  "collaborators": 2,
  "two_factor_authentication": true,
  "plan": {
    "name": "free",
    "space": 976562499,
    "collaborators": 0,
    "private_repos": 10000
  },
  "image": "https://avatars.githubusercontent.com/u/83820006?v=4"
}    
EOT
curl --fail -X POST --data-binary "@github.json" -H "Authorization: Bearer ${API_KEY}" "${API_SERVER}/api/register_user"
rm -f github.json

# /api/report_vote
curl --fail -X POST "${API_SERVER}/api/report_vote" --data-binary '{"state": "none", "report_id":"report-002d495ee9ea47eea013b7f9d4df167e","user_id":"user-b563978752a349f9ba1df7fe82613427"}' -H "Authorization: Bearer ${API_KEY}"

# /api/search
curl --fail -X GET "${API_SERVER}/api/search?q=bert&page=1&items=5&type=models&s=name:desc;date:asc&f=owner:drhyrum;source:huggingface,pytorch-hub" -H "Authorization: Bearer ${API_KEY}"
curl --fail -X GET "${API_SERVER}/api/search?q=attack&page=1&items=5&type=reports&f=type:security,ethics,operational" -H "Authorization: Bearer ${API_KEY}"
curl --fail -X GET "${API_SERVER}/api/search?q=op&page=1&items=5&type=artifacts&f=rare_only:true" -H "Authorization: Bearer ${API_KEY}"
curl --fail -X GET "${API_SERVER}/api/search?q=DOWNLOAD&page=1&items=5&type=files" -H "Authorization: Bearer ${API_KEY}"

# /api/submit_report
curl --fail -X POST "${API_SERVER}/api/submit_report" --data '{"user_id": "user-12fd582ddd0e4452adc70893bb80c386", "domain": "ethics", "reference_uris": [], "title": "test", "purls": [], "description": ""}' -H "Authorization: Bearer ${API_KEY}"

# /api/top_models
curl --fail -X GET "${API_SERVER}/api/top_models" -H "Authorization: Bearer ${API_KEY}"

# /api/top_orgs
curl --fail -X GET "${API_SERVER}/api/top_orgs" -H "Authorization: Bearer ${API_KEY}"

# /api/top_reports
curl --fail -X GET "${API_SERVER}/api/top_reports" -H "Authorization: Bearer ${API_KEY}"

# /api/top_users
curl --fail -X GET "${API_SERVER}/api/top_users" -H "Authorization: Bearer ${API_KEY}"

# /api/validate_query
curl --fail -X GET "${API_SERVER}/api/validate_query?q=pkg:huggingface/ahsanjavid/convnext-tiny-finetuned-cifar10@f9d0b1d7a7d197960cafb3bbb3573c264dcdc573" -H "Authorization: Bearer ${API_KEY}"

# /api/similar
curl --fail -X GET "${API_SERVER}/api/similar?q=pkg:huggingface/drhyrum/bert-tiny-torch-vuln@753c3cb70db0705e814b400330028ad5335246d3" -H "Authorization: Bearer ${API_KEY}"

# /api/upload_image
image_id=`curl --fail -X POST "${API_SERVER}/api/upload_image" --data '{"user_id": "user-12fd582ddd0e4452adc70893bb80c386", "b64image": "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII=", "encoding": "data:image/png" }' -H "Authorization: Bearer ${API_KEY}" | jq -r .image_id`

# /api/download_image
curl --fail -X GET "${API_SERVER}/api/get_image?id=${image_id}" -H "Authorization: Bearer ${API_KEY}"

# clear trap for exit
trap - EXIT
