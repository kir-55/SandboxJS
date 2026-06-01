# SandboxJS
Interactive 2D grain sandbox, to play in a browser when you're bored.
You can create, play and delete your own worlds, but also you can discover worlds made by others, clone them and play!!

To avoid unwanted content, admin can remove worlds that are inappropriate

[Play Now](sandbox.firegame.pl)

## SETUP
```npm install```

### If for some reason doesnt work ->
    npm install express ejs mysql2 cookie-parser dotenv argon2 jsonwebtoken

### Setup .env
    HOST=localhost
    PORT=8000

    DB_HOST=localhost
    DB_USER=root

    DB_PASSWORD=yourpassword
    DB_NAME=sandboxjs
    JWT_SECRET=your_super_secret_key_change_this

    PEPER=peper

### DB
YOU WILL HAVE TO INSTALL MYSQL!!
(good luck with that)

    source db/db.sql

### Seeder
    node db/seeder.js

### Run Application
    node index.js

### User test account:
    login: user
    password: userpassword

### Admin test account: 
    login: admin
    password: adminpassword
