(function() {
    var debug = true;

    var ajax_options = { 
        dataType: 'json',
        contentType: 'application/json'
    };   

    Couch = {};

    //User stuff

    Couch.User = function(url_prefix) {
        this.url_prefix = url_prefix || '';
        this.signup = function(username, password, opts) {
            opts = opts || {};
            var user_doc = {
                _id : 'org.couchdb.user:' + username,
                name: username,
                password: password,
                type: 'user',
                roles: []
            };
            var success = _.bind(function(data, status, jqXHR) {
                this.trigger('signup', null, data);
            }, this);
            var error = _.bind(function(jqXHR, status, err) {
                var data = JSON.parse(err.responseText);
                this.trigger('signup', err, data);
            }, this);
            _.extend(opts, ajax_options, {
                type: 'POST',
                url: this.url_prefix + '/_users',
                data: JSON.stringify(user_doc),
                success: success,
                error: error
            });
            return $.ajax(opts);
        };
        this.login = function(username, password, opts) {
            opts = opts || {};
            var success = _.bind(function(data, status, jqXHR) {
                this.trigger('login', null, data);
            }, this);
            var error = _.bind(function(jqXHR, status, err) {
                var data = JSON.parse(jqXHR.responseText);
                this.trigger('login', err, data);
            }, this);
            _.extend(opts, ajax_options, {
                type: 'POST',
                url: this.url_prefix + '/_session',
                data: JSON.stringify({ name: username, password: password }),
                success: success,
                error: error
            });
            return $.ajax(opts);
        };
        this.logout = this.logoff = function(opts) {
            opts = opts || {};
            _.extend(opts, ajax_options, {
                type: 'DELETE',
                url: this.url_prefix + '/_session'
            });
            var that = this;
            return $.ajax(opts).done(function() {
                that.trigger('logout'); //XXX: FIXME!!!
            });
        };
    };

    _.extend(Couch.User.prototype, Backbone.Events);

    //Bootstrap (useful for testing)

    Couch.Bootstrap = function() {
        this.loader = function(docs, opts) {
            _.extend(opts, ajax_options, {
                type: 'POST',
                data: JSON.stringify(docs)
            });
            var that = this;
            return $.ajax(opts).done(that.trigger('bootstrap')); //XXX: FIXME!!! MAYBE RENAME TOO.
        };
    };

    _.extend(Couch.Bootstrap.prototype, Backbone.Events);

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

    Couch.Model.prototype._read = function(model, opts) {
        if (undefined === model.id) throw 'Model has no ID';
        var url = this.urlRoot + '/' + encodeURIComponent(model.id);
        _.extend(opts, ajax_options, {
            type: 'GET',
            url: url
        });
        return $.ajax(opts);
    };

    Couch.Model.prototype._create = function(model, opts) {
        _.extend(opts, ajax_options, {
            type: 'POST',
            url: this.urlRoot,
            data: JSON.stringify(model.toJSON())
        });
        return $.ajax(opts);
    };

    Couch.Model.prototype._update = function(model, opts) {
        var json = model.toJSON();
        json._id = json.id; delete json.id;
        json._rev = json.rev; delete json.rev;
        _.extend(opts, ajax_options, {
            type: 'PUT',
            url: this.urlRoot + '/' + encodeURIComponent(model.id),
            data: JSON.stringify(json)
        });
        return $.ajax(opts);
    };

    Couch.Model.prototype._delete = function(model, opts) {
        var rev = model.get('rev');
        var url = this.urlRoot + '/' + 
            encodeURIComponent(model.id) + 
            '?rev=' + encodeURIComponent(rev);
        _.extend(opts, ajax_options, {
            url: url,
            type: 'DELETE'
        });
        return $.ajax(opts); 
    };

    Couch.Model.prototype.sync = function(method, model, opts) {
        if (debug) console.info(method);
        switch (method) {
        case 'read':
            return this._read.call(this, model, opts);
        case 'create': 
            return this._create.call(this, model, opts);
        case 'update':
            return this._update.call(this, model, opts);
        case 'delete':
            return this._delete.call(this, model, opts);
        }
    };

    //Collection

    Couch.Collection = Backbone.Collection.extend({
        parse : function(json) {
            var parsed = _.map(json.rows, function(row) {
                return row.value; 
            });
            return parsed;
        }
    });
})();
