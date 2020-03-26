var viewModel = {};

var isFixedIpad = false;

var qs = (function(a) {

    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

if(/iPad/.test(navigator.userAgent) && !window.MSStream){
    isFixedIpad = true;
}

if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
    document.querySelector('meta[name=viewport]')
        .setAttribute(
        'content',
        'initial-scale=1.0001, minimum-scale=1.0001, maximum-scale=1.0001, user-scalable=no'
    );
}

if ( isFixedIpad ) {
    /*
    $(document).bind('touchmove', function (e) {
            e.preventDefault();
        }
    );
    */
    var lastInput = new Date().getTime();

    var noInputTimeout = 10000;
    var pageResetTimer = 1800;

    var opacity = localStorage.getItem("sentinel.opacity");

    function pageTimer(){
        var now = new Date().getTime();
        var d =  now - lastInput;
        if ( pageResetTimer--  <= 0 ){
            location.reload();
        }
        if ( d > noInputTimeout ){
            var hr = (new Date()).getHours();
            if ( hr >= 6 && hr < 22 ){
                opacity = 0.6;
            }else{
                opacity = 0.2;
            }
            $('body').css('opacity', opacity);
            localStorage.setItem("sentinel.opacity", opacity);
        }
    }

    window.setInterval(pageTimer, 2000);

    if ( qs['area'] ){
        localStorage.setItem("sentinel.area", qs['area'] );
    }

    $('body').css('opacity', opacity || 1);

    $('html').click( function(e){
        $('body').css('opacity', 1);
        localStorage.setItem("sentinel.opacity", 1);
        lastInput = new Date().getTime();
        pageResetTimer = 1800;
    });
}

(function ($) {
    $.each(['show', 'hide'], function (i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function () {
            this.trigger(ev);
            if ( ev === 'hide ')
                this.addClass('hide');
            else
                this.removeClass('hide');
            return el.apply(this, arguments);
        };
    });
})(jQuery);

$.fn.once = function(a, b) {
    return this.each(function() {
        $(this).off(a).on(a,b);
    });
};

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
};

function openPage(a, page){
    var container = $('body > nav.navbar > div.container')

    $('div.container-content').each( function(i, e){
        e = $(e);
        if ( e.is(':visible') ){
            e.hide();
            var $ul = container.find('ul');
            if ( $ul.length ) {
                $ul.addClass('hide');
                e.append($ul);
            }
        }
    });

    if ( a ) {
        $(a).parent().parent().find('li').each(function (i, e) {
            $(e).removeClass('active');
        });

        $(a).parent().addClass('active');
    }

    var p = $('#page-'+ page);
    p.show();

    var nav = p.find('ul.navbar-nav:first');

    if ( nav.length ){
        $('#navbar').empty();
        $('#navbar').append(nav);
        //container.append(nav);
        container.find('ul').removeClass('hide');
        nav.find('li > a.default').click();
    }

    var defaultArea = localStorage.getItem("sentinel.area");

    if (defaultArea){
        var $a = $('#navbar').find('a:contains("' + defaultArea + '")');
        if ( $a.length ) {
            $a.click();
        }
    }else{
        $a = $('#navbar').find('a');
        if ( $a.length > 1 ) {
            $a[0].click();
        }
    }

    $a = $('#navbar').find('a');
    if ( $a.length == 1 ) {
        $a[0].click();
    }
}


function createArea( p, n, d ){

    var areaName = p.attr('id') + '-area-' + n.toLowerCase().replace(/\s+/, '-');

    var $div = $('#' + areaName);

    if ( $div.length == 0 ) {
        $div = $('<div>').addClass('area col-md-12 hide').attr('id', areaName);
        p.append($div);
    }else{

    }

    var $ul = p.find('ul.navbar-nav:first');
    if ( !$ul.length ) {
        $ul = $('<ul>').addClass('nav navbar-nav hide');
        p.append( $ul );
    }

    $ul.prepend( $('<li>').append(
        $('<a>').attr('href','#').addClass((d?'default':''))
            .append(n)
            .click( function (e){
                openArea( this, areaName );
            })
    ));

    return $div;
}

function openArea(a, area){

    $('div.area').each( function(i, e){
        e = $(e);
        if ( e.is(':visible') ){
            e.hide();
        }
    });

    $('#' + area).show();

    if ( a ) {
        $(a).parent().parent().find('li').each(function (i, e) {
            $(e).removeClass('active');
        });

        $(a).parent().addClass('active');
    }

    if ( $('.navbar-toggle').css('display') == 'block'){
        $('.navbar-toggle').click();
    }

}

function loadTemplate(url,success,failure){

    var authorizationToken = localStorage.getItem("SENTINEL_AUTH");

    $.ajax({
        type : 'GET',
        url : url + '?_=' + new Date().getTime(),
        async : true,
        beforeSend: function(request) {
            if ( authorizationToken ) {
                request.setRequestHeader('Authorization', 'Bearer ' + authorizationToken);
            }
        },
        success : function(data, textStatus, jqXHR) {
            if ( success !== undefined )
                success(data, textStatus, jqXHR);
        },
        error : function(jqXHR, textStatus, errorThrown) {
            if ( jqXHR.status == 0 )
                return;

            if ( failure !== undefined )
                failure(jqXHR, textStatus, errorThrown);
        },
        dataType : 'text',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true
    });
}

function loadData(complete, failure) {

    var authToken = localStorage.getItem("SENTINEL_AUTH");

    if (authToken) {
        Cookies.set("SENTINEL_AUTH", authToken);
    }

    Sentinel.system(function (result) {

        var data = result.data;

        var devices = {};
        ko.utils.arrayForEach(data.devices, function (device) {
            device['status'] = {};

            var n = device.name;

            var i = 2;

            while ( devices[n] ){
                n = device.name + ' - ' + i;
            }
            devices[n] = device;
        });

        viewModel['events'] = ko.observableArray([]);
        viewModel['selectedEvent'] = ko.observable({name:'', code:''});

        viewModel['devices'] = ko.mapping.fromJS(devices);

        viewModel['layout'] = ko.mapping.fromJS(data.layout);

        for (var key in  viewModel['devices']) {
            var device = viewModel['devices'][key];
            if (device.id == undefined)
                continue;
            device.status = ko.onDemandObservable(function () {
                var device = this;

                Sentinel.queryDevice(device.id(),
                    function (status) {

                        var X = status.data[0];

                        //console.log( 'queried device id => ' + device.id() + ', name => ' + device.name() + ', data => ' + X );

                        var Y = ko.mapping.fromJS(X);

                        device.status(Y);
                    },
                    function( err){
                        console.log(err);
                    });
            }, device);
            //device.status();
        }

        Sentinel.automation.scenes.load(function (result) {

            var scenes = {'All':{}};
            ko.utils.arrayForEach(result.data, function (scene) {
                scene['run'] = function(){
                    Sentinel.automation.scenes.run( this.id() );
                };
                if ( scene.area === undefined ) {
                    scenes.All[scene.name] = scene;
                } else{
                    if ( scenes[scene.area] === undefined )
                        scenes[scene.area] = {};
                    scenes[scene.area][scene.name] = scene;
                }
            });

            viewModel['scenes'] = ko.mapping.fromJS(scenes);

            complete();
        });

    }, failure );
}

function updateData(data){

    if (data.device !== undefined){
        var status = data.status;

        var devices = viewModel['devices'];

        for( var key in devices ){
            if (  devices[key].id == undefined )
                continue;

            if ( devices[key].id() === data.device){
                var device = devices[key];

                if ( device !== undefined ) {
                    var d = ko.mapping.fromJS(status);
                    device.status(d);
                }
            }
        }
    }

    if ( data.log ){
        //window.alert(data.log);
        var oldVal = $('#scenelog').val();
        $('#scenelog').val( oldVal + data.log );
    }

}

var socket;

function connectWebSocket()
{
    if ('WebSocket' in window)
    {
        try
        {
            host = (window.location.protocol === "http:" ? "ws" : "wss" ) + "://" + window.location.hostname + ":" + window.location.port + "/api/ws";

            // If the socket isn't created or connected
            if ( socket && socket.readyState !== 3 )
                return;

            socket = new WebSocket(host);

            socket.onopen = function () {
                console.log('Socket open');
            };

            socket.onmessage = function (e) {
                updateData( JSON.parse(e.data) );
            };

            socket.onerror = function(){
                console.log('Socket error');
            };
            socket.onclose = function(){
                console.log('Socket closed');
            };
            return socket;
        }
        catch (e)
        {
            console.log(e);
        }
    }
}

function loadAutomation(type, $form){
    var dialog;

    var $msg = $('<div>');

    var $select = $('<select>').attr('id', 'scene-selector');

    for ( var area in viewModel.scenes) {
        if ( area === '__ko_mapping__')
            continue;
        for (var name in viewModel.scenes[area]) {
            var scene = viewModel.scenes[area][name];
            $select.append( $('<option>').attr('value', scene.id()).append(area  + ' - ' + name));
        };
    }

    $msg.append($select);

    dialog = new BootstrapDialog({
        title: 'Select Scene',
        message: $msg,
        onshown: function(dialogRef){
            $msg.focus();
        },
        buttons: [{
            id: 'btn-open',
            label: 'Open',
            action: function (dialogRef) {
                var selected = $('#scene-selector').find('option:selected');
                var sceneId = selected.val();
                Sentinel.automation.scenes.get( sceneId, function(value){

                    $('#sceneArea').val( value.area );
                    $('#sceneName').val( value.name );
                    $('#sceneCode').val( value.code );

                    dialogRef.close();

                });

            }
        }]
    });

    dialog.realize();
    dialog.open();
}

function saveAutomation( type, $form, test ){
    var sceneId     = $('#sceneId').val();
    var sceneName   = $('#sceneName').val();
    var sceneCode   = $('#sceneCode').val();

    switch (type){
        case 'scenes':
            type = 'scene';
            break;
        case 'events':
            type = 'event';
            break;
        case 'schedules':
            type = 'schedule';
            break
    }


    var data = {
        id   : sceneId,
        type : type,
        name : sceneName,
        code : sceneCode
    };

    var url = '/automation';

    switch (type){
        case 'scene':
            data['area'] = $('#sceneArea').val();
            url = '/automation/scenes';
            break;
        case 'event':
            data['device'] = $('#sceneDevice').val();
            break;
        case 'schedule':
            break
    }

    $('#scenelog').val('');

    Sentinel.data.post(url + (test ? '?test=true':''), data,
        function(data, textStatus, jqXHR){
            if ( test ){
                alert('Test Passed');
            }else {
                alert('Scene Saved');
                //location.reload();
            }
        },
        function(jqXHR, textStatus, errorThrown){
            if ( test ){
                alert('Test Failed');
            }else {
                alert('Error Saving');
            }
        }
    );
}

loadData(function () {
    loadTemplate( "/custom/home.html",
        function(data, textStatus, jqXHR) {
            $('body > div.container').append( data );
            ko.applyBindings(viewModel, $('#container-content').get()[0]);

            setInterval( connectWebSocket, 5000 );

            function refreshJwtToken(){
                Sentinel.data.get('/auth/token/refresh', undefined, function (e) {
                    localStorage.setItem('SENTINEL_AUTH', Cookies.get('SENTINEL_AUTH'));
                    //document.cookie = 'SENTINEL_AUTH' + '=; Max-Age=-99999999;';
                    location.reload();
                });
            }

            setInterval( refreshJwtToken, 30000 );
        });
},
    function(jqXHR, textStatus, errorThrown){
    if (jqXHR.status == 401 || jqXHR.status == 403){
        loadTemplate( "/login.html",
            function(data, textStatus, jqXHR) {
                $("body > div.container").append( data );
            }
        );
    }
});
