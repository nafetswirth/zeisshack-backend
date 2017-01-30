# zeisshack-backend
Sources for serverless backend at zeisshack 2017

This uses serverless https://serverless.com/ to configure all needed aws resources via Cloudformation. 

The config is located in `serverless.yml`

It uses the AWS following services:

 * lambda (functions that run triggered by an event)
 * API Gateway (http mapping to lambda functions)
 * s3 triggers (trigger for a lambda function when a file is saved to s3)
 * SNS (trigger for a lambda when there is new sensor data)
 * DynamoDB (data store for sensor data and annotated images annotated with sensor data)
 * DynamoDB triggers (when new sensor data is saved it will run a function, function does nothing rn)

Beware of any signs or hackathon code e.g inconsitent naming, hardcoding etc.
