/*
* jQuery Timeout Dialog Widget
* version 1.0
* by Christian Oestreich
* https://github.com/ctoestreich/jquery-timeoutdialog
* MIT license
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

(function($, win) {
    $.widget('ui.timeoutdialog', {
        options: {
            idleTimeout: 30,
            idleAlert: 25,
            keepAliveURL: '',
            validResponseText: 'OK',
            countdownTarget: 'countdownTargetSpan',
            buttonContinueText: 'OK',
            buttonSignoffText: 'Sign Off',
            onTimeout: function(){},
            onSignoff: function(){}
        },
        _init: function() {
            this.counter = 0;
            this.interval = null;
            this._createDialog(this.element);
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
                self.options.onTimeout();
            }
        },
        _signoff: function() {
            var self = this;
            if(self.options.onSignoff && $.isFunction(self.options.onSignoff)) {
                self.options.onSignoff();
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
            var self = this, btns = {};
            btns[self.options.buttonContinueText] = function(){ self._pingServer(); self._resetTimer(); jQuery(this).dialog("close"); };
            btns[self.options.buttonSignoffText] = function(){ self._signoff(); };
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
                buttons: btns
            });
        }
    });
})(jQuery, window);