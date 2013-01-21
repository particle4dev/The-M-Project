// ==========================================================================
// Project:   The M-Project Plus - Mobile HTML5 Application Framework
// Creator:   
// Date:      07.01.2013
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
// LOG
//    +) 14.01.2013 : add background property
// ==========================================================================

// BASE ON

// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Dominik
// Date:      02.12.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

/**
 * @class
 *
 * M.LoaderView is the prototype for a loader a.k.a. activity indicator. This very simple
 * view can be used to show the user that something is happening, e.g. while the application
 * is waiting for a request to return some data.
 *
 * @extends M.View
 */
M.LoaderView = M.View.extend(
/** @scope M.LoaderView.prototype */ {

    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.LoaderView',

    /**
     * This property states whether the loader has already been initialized or not.
     *
     * @type Boolean
     */
    isInitialized: NO,

    /**
     * This property counts the loader calls to show
     *
     * @type Number
     */
    refCount: 0,

    /**
     * This property can be used to specify the default title of a loader.
     *
     * @type String
     */
    defaultTitle: 'loading',
    
    /**
     * This property can be used to specify the background of a loader or not.
     *
     * @type Boolean
     */  
    background:false,
    
    /**
     * This method initializes the loader by loading it once.
     *
     * @private 
     */
    initialize: function() {
        if(!this.isInitialized) {
            this.refCount = 0;
            $.mobile.showPageLoadingMsg();
            $.mobile.hidePageLoadingMsg();
            this.isInitialized = YES;
        }
    },

    /**
     * This method shows the default loader. You can specify the displayed label with the
     * title parameter.
     *
     * @param {String} title The title for this loader.
     * @param {Boolean} hideSpinner A boolean to specify whether to display a spinning wheel or not.
     */
    show: function(title, hideSpinner) {
        this.createBackground();
        
        this.refCount++;
        var title = title && typeof(title) === 'string' ? title : this.defaultTitle;
        if(this.refCount == 1){
            if(this.background == true){
    	        $('.background-loader').show();
	        }
            $.mobile.showPageLoadingMsg('a', title, hideSpinner);
            var loader = $('.ui-loader');
            loader.removeClass('ui-loader-default');
            loader.addClass('ui-loader-verbose');

            /* position alert in the center of the possibly scrolled viewport */
            var screenSize = M.Environment.getSize();
            var scrollYOffset = window.pageYOffset;
            var loaderHeight = loader.outerHeight();

            var yPos = scrollYOffset + (screenSize[1]/2);
            loader.css('top', yPos + 'px');
            loader.css('margin-top', '-' + (loaderHeight/2) + 'px');
        }
    },

    /**
     * This method changes the current title.
     *
     * @param {String} title The title for this loader.
     */

    changeTitle: function(title){
        $('.ui-loader h1').html(title);
    },

    /**
     * This method hides the loader.
     *
     * @param {Boolean} force Determines whether to force the hide of the loader.
     */
    hide: function(force) {
        if(force || this.refCount <= 0) {
            this.refCount = 0;
        } else {
            this.refCount--;
        }
        if(this.refCount == 0){
            if(this.background == true){
    	        $('.background-loader').remove();
	        }
            $.mobile.hidePageLoadingMsg();
        }
    },
    createBackground: function(){
        var bg = $('.background-loader');
    	if(bg.length <= 0){
    		bg = $('<div class="tmp-dialog-background"></div>');
    		bg.appendTo('body');
    		this.positionBackground(bg);
    	}	
    },
    positionBackground: function(background) {
        background.css('height', $(document).height() + 'px');
        background.css('width', $(document).width() + 'px');
    }
    
});
