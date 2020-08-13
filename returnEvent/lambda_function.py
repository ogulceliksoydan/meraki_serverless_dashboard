import os, json, requests, boto3

# MERAKI VARIABLES:
API_KEY = os.getenv('MERAKI_DASHBOARD_API_KEY') or ''
headers = {"Content-Type": "application/json", "Accept": "application/json", "X-Cisco-Meraki-API-Key": API_KEY}
MX_MS_MR = ["appliance", "switch", "wireless"]

client = boto3.client('dynamodb')

def lambda_handler(event, context):
    print(event)
    
    if event["netname"] == "": return "errors: Enter a network name"
    else:
        response = client.get_item(
            TableName='merakiNetworks',
            Key={
                'username': {'S': event["username"]},
                'netname': {'S': event["netname"]}
            }
        )
    
    try:
        net_id = response['Item']['netid']['S']
    except KeyError:
        #create network:
        net_url = "https://api.meraki.com/api/v1/organizations/187186/networks"
        net_payload = json.dumps({"name": event["netname"], "productTypes": MX_MS_MR})
        created = requests.post(url=net_url, headers=headers, data=net_payload)
        if created.status_code != 201: return created.text
        net_id = json.loads(created.text)['id']

        #bind network_id to template_id:
        bind_url = "https://api.meraki.com/api/v1/networks/" + net_id + "/bind"
        bind_payload = json.dumps({"configTemplateId": event["template"], "autoBind": False})
        requests.post(url=bind_url, headers=headers, data=bind_payload)

        #add network_name and network_id to dynamodb:
        client.put_item(
            TableName='merakiNetworks',
            Item={
                'username': {'S': event["username"]},
                'netname': {'S': event["netname"]},
                'netid': {'S': net_id}
            }
        )

    #add serials to network:
    add_url = "https://api.meraki.com/api/v1/networks/" + net_id + "/devices/claim"
    add_payload = json.dumps({"serials": event["serials"]})
    added = requests.post(url=add_url, headers=headers, data=add_payload)
    if added.status_code != 200: return "User "+event["username"]+" created network "+event["netname"]+" and bound to template_id "+event["template"]+" but adding devices failed: "+added.text
    
    return "User "+event["username"]+" created network "+event["netname"]+", bound to template_id "+event["template"]+", and added serials "+str(event["serials"])