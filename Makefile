JSHINT=node_modules/.bin/jshint

setup:
	npm install

clean:
	rm -rf node_modules

.PHONY:
test: setup
	$(JSHINT) couch.js
	$(JSHINT) test/test.js
	cp node_modules/mocha/mocha.css couchapp/_attachments/css/
	cp node_modules/mocha/mocha.js couchapp/_attachments/js/
	cp couch.js test/test.js couchapp/_attachments/js/
	couchapp push couchapp/ default
