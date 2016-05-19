/**!
 * mesg.js
 * 桌面消息通知
**/

// Window root
var root = (window !== 'undefined' ? window : self);

(function (global, factory) {

    'use strict';

    /* Use AMD */
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return new (factory(global, global.document))();
        });
    }
    /* Use CommonJS */
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = (factory(global, global.document))();
    }
    /* Use Browser */
    else {
        global.Mesg = new (factory(global, global.document))();
    }

})(root, function (w, d) {

    var Mesg = function () {

        var
        self = this,
        isUndefined   = function (obj) { return obj === undefined; },
        isString   = function (obj) { return obj && obj.constructor === String; },
        isFunction = function (obj) { return obj && obj.constructor === Function; },

        /* Whether Mesg has permission to notify */
        hasPermission = false,

        /* List of active notifications */
        notifications = [],

        /**
         * Closes a notification
         * @param {Notification} notification
         * @return {void}
         */
        close_notification = function (notification) {

            /* Safari 6+, Chrome 23+ */
            if (notification.close) {

                notification.close();

            /* Legacy webkit browsers */
            } else if (notification.cancel) {

                notification.cancel();

            /* IE9+ */
            } else if (w.external && w.external.msIsSiteMode) {

                w.external.msSiteModeClearIconOverlay();

            }

        },

        /**
         * Updates the notification count
         * @return {void}
         */
        updateCount = function () {
            self.count = notifications.length;
        },

        /**
         * Callback function for the 'create' method
         * @return {void}
         */
        create_callback = function (title, options) {

            /* Set empty settings if none are specified */
            options = options || {};

            /* Safari 6+, Chrome 23+ */
            if (w.Notification) {

                notification =  new w.Notification(
                    title,
                    {
                        icon: (isString(options.icon) || isUndefined(options.icon)) ? options.icon : options.icon.x32,
                        body: options.body,
                        tag: options.tag,
                    }
                );

            /* Legacy webkit browsers */
            } else if (w.webkitNotifications) {

                notification = win.webkitNotifications.createNotification(
                    options.icon,
                    title,
                    options.body
                );

                notification.show();

            /* Firefox Mobile */
            } else if (navigator.mozNotification) {

                notification = navigator.mozNotification.createNotification(
                    title,
                    options.body,
                    options.icon
                );

                notification.show();

            /* IE9+ */
            } else if (win.external && win.external.msIsSiteMode()) {

                //Clear any previous notifications
                w.external.msSiteModeClearIconOverlay();
                w.external.msSiteModeSetIconOverlay(((isString(options.icon) || isUndefined(options.icon)) ? options.icon : options.icon.x16), title);
                w.external.msSiteModeActivate();

                notification = {};
            }

            /* Wrapper used to close notification later on */
            wrapper = {

                close: function () {
                    close_notification(notification);
                }

            };

            /* Autoclose timeout */
            if (options.timeout) {
                setTimeout(function () {
                    wrapper.close();
                }, options.timeout);
            }

            /* Notification callbacks */
            if (isFunction(options.onShow))
                notification.addEventListener('show', options.onShow);

            if (isFunction(options.onError))
                notification.addEventListener('error', options.onError);

            if (isFunction(options.onClick))
                notification.addEventListener('click', options.onClick);

            if (isFunction(options.onClose)) {
                notification.addEventListener('close', options.onClose);
                notification.addEventListener('cancel', options.onClose);
            }

            /* Add it to the global array */
            notifications.push(notification);

            /* Update the notification count */
            updateCount();

            /* Return the wrapper so the user can call close() */
            return wrapper;
        },

        /**
         * Permission types
         * @enum {String}
         */
        Permission = {
            DEFAULT: 'default',
            GRANTED: 'granted',
            DENIED: 'denied'
        },

        Permissions = [Permission.GRANTED, Permission.DEFAULT, Permission.DENIED];

        /* Allow enums to be accessible from Mesg object */
        self.Permission = Permission;

        /* Number of open notifications */
        self.count = 0;

        /*****************
            Permissions
        /*****************/

        /**
         * Requests permission for desktop notifications
         * @param {Function} callback - Function to execute once permission is granted
         * @return {void}
         */
        self.Permission.request = function (onGranted, onDenied) {

            /* Return if Mesg not supported */
            if (!self.isSupported) { return; }

            /* Default callback */
            callback = function (result) {

                switch (result) {

                    case self.Permission.GRANTED:
                        hasPermission = true;
                        if (onGranted) onGranted();
                        break;

                    case self.Permission.DENIED:
                        hasPermission = false;
                        if (onDenied) onDenied();
                        break;

                }

            };

            /* Legacy webkit browsers */
            if (w.webkitNotifications && w.webkitNotifications.checkPermission) {
                w.webkitNotifications.requestPermission(callback);

            /* Safari 6+, Chrome 23+ */
            } else if (w.Notification && w.Notification.requestPermission) {
                w.Notification.requestPermission(callback);
            }

        };

        /**
         * Returns whether Mesg has been granted permission to run
         * @return {Boolean}
         */
        self.Permission.has = function () {
            return hasPermission;
        };

        /**
         * Gets the permission level
         * @return {Permission} The permission level
         */
        self.Permission.get = function () {

            var permission;

            /* Return if Mesg not supported */
            if (!self.isSupported) { return; }

            /* Safari 6+, Chrome 23+ */
            if (w.Notification && w.Notification.permissionLevel) {
                permission = w.Notification.permissionLevel;

            /* Legacy webkit browsers */
            } else if (w.webkitNotifications && w.webkitNotifications.checkPermission) {
                permission = Permissions[w.webkitNotifications.checkPermission()];

            /* Firefox 23+ */
            } else if (w.Notification && w.Notification.permission) {
                permission = w.Notification.permission;

            /* Firefox Mobile */
            } else if (navigator.mozNotification) {
                permission = Permissions.GRANTED;

            /* IE9+ */
            } else if (w.external && w.external.msIsSiteMode() !== undefined) {
                permission = w.external.msIsSiteMode() ? Permission.GRANTED : Permission.DEFAULT;
            }

            return permission;

        };

        /*********************
            Other Functions
        /*********************/

        /**
         * Detects whether the user's browser supports notifications
         * @return {Boolean}
         */
        self.isSupported = (function () {

             var isSupported = false;

             try {

                 isSupported =

                     /* Safari, Chrome */
                     !!(w.Notification ||

                     /* Chrome & ff-html5notifications plugin */
                     w.webkitNotifications ||

                     /* Firefox Mobile */
                     navigator.mozNotification ||

                     /* IE9+ */
                     (w.external && w.external.msIsSiteMode() !== undefined));

             } catch (e) {}

             return isSupported;

         })();

         /**
          * Creates and displays a new notification
          * @param {Array} options
          * @return {void}
          */
        self.create = function (title, options) {

            var notification,
                wrapper;

            /* Fail if the browser is not supported */
            if (!self.isSupported) {
                console.error('MesgError: Mesg.js is incompatible with self browser.');
                return;
            }

            /* Fail if no or an invalid title is provided */
            if (typeof title !== 'string') {
                throw 'MesgError: Title of notification must be a string';
            }

            /* Request permission if it isn't granted */
            if (!self.Permission.has()) {
                self.Permission.request(function () {
                    return create_callback(title, options);
                });
            } else {
                return create_callback(title, options);
            }

        };

        /**
         * Closes a notification with the given tag
         * @param {String} tag - Tag of the notification to close
         * @return {void}
         */
        self.close = function (tag) {

            var i, notification;

            for (i = 0; i < notifications.length; i++) {

                notification = notifications[i];

                /* Run only if the tags match */
                if (notification.tag === tag) {

                    /* Call the notification's close() method */
                    close_notification(notification);

                    /* Remove the notification from the global array */
                    notifications.splice(i, 1);

                    /* Update the notification count */
                    updateCount();

                    /* Return after the first notification is closed */
                    return;

                }
            }

        };

        /**
         * Clears all notifications
         * @return {void}
         */
        self.clear = function () {

            var i;

            for (i = 0; i < notifications.length; i++) {
                close_notification(notifications[i]);
            }

            /* Reset the global array */
            notifications = [];

            /* Update the notification count */
            updateCount();
        };
    };

    return Mesg;

});
