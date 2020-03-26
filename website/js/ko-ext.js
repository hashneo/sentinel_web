//an observable that retrieves its value when first bound
ko.onDemandObservable = function(callback, target) {
    var _value = ko.observable();  //private observable
    var result = ko.dependentObservable({
        read: function() {
            //if it has not been loaded, execute the supplied function
            if (!result.loaded()) {
                callback.call(target);
            }
            //always return the current value
            return _value();
        },
        write: function(newValue) {
            _value(newValue);
            //indicate that the value is now loaded and set it
            result.loaded(true);
        },
        deferEvaluation: true  //do not evaluate immediately when created
    });

    //expose the current state, which can be bound against
    result.loaded = ko.observable();
    //load it again
    result.refresh = function() {
        result.loaded(false);
    };

    return result;
};

ko.getvar = function( s, v ){
    var r = s;
    var p = v.split('.');
    for( var k in p ){
        if ( r === undefined )
            return null;
        r = r[p[k]];
    }
    return r;
};