"/c/Program Files/MongoDB 2.6 Standard/bin/mongod.exe" --dbpath /c/work/db &
set MONGOHQ_URL=mongodb://localhost/vietapp
export MONGOHQ_URL=mongodb://localhost/vietapp
node server.js
