var assert = require("assert");
var jQuery = require("jquery");
var Couch = require("../couch.js");

var Model = Couch.Model.extend({
    // returns the URL of the database
    urlRoot: 'http://localhost:5984/test'
});

suite('Collection from view', function() {
    var Collection = Couch.Collection.extend({
        model: Model,
        // returns the URL of the couchdb view
        url: function() {
            return 'http://localhost:5984/test/_design/test/_view/collection?key=' + encodeURI('"test_collection"');
        }
    });

    var collection = new Collection();

    setup(function(done) {
        collection.on('reset', function() {
            this.off('reset');
            done();
        });
        collection.fetch();
    });

    suite('collection', function() {
        test('should contain three models.', function() {
            assert(collection.length === 3);
        });
    });    

    suite('models', function() {
        test('should not have an _id or _rev attribute.', function() {
            assert(!collection.get("_id"));
            assert(!collection.get("_rev"));
        });
    });    
});

suite('Collection', function() {
    var Collection = Couch.Collection.extend({
        model: Model
    });

    var collection;

    setup(function(done) {
        collection = new Collection();
        collection.on('sync', function(model) {
            assert(model.get("id") === model.id);
            assert(model.get("rev"));
            this.off('sync');
            done();
        });
        collection.create({});
    });

    teardown(function() {
        collection.forEach(function(model) {
            model.off('destroy');
            model.destroy();
        });
        collection = null;
    });

    suite('model.destroy', function() {
        test('should delete an item.', function(done) {
            var model = collection.at(0);
            model.on('destroy', function(model) {
                assert(collection.length === 0);
                this.off('destroy');
                done();
            });
            collection.remove(model);
            model.destroy();
        });
    });

    suite('model.set and model.save', function() {
        test('should update an item.', function(done) {
            var model = collection.at(0);
            model.on('sync', function(model) {
                this.off('sync');
                done();
            });
            model.set({foo:"bar"});
            model.save();
        });
    });

    suite('read', function() {
        test('should cause a change event', function(done) {
            var model = collection.at(0);
            model.fetch().done(function() {
                done();
            });
        });
    });
});
