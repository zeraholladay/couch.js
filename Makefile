COUCH='http://localhost:5984/test'

setup:
	npm install

clean:
	rm -rf node_modules

.PHONY:
test: setup
	node_modules/.bin/jshint couch.js
	node_modules/.bin/jshint test/test.js
	curl -XDELETE $(COUCH)
	curl -XPUT $(COUCH)
	for f in $$(ls test_data/*.json); do \
	  curl -XPOST $(COUCH) -H "Content-type: application/json" -d@$$f; \
	done
	node_modules/.bin/mocha --ui tdd