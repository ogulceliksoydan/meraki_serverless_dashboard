import os, json, requests

API_KEY = os.getenv('MERAKI_DASHBOARD_API_KEY') or ''
headers = {"Content-Type": "application/json", "Accept": "application/json", "X-Cisco-Meraki-API-Key": API_KEY}
url = "https://api.meraki.com/api/v1/organizations/187186/configTemplates"

def lambda_handler(event, context):
    return json.loads(requests.get(url=url, headers=headers).text)