function(newDoc, oldDoc, userCtx, secObj) {
    if (((oldDoc && (oldDoc.user == userCtx.name))) && newDoc._deleted) {
        return true;
    }
    if (newDoc.user !== userCtx.name) {
        throw({forbidden: 'Action prohibited by validate_doc_update.js'});
    }
}
