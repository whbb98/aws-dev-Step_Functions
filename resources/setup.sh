#!/bin/bash
sudo yum -y remove python36
sudo yum -y install python38
sudo update-alternatives --set python /usr/bin/python3.8
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm awscliv2.zip
sudo pip install boto3

echo Please enter a valid IP address:
read ip_address
echo IP address:$ip_address
echo Please wait...
#sudo pip install --upgrade awscli #removed since we just installed it above.
bucket=`aws s3api list-buckets --query "Buckets[].Name" | grep s3bucket | tr -d ',' | sed -e 's/"//g' | xargs`
apigateway=`aws apigateway get-rest-apis | grep id | cut -f2- -d: | tr -d ',' | xargs`
echo $apigateway
FILE_PATH="/home/ec2-user/environment/resources/public_policy.json"
FILE_PATH_2="/home/ec2-user/environment/resources/permissions.py"
FILE_PATH_3="/home/ec2-user/environment/resources/setup.sh"
FILE_PATH_4="/home/ec2-user/environment/resources/website/config.js"
sed -i "s/<FMI_1>/$bucket/g" $FILE_PATH
sed -i "s/<FMI_2>/$ip_address/g" $FILE_PATH
sed -i "s/<FMI>/$bucket/g" $FILE_PATH_2

sed -i "s/API_GW_BASE_URL_STR: null,/API_GW_BASE_URL_STR: \"https:\/\/${apigateway}.execute-api.us-east-1.amazonaws.com\/prod\",/g" $FILE_PATH_4

aws s3 cp ./resources/website s3://$bucket/ --recursive --cache-control "max-age=0"

python /home/ec2-user/environment/resources/permissions.py
python /home/ec2-user/environment/resources/seed.py


cd /home/ec2-user/environment/resources/codebase_partner

touch Dockerfile

echo 'FROM node:11-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]
' > Dockerfile


account_id=`aws sts get-caller-identity --query "Account" --output "text"`

docker build --tag cafe/node-web-app .

docker tag cafe/node-web-app:latest "${account_id}.dkr.ecr.us-east-1.amazonaws.com/cafe/node-web-app:latest"

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${account_id}.dkr.ecr.us-east-1.amazonaws.com"


docker push "${account_id}.dkr.ecr.us-east-1.amazonaws.com/cafe/node-web-app"

cd /home/ec2-user/environment

echo "setting up RDS"
MYPASS='coffee_beans_for_all'
MYDB=`aws rds  describe-db-cluster-endpoints --query DBClusterEndpoints[0].Endpoint --output text`
mysql -h $MYDB -P 3306 -u admin -p$MYPASS -e "CREATE USER 'nodeapp' IDENTIFIED WITH mysql_native_password BY 'coffee';GRANT all privileges on COFFEE.* to 'nodeapp'@'%'; CREATE DATABASE COFFEE; USE COFFEE; GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, RELOAD, PROCESS, REFERENCES, INDEX, ALTER, SHOW DATABASES, CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, REPLICATION SLAVE, REPLICATION CLIENT, CREATE VIEW, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, CREATE USER, EVENT, TRIGGER ON *.* TO 'nodeapp'@'%' WITH GRANT OPTION;"
mysql -h $MYDB -P 3306 -u admin -p$MYPASS -e "source ./resources/coffee_db_dump.sql"
echo "seeded rds"


echo "swap out beanstalk code"

mkdir bean
cd bean
touch Dockerrun.aws.json

echo '{
   "AWSEBDockerrunVersion": "1",
   "Image": {
   	 "Name": "'${account_id}'.dkr.ecr.us-east-1.amazonaws.com/cafe/node-web-app",
     "Update": "true"
   },
   "Ports": [ { "ContainerPort" : 3000 } ]
}' > Dockerrun.aws.json


aws s3 cp Dockerrun.aws.json s3://$bucket/ --cache-control "max-age=0"

echo "try spawn beanstalk"
# result = `aws elasticbeanstalk update-applicatiion --source"./bean/Dockerrun.aws.json"`
result=`aws elasticbeanstalk create-application-version --application-name MyNodeApp --version-label v2 --description MyAppv2 --source-bundle S3Bucket="${bucket}",S3Key="Dockerrun.aws.json" --auto-create-application`

echo $result

result2=`aws elasticbeanstalk update-environment --environment-name MyEnv --version-label v2`

echo $result2



#API GW stuff


rest_api=`aws apigateway get-rest-apis --query items[0].id --output text`
parent_id=$(aws apigateway get-resources --rest-api-id ${rest_api} --query items[?path==\`/\`][id] --output text)

echo "rest_api"
echo $rest_api
echo "parent_id"
echo $parent_id

create_resource=$(aws apigateway create-resource --rest-api-id ${rest_api} --path-part 'bean_products' --parent-id ${parent_id})
echo $create_resource


bean_id=$(aws apigateway get-resources --rest-api-id ${rest_api} --query items[?path==\`/bean_products\`][id] --output text)
echo $bean_id


put_bean_result=`aws apigateway put-method --rest-api-id ${rest_api} --resource-id ${bean_id} --http-method GET --authorization-type 'NONE' --no-api-key-required`

echo $put_bean_result


bs_url=http://`aws elasticbeanstalk describe-environments --environment-names MyEnv --query Environments[0].CNAME --output text`/beans.json
echo $bs_url

put_bean_integration=`aws apigateway put-integration --rest-api-id ${rest_api} --resource-id ${bean_id} --http-method GET --type HTTP_PROXY --integration-http-method GET --uri ${bs_url}`

echo $put_bean_integration


# deploying=$(aws apigateway update-stage --rest-api-id ${rest_api} --stage-name prod --patch-operations op=update,path=\`/\`,value=string)
deploying=$(aws apigateway create-deployment --rest-api-id ${rest_api} --stage-name prod)
echo $deploying


echo "done"
