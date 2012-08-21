var render = function($template, view, partials) {
    $template = $template.html()
    return Mustache.render($template, view, partials);
};

var SignupView = Backbone.View.extend({
    el: 'form#signup',
    events: {
        'submit': 'submit',
    },
    initialize: function() {
        _.bindAll(this, 'submit');
        this.user = new Couch.User();
        this.user.on('signup', this.signup);
    },
    submit: function() {
        var form = {};
        _.each(this.$el.serializeArray(), 
               function(input, index) {
                   form[input.name] = input.value;
               });
        this.user.signup(form.username, form.password);
        return false;
    },
    signup: function(err, data) {
        if (err) {
            alert(data.reason);
        } else {
            alert('singup');
        }
    }
});

var LoginView = Backbone.View.extend({
    el: 'form#login',
    events: {
        'submit': 'submit',
        'click a#logout': 'click'
    },
    initialize: function() {
        _.bindAll(this, 'submit', 'click');
        this.user = new Couch.User();
        this.user.on('login', this.login);
        this.user.on('logout', this.logout);
    },
    submit: function() {
        var form = {};
        _.each(this.$el.serializeArray(), 
               function(input, index) {
                   form[input.name] = input.value;
               });
        this.user.login(form.username, form.password);
        return false;
    },
    click: function() {
        this.user.logout();
    },
    login: function(err, data) {
        if (err) {
            alert(data.reason);
        } else {
            alert('login');
        }
        return false;
    },
    logout: function() {
        alert('logout');
        return false;
    }
});

$(document).ready(function() {
    new LoginView();
    new SignupView();  
/*
    var view = { 
        value1: 'value one',
        value2: 'value 2'
    };
    var html = render($('script#template'), view);
    console.log(html);
    $('body').append(html);
*/
});
