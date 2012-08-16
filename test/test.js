//ghetto assert:

var AssertException = function(msg) { 
    this.msg = msg;
    this.toString = function() {
        return 'Assert: ' + this.msg;
    };
};

var assert = function(exp, message) {
    if (!exp) {
        throw new AssertException(message);
    }
};

//test cases:

var test_docs = [
    {
        "_id": "46755756ad993ec83e986891f000794c",
        "_rev": "1-967a00dff5e02add41819138abb3284d",
        "type": "test_collection"
    }, 
    {
        "_id": "46755756ad993ec83e986891f0005a0e",
        "_rev": "1-967a00dff5e02add41819138abb3284d",
        "type": "test_collection"
    },
    {
        "_id": "46755756ad993ec83e986891f000699f",
        "_rev": "1-967a00dff5e02add41819138abb3284d",
        "type": "test_collection"
    }
];

var Model = Couch.Model.extend({
    urlRoot: '/test'
});

suite('Collection fetched from a view', function() {
    var Collection = Couch.Collection.extend({
        model: Model,
        // returns the URL of the couchdb view
        url: function() {
            return '_view/collection?key=' + encodeURI('"test_collection"');
        }
    });

    var collection = null;

    setup(function(done) {
        collection = new Collection();
        var docs = {
            all_or_nothing: true,
            docs: test_docs
        };
        Couch.Bootstrap(docs, {url: '/test/_bulk_docs'})
            .done(function() {
                collection.on('reset', function() {
                    this.off('reset');
                    done();
                });
                collection.fetch();
            });
    });

    teardown(function(done) {
        var docs = {
            all_or_nothing: true,
            docs: _.map(test_docs, function(doc) {
                return _.extend({_deleted: true}, doc);
            })
        };
        Couch.Bootstrap(docs, {url: '/test/_bulk_docs'})
            .done(function() {
                done();
            });
    });

    suite('collection', function() {
        test('should contain three bootstrapped models.', function() {
            assert(collection.length === 3);
        });
    });    

    suite('models', function() {
        test('should not have an _id, _rev, or ok attribute.', function() {
            var bool = collection.every(function(model) {
                return (undefined === model.get("_id") &&
                        undefined === model.get("_rev") &&
                        undefined === model.get("ok"));
            });
            assert(bool);
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

suite('User', function() {
    var user = new Couch.User();

    setup(function(done) {
        user.signup('test', '123')
            .done(function() {
                done();
            })
            .fail(function() {
                done();
            });
    });

    teardown(function(done) {
        user.logout().done(function() { done(); });
    });

    suite('.login()', function() {
        test('should not fail.', function(done) {
            user.login('test', '123')
                .done(function() {
                    done();
                })
                .fail(function() {
                    assert(false);
                });
        });
    });

    suite('.logout()', function() {
        test('should not fail.', function(done) {
            user.logout()
                .done(function() {
                    done();
                });
        });
    });
});
