var Sentinel = new function() {

    var that = this;

    this.baseUrl = function(){
        var server = window.location.hostname;
        var port = window.location.port;
        return '//' + server + ':' + port + '/api';
    };

    this.load = function(parameters){
    };

    error_handler = function(jqXHR, textStatus, errorThrown){
    };

    this.auth = new function(){
        this.login = function( email, password, response, failure ){
            that.data.post( '/auth/login', { email: email, password : password }, response, failure, true );
        }
    };

    this.system = function(response, failure){
        if ( failure === undefined )
            failure = error_handler;
        that.data.get('/system', response, failure, true );
    };

    this.automation = new function(){
        this.scenes = new function(){
            this.load = function(response) {
                that.data.get('/automation/scenes', response, error_handler, true);
            };
            this.get = function(id, response) {
                that.data.get('/automation/scenes/' + id, response, error_handler, true);
            };
            this.run = function(id, response) {
                that.data.get('/automation/scenes/' + id + '/run', response, error_handler, true);
            };
            this.delete = function(id, response) {
                that.data.delete('/automation/scenes/' + id, response, error_handler, true);
            };
        };
        this.devices = new function(){
            this.get = function(id, response) {
                that.data.get('/automation/device/' + id, response, error_handler, true);
            };
        };
    };

    this.camera = new function() {
        this.get = new function(){
            this.stream = function (id, response) {
                that.data.get('/camera/' + id + '/stream', response, error_handler, true);
            }
        };
    };

    this.set = new function(){
        this.camera = new function() {
            this.arm = function (id, type, response) {
                that.data.get('/camera/' + id + '/detection/' + type +  '/enable', response, error_handler, true);
            };
            this.disarm = function (id, type, response) {
                that.data.get('/camera/' + id + '/detection/' + type +  '/disable', response, error_handler, true);
            };
        };

        this.light = new function(){
            this.level = function (id, level, response) {
                that.data.get('/light/' + id + '/level/' + level, response, error_handler, true);
            };
            this.on = function (id, response) {
                that.data.get('/light/' + id + '/on', response, error_handler, true);
            };
            this.off = function (id, response) {
                that.data.get('/light/' + id + '/off', response, error_handler, true);
            };
            this.rgb = new function () {
                this.color = function (id, color, response) {
                    that.data.get('/light/' + id + '/rgb/color?r=' + color.r + '&g=' + color.g + '&b=' + color.b, response, error_handler, true);
                };
            };
        };

        this.alarm = new function(){
            this.disarm = function(id, code, response){
                that.data.get('/alarm/' + id + '/disarm?pin=' + code, response, error_handler, true);
            };
            this.away = function(id, code, response){
                that.data.get('/alarm/' + id + '/arm/away?pin=' + code, response, error_handler, true);
            };
            this.stay = function(id, code, response){
                that.data.get('/alarm/' + id + '/arm/stay?pin=' + code, response, error_handler, true);
            };
            this.night = function(id, response){
                that.data.get('/alarm/' + id + '/arm/night', response, error_handler, true);
            };
            this.vacation = function(id, response){
                that.data.get('/alarm/' + id + '/arm/vacation', response, error_handler, true);
            };
        };
        this.lock = new function(){
            this.open = function(id, response){
                that.data.get('/lock/' + id + '/open', response, error_handler, true);
            };
            this.close = function(id, response){
                that.data.get('/lock/' + id + '/closed', response, error_handler, true);
            };
        };
        this.door = new function(){
            this.open = function(id, response){
                that.data.get('/door/' + id + '/open', response, error_handler, true);
            };
            this.close = function(id, response){
                that.data.get('/door/' + id + '/close', response, error_handler, true);
            };
        };
        this.hvac = new function(){
            this.fan = new function() {
                this.on = function (id, response) {
                    that.data.get('/hvac/' + id + '/fan/continuous', response, error_handler, true);
                };
                this.auto = function (id, response) {
                    that.data.get('/hvac/' + id + '/fan/auto', response, error_handler, true);
                };
            };
        };
    };

    this.queryDevice = function(id, response, eh){
        if ( eh === undefined )
            eh = error_handler;
        this.data.get('/device/' + id + '/status?ts=' + new Date().getTime(), response, eh, true );
    };

    this.data = new function () {
        this.get = function(url, success, failure, async){
            this.call( 'GET', url, null, success, failure, async );
        };

        this.post = function(url, data, success, failure, async){
            this.call( 'POST', url, data, success, failure, async );
        };

        this.delete = function(url, success, failure, async){
            this.call( 'DELETE', url, null, success, failure, async );
        };

        this.call = function(type, url, data, success, failure, async) {
            if ( data !== null ){
                //console.log( JSON.stringify(data, null, "\t") );
            }

            if ( async === undefined )
                async = true;

            //console.log( Sentinel.baseUrl() + url );

            var authorizationToken = localStorage.getItem("SENTINEL_AUTH");

            $.ajax({
                contentType : "application/json; charset=utf-8",
                type : type,
                url : Sentinel.baseUrl() + url,
                data : data !== null ? JSON.stringify(data) : null,
                beforeSend: function(request) {
                    request.setRequestHeader('Upgrade-Insecure-Requests', 0 );
                    if ( authorizationToken ) {
                        request.setRequestHeader('Authorization', 'Bearer ' + authorizationToken);
                    }
                },
                success : function(data, textStatus, jqXHR) {
                    if ( data !== undefined && data.error !== undefined ) {
                        var e = { name : data.error.type,
                            code : data.error.code,
                            message : data.error.message,
                            data : data.error.data,
                            request : { url : this.url,
                                data : this.data
                            } };
                        $(document).trigger(data.error.type,e);
                    } else {
                        if ( success !== undefined )
                            success(data, textStatus, jqXHR);
                    }
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    if ( jqXHR.status == 0 )
                        return;

                    if ( failure !== undefined )
                        failure(jqXHR, textStatus, errorThrown);
                },
                dataType : 'json',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                async: async
            });
        };
    };
};

Sentinel.load();
