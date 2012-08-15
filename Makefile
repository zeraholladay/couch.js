COUCH='http://zera:123@localhost:5984/test'
JSHINT=node_modules/.bin/jshint

setup:
	npm install

clean:
	rm -rf node_modules

.PHONY:
test: setup
	$(JSHINT) couch.js
	$(JSHINT) test/test.js
	#curl -XDELETE $(COUCH)
	#	curl -XPUT $(COUCH)
	cp node_modules/mocha/mocha.css couchapp/_attachments/css/
	cp node_modules/mocha/mocha.js couchapp/_attachments/js/
	cp test/test.js couchapp/_attachments/js/
	couchapp push couchapp/ default
	#	node_modules/.bin/mocha --ui tdd
