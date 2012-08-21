#couch.js

Backbone.sync adapter to CouchDB (plus a simple user interface).

##Getting Started

Prerequisites are jQuery, Underscore, and Backbone.

Create a collection:

```javascript
var Collection = Couch.Collection.extend({
    model: Couch.Model,
    url: '/test',
    viewURL: '_view/collection?key=' + encodeURI('"test_collection"')
});
```

where collection is a view:

```javascript
function(doc) {
    if (doc.type) {
        emit(doc.type, doc);
    }
}        
```

and doc.type (or whatever) is a unique identifier for this type.

The above code maps a types of "test_collection" from the "/test" database to Collection.

Next create an instance of your Collection:

```javascript
var collection = new Collection()
```

and start using Backbone.
