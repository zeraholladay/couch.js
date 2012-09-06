var username = 'test';
var password = '123';

//ghetto assert:

var assert = function(exp, msg) {
    if (!exp) {
        throw msg;
    }
};

//test cases:

var test_docs = [
    {
        "_id": "46755756ad993ec83e986891f000794c",
        "type": "test_collection",
        "user": "test"
    }, 
    {
        "_id": "46755756ad993ec83e986891f0005a0e",
        "type": "test_collection",
        "user": "test"
    },
    {
        "_id": "46755756ad993ec83e986891f000699f",
        "type": "test_collection",
        "user": "test"
    }
];

// Need tests for just model:
//
// var Model = Couch.Model.extend({
//     //urlRoot: '/test'
// });

var Collection = Couch.Collection.extend({
    url: '/test',
    viewURL: '_view/collection?key=' + encodeURI('"test_collection"')
});

var Bootstrap = function() {
    this.loader = function(docs, opts) {
        _.extend(opts, { 
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(docs)
        });
        var that = this;
        return $.ajax(opts).done(that.trigger('bootstrap')); //XXX: FIXME!!! MAYBE RENAME TOO.
    };
};

_.extend(Bootstrap.prototype, Backbone.Events);

suite('Collection fetched from a view', function() {
    var collection = null;

    setup(function(done) {
        collection = new Collection();
        var bootstrap = new Bootstrap();
        var docs = {
            all_or_nothing: true,
            docs: test_docs
        };
        collection.on('reset', function() {
            this.off('reset');
            done();
        });
        bootstrap.on('bootstrap', function() {
            collection.fetch(); //fires reset
        });
        Couch.login(username, password).done(function() {
            bootstrap.loader(docs, {url: '/test/_bulk_docs'});
        });
    });

    teardown(function(done) {
        var bootstrap = new Bootstrap();
        var docs = {
            all_or_nothing: true,
            docs: _.map(test_docs, function(doc) {
                return _.extend({_deleted: true}, doc);
            })
        };
        bootstrap.on('bootstrap', function() {
            Couch.logout();
        });

        bootstrap.loader(docs, {url: '/test/_bulk_docs'})
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
                return (undefined === model.get("_id")  &&
                        undefined === model.get("_rev") &&
                        undefined === model.get("ok"));
            });
            assert(bool);
        });
    });    
});

suite('Models in a collection', function() {
    var collection;

    setup(function(done) {
        //var user = new Couch.User();
        collection = new Collection();
        collection.on('sync', function(model) {
            assert(model.get("id") === model.id);
            assert(model.get("rev"));
            this.off('sync');
            done();
        });
        Couch.login(username, password).done(function() {
            collection.create({user:'test'});
        });
    });

    teardown(function(done) {
        collection.forEach(function(model) {
            model.off('destroy');
            model.destroy();
        });
        collection = null;
        Couch.logout().done(function() {
            done();
        });
    });

    suite('destroy', function() {
        test('should delete an item.', function(done) {
            var model = collection.at(0);
            model.on('destroy', function(model) {
                collection.remove(model);
                assert(collection.length === 0);
                this.off('destroy');
                done();
            });
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
