(function($, win) {
    $.widget('ui.timeoutdialog', {
        options: {
            idleTimeout: 30,
            idleAlert: 25,
            keepAliveURL: '',
            validResponseText: 'OK',
            countdownTarget: 'countdownTargetSpan',
            onTimeout: null,
            onSignoff: null
        },
        _init: function() {
            this.counter = 0;
            this.interval = null;
            this._createDialog(this.element);
            $.fn.bgiframe && this.element.bgiframe();
            this._startTimer();
        },
        openDialog:  function() {
            var self = this;
            self.element.dialog("open");
        },
        _pingServer: function() {
            var self = this;
            $.ajax({
            	dataType: "html",
                timeout: 20000,
                url: self.options.keepAliveURL,
                error: function() {
                    self._timeout();
                },
                success: function(o) {
                    if($.trim(o) !== self.options.validResponseText) {
                        self._timeout();
                    }
                },
                complete: function() {
                    self._resetTimer();
                }
            });
        },
        _timeout: function() {
            var self = this;
            if(self.options.onTimeout && $.isFunction(self.options.onTimeout)) {
                eval(self.options.onTimeout());
            }
        },
        _signoff: function() {
            var self = this;
            if(self.options.onSignoff && $.isFunction(self.options.onSignoff)) {
                eval(self.options.onSignoff());
            }
        },
        _resetTimer: function() {
            var self = this;
            self.counter = 0;
            self._clearTimer();
            self._startTimer();
        },
        _clearTimer: function() {
            var self = this;
            win.clearInterval(self.interval);
        },
        _startTimer: function() {
            var self = this;
            if(self.interval) {
                self._clearTimer();
            }
            self.interval = win.setInterval(function() {
                self.counter++;
                if(self.counter >= self.options.idleAlert) {
                    self.element.dialog("open");
                }
                if(self.counter >= self.options.idleTimeout) {
                    self._timeout();
                }
                $('#' + self.options.countdownTarget).html((self.options.idleTimeout - self.counter) * 60);
            }, 60000);
        },
        _createDialog:function(e) {
            var self = this;
            e.dialog({
                zIndex: 10000,
                autoOpen: false,
                modal: true,
                width: 400,
                height: 350,
                closeOnEscape: false,
                draggable: false,
                resizable: false,
                open: function(event, ui) {
                    $(".ui-dialog-titlebar-close").hide();
                    $(".ui-dialog-titlebar").hide();
                },
                buttons: {
                    'OK': function() {
                        self._pingServer();
                        self._resetTimer();
                        jQuery(this).dialog("close");
                    },
                    'Sign Off': function() {
                        self._signoff();
                    }
                }
            });
        }
    });
})(jQuery, window);