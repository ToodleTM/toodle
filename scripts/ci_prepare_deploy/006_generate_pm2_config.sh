#1/bin/bash -e

echo "{
	"name":"maintenance",
	"script":"./server.js",
	"cwd":"./dist",
	"env":{
		"PORT":4242,
		"NODE_ENV":"maintenance"
	}
}" > ./pm2-maintenance.json

echo "{
    "name":"production",
    "script":"./server.js",
    "cwd":"./dist",
    "env":{
        "PORT":4242,
        "NODE_ENV":"production"
    }
}" > ./pm2-production.json
