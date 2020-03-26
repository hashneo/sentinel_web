ko.bindingHandlers.checkboxValue = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var modelValue = valueAccessor();

        // Check whether the value observable is either placed directly or in the paramaters object.
        if (!(ko.isObservable(modelValue) || modelValue['value']))
            throw "You need to define an observable value for the sliderValue. Either pass the observable directly or as the 'value' field in the parameters.";

        // Identify the value and initialize the slider
        var valueObservable;
        if (ko.isObservable(modelValue)) {
            valueObservable = modelValue;
        }
        else {
            valueObservable = modelValue['value'];
            if  (valueObservable.loaded()) {
                // Replace the 'value' field in the options object with the actual value
                modelValue['value'] = ko.unwrap(valueObservable);
            }
            $(element).bootstrapToggle();
        }

        // Make sure we update the observable when changing the slider value

        $(element).change( function () {
            var v = modelValue['var'];

            var o = ko.getvar( valueObservable(), v );

            if ( o !== null ) {
                if (modelValue['transform']){
                    o( modelValue['transform'](o()) );
                }
                if (o)
                    o($(this).prop('checked'));
            }
        });


    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        var modelValue = valueAccessor();

        var valueObservable;
        if (ko.isObservable(modelValue))
            valueObservable = modelValue;
        else
            valueObservable = modelValue['value'];

        if ( valueObservable.loaded === undefined )
            return;

        if  (!valueObservable.loaded())
            return;

        var v = modelValue['var'];
        if (modelValue['tx']){
            v = modelValue['tx'](v);
        }
        var val =  ko.unwrap(ko.getvar( valueObservable(), v ));
        if (modelValue['transform']){
            val = modelValue['transform'](val);
        }
        var s = val;
        $(element).prop('checked',s).change();
    }
};


var isSliding = false;

ko.bindingHandlers.sliderValue = {

    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var modelValue = valueAccessor();

        // Check whether the value observable is either placed directly or in the paramaters object.
        if (!(ko.isObservable(modelValue) || modelValue['value']))
            throw "You need to define an observable value for the sliderValue. Either pass the observable directly or as the 'value' field in the parameters.";

        // Identify the value and initialize the slider
        var valueObservable;
        if (ko.isObservable(modelValue)) {
            valueObservable = modelValue;
            $(element).slider({value: ko.unwrap(modelValue)});
        }
        else {
            valueObservable = modelValue['value'];
            if  (valueObservable.loaded()) {
                // Replace the 'value' field in the options object with the actual value
                modelValue['value'] = ko.unwrap(valueObservable);
            }else{
                modelValue['value'] = modelValue['min'];
            }
            $(element).slider(modelValue);
        }

        // Make sure we update the observable when changing the slider value
        $(element).on('change', function (ev) {
            //isSliding = true;

        });

        $(element).on('slideStop', function (ev){
            isSliding = false;
            var v = modelValue['var'];
            var currentVal = parseInt( ko.unwrap(ko.getvar( valueObservable(), v )));
            if ( currentVal !== ev.value ){
                ko.getvar( valueObservable(), v )(ev.value);
                //console.log(ev.value);
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var modelValue = valueAccessor();

        var valueObservable;
        if (ko.isObservable(modelValue))
            valueObservable = modelValue;
        else
            valueObservable = modelValue['value'];

        if  (!valueObservable.loaded())
            return;

        var v = modelValue['var'];

        var val =  ko.unwrap(ko.getvar( valueObservable(), v ));

        //if ( !isSliding )
        $(element).slider('setValue', parseInt(val));
    }
};