# transfer.sh-web

This repository contains the web frontend for [transfer.sh](github.com/dutchcoders/transfer.sh/).

## How to use it 

You must specify `web-path`directory, pointing to `dist` generated folder (Grunt & bindata)

Sample :
```
docker run -d -v /folder:/uploads -v /folder/dist:/webapp --publish 5000:8080 dutchcoders/transfer.sh:latest --provider local --basedir /uploads --web-path /webapp/
```
## Requirement 
You must install first : 
* Grunt
* Bower
* Go > 1.4 & go-bindata (go get -u github.com/jteeuwen/go-bindata/...)

## Initialization

NPM 
```
npm install
```

Bower

*Please*, specify to Bower where to install its packets via .bowerrc, to the `src/bower_components` directory
```
bower install
```

## Build

```
$ go get -u github.com/shuLhan/go-bindata/...
$ bower install 
$ grunt build
$ go generate .
```

## Verify
You should see a `dist` directory, where all the basic .html are genereted.
