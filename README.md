# Serverless Framework and Node
eas of use, i dont have to manage infrastructure manually.

# dynamoDB 
NoSQL database, which is unstructure, that means i dont have worry about structure of database.

# Encoding base62
1 - Base62 encoder allows us to use the combination of characters and numbers which contains A-Z, a-z, 0–9 total( 26 + 26 + 10 = 62)
Base62 encoding is often used for creating short, user-friendly urls. It's suitable for scenarios like URL hashing services.


# checking collision
i am generating 7 character short hash so ther are chance of collision so i am checking for collision as well , if collision occurs that means if already short url is present in db counter increased till the unique shorthash is generated

# test
written test case to generate hash


