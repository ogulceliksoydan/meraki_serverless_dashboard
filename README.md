#### Meraki Serverless Dashboard

This is a simple, custom web application that can be used to interact with the Meraki dashboard through APIs to perform a limited set of functions.

Use case:
The customer wants to delegate the entire process of a new store opening to the operations team, without exposing the Meraki dashboard.
So they want to have a limited-access dashboard where the operations team can create a new network and add devices to it but cannot perform any additional operation.

This web application is built completely on serverless components from AWS:
- S3 for frontend
- Cognito for authentication
- API Gateway and Lambda for business logic
- Dynamo DB for data persistence

You can deploy the CloudFormation template to create the infrastructure used for this web app. After deploying the template, take the following steps:

- Upload the frontend files to S3 and make them publicly readable
https://docs.aws.amazon.com/AmazonS3/latest/user-guide/set-object-permissions.html

- Create and activate users in Cognito. In this configuration you can create a user with just a username and a temporary password.
You can then use AWS CLI to change the temporary password to a new one to activate the user:

  - Note: To install and configure the AWS CLI:
https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html

```bash
aws cognito-idp admin-initiate-auth --user-pool-id Pool_id ^
--client-id App_client_id --auth-flow ADMIN_NO_SRP_AUTH ^
--auth-parameters USERNAME=user_name,PASSWORD=initial_password

aws cognito-idp admin-respond-to-auth-challenge --user-pool-id Pool_id ^
--client-id client_id --challenge-name NEW_PASSWORD_REQUIRED ^
--challenge-responses NEW_PASSWORD=new_password,USERNAME=user_name ^
--session session_string_from_the_previous_command
```



- Upload the function.zip files to Lambda
