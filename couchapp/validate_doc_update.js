function(newDoc, oldDoc, userCtx, secObj) {
    if (newDoc.user !== userCtx.name) {
        throw({forbidden: 'Action prohibited'});
    }
}
