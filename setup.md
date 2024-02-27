# deploy
1 - pull the code from git 
2 - npm install
3 - serverless deploy
4 - pass the long url in body of the post request after service is deployed
5 - u will get response as a short link which rediercts to original url or content
6 - test command "npx jest"
7 - pass these with postman body
post - https://jzhfyvlqlb.execute-api.us-east-1.amazonaws.com/createhash
body - {
  "url": "https://www.youtube.com/watch?v=diji6JMYKdo"
}
get - https://jzhfyvlqlb.execute-api.us-east-1.amazonaws.com/redirect/{hash}
