var render = function($template, view, partials) {
    $template = $template.html()
    return Mustache.render($template, view, partials);
};

var LoginView = Backbone.View.extend({
    el: 'form#login',
    events: {
        'submit': 'submit',
    },
    initialize: function() {
        _.bindAll(this, 'submit');
        this.user = new Couch.User();
        this.user.on('login', this.login);
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
    login: function() {
        alert('login');
    }
});

$(document).ready(function() {
    new LoginView();
  
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