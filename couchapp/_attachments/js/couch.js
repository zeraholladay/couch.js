(function() {
    var debug = true;

    Couch = {};

    var ajax_options = { 
        dataType: 'json',
        contentType: 'application/json'
    };   

    //User stuff

    Couch.User = function(url_prefix) {
        this.url_prefix = url_prefix || '';
        this.success = function(event, data /*, status, jqXHR*/ ) {
                this.trigger(event, null, data);
        };
        this.error = function(event, jqXHR, status, err) {
                var data = JSON.parse(jqXHR.responseText);
                this.trigger(event, err, data);
        };
        this.signup = function(username, password, opts) {
            opts = opts || {};
            var user_doc = {
                _id : 'org.couchdb.user:' + username,
                name: username,
                password: password,
                type: 'user',
                roles: []
            };
            _.extend(opts, ajax_options, {
                type: 'POST',
                url: this.url_prefix + '/_users',
                data: JSON.stringify(user_doc),
                success: _.bind(this.success, this, 'signup'),
                error: _.bind(this.error, this, 'signup')
            });
            return $.ajax(opts);
        };
        this.login = function(username, password, opts) {
            opts = opts || {};
            _.extend(opts, ajax_options, {
                type: 'POST',
                url: this.url_prefix + '/_session',
                data: JSON.stringify({ name: username, password: password }),
                success: _.bind(this.success, this, 'login'),
                error: _.bind(this.error, this, 'login')
            });
            return $.ajax(opts);
        };
        this.logout = this.logoff = function(opts) {
            opts = opts || {};
            _.extend(opts, ajax_options, {
                type: 'DELETE',
                url: this.url_prefix + '/_session',
                success: _.bind(this.success, this, 'logout'),
                error: _.bind(this.error, this, 'logout')
            });
            return $.ajax(opts);
        };
    };

    _.extend(Couch.User.prototype, Backbone.Events);

    //Extend Model

    Couch.Model = Backbone.Model.extend({
        parse: function(json) {
            if (json.ok && 
                json.ok === true) {
                delete json.ok;
            }
            for (var key in json) {
                if (key.indexOf('_') === 0) {
                    json[key.substr(1)] = json[key];
                    delete json[key];
                }
            }
            return json;
        }
    });

    //Define methods for sync

    var _view = function(collection, opts) {
        var url = (_.isFunction(collection.viewURL)) ?
                   collection.viewURL() :
                   collection.viewURL;
        _.extend(opts, ajax_options, {
            type: 'GET',
            url: url
        });
        return $.ajax(opts);
    };

    var _read = function(model, opts) {
        if (undefined === model.id) throw 'Model has no ID';
        _.extend(opts, ajax_options, {
            type: 'GET',
            url: this.url()
        });
        return $.ajax(opts);
    };

    var _create = function(model, opts) {
        _.extend(opts, ajax_options, {
            type: 'POST',
            url: this.url(),
            data: JSON.stringify(model.toJSON())
        });
        return $.ajax(opts);
    };

    var _update = function(model, opts) {
        var json = model.toJSON();
        json._id = json.id; delete json.id;
        json._rev = json.rev; delete json.rev;
        _.extend(opts, ajax_options, {
            type: 'PUT',
            url: this.url(),
            data: JSON.stringify(json)
        });
        return $.ajax(opts);
    };

    var _delete = function(model, opts) {
        var rev = model.get('rev');
        _.extend(opts, ajax_options, {
            url: this.url() + '?rev=' + encodeURIComponent(rev),
            type: 'DELETE'
        });
        return $.ajax(opts); 
    };

    Couch.sync = function(method, model, opts) {
        if (debug) console.info(method);
        switch (method) {
        case 'read':
            if (!model.id) { 
                //XXX: model is actually a collection
                //in collection.fetch().
                return _view.call(this, model, opts); 
            }
            return _read.call(this, model, opts);
        case 'create': 
            return _create.call(this, model, opts);
        case 'update':
            return _update.call(this, model, opts);
        case 'delete':
            return _delete.call(this, model, opts);
        }
    };

    Backbone.sync = Couch.sync;

    //Collection

    Couch.Collection = Backbone.Collection.extend({
        model: Couch.Model,
        parse : function(json) {
            var parsed = _.map(json.rows, function(row) {
                return row.value; 
            });
            return parsed;
        }
    });
})();
