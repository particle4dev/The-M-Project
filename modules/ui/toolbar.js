// ==========================================================================
// Project:   The M-Project Plus - Mobile HTML5 Application Framework
// Creator:   
// Date:      07.01.2013
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
// LOG
//    +) 15.01.2013: change render function => !important
//		this.clearValues();
//		this.clearHtml();
//	+) 16.01.2013: fix back button 
//	+) 19.01.2013: fix back button [without M.LEFT]
// ==========================================================================

//BASE ON

// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Sebastian
// Date:      02.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

/**
 * A constant value for the anchor location: top.
 *
 * @type String
 */
M.TOP = 'header';

/**
 * A constant value for the anchor location: bottom.
 *
 * @type String
 */
M.BOTTOM = 'footer';

/**
 * A constant value for the anchor location: left.
 *
 * @type Number
 */
M.LEFT = 'LEFT';

/**
 * A constant value for the anchor location: center.
 *
 * @type Number
 */
M.CENTER = 'CENTER';

/**
 * A constant value for the anchor location: right.
 *
 * @type Number
 */
M.RIGHT = 'RIGHT';

/**
 * @class
 *
 * The root object for ToolbarViews.
 *
 * @extends M.View
 */
M.ToolbarView = M.View.extend(
/** @scope M.ToolbarView.prototype */ {

    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.ToolbarView',

     /**
     * Defines the position of the TabBar. Possible values are:
     *
     * - M.BOTTOM => is a footer bar
     * - M.TOP => is a header bar
     *
     * @type String
     */
    anchorLocation: M.TOP,

    /**
     * Determines whether to display an auto-generated back-button on the left side
     * of the toolbar view or not.
     *
     * @type Boolean
     */
    showBackButton: NO,

    /**
     * If the showBackButton property is set to yes, this property will be used to
     * save a reference to the M.ButtonView.
     */
    backButton: null,

    /**
     * This property determines whether to fix the toolbar to the top / bottom of a
     * page. By default this is set to YES.
     *
     * @type Boolean
     */
    isFixed: YES,


    /**
     * This property determines whether the toolbar is persistent or not.
     * By default this is set to YES.
     * If you like to customize the behavior you can simply define you own identifier. Every M.Toolbar with the same identifier is with each other persistent.
     * If you simply set it to YES the header is persistent to each other header with the flag YES.
     * If it is set to NO, then there is the old style page switch
     *
     * @type Boolean or String
     */

    isPersistent: YES,

    /**
     * This property determines whether to toggle the toolbar on tap on the content area
     * or not. By default this is set to NO.
     *
     * @type Boolean
     */
    toggleOnTap: NO,

    /**
     * Renders a toolbar as a div tag with corresponding data-role attribute and inner
     * h1 child tag (representing the title of the header)
     *
     * @private
     * @returns {String} The toolbar view's html representation.
     */
    render: function() {
	this.clearValues();
	this.clearHtml();
        this.html = '<div id="' + this.id + '" data-role="' + this.anchorLocation + '" data-tap-toggle="' + this.toggleOnTap + '"' + this.style();

        if(this.isFixed) {
            this.html += ' data-position="fixed"';
        }

        if(this.isPersistent) {
            if(typeof(this.isPersistent) === "string"){
                this.html += ' data-id="' + this.isPersistent + '"';
            }else{
                this.html += ' data-id="themprojectpersistenttoolbar"';
            }
        }

        this.html += ' data-transition="' + (M.Application.getConfig('useTransitions') ? M.TRANSITION.SLIDE : M.TRANSITION.NONE) + '"';

        this.html += '>';

        this.renderChildViews();

        this.html += '</div>';

        return this.html;
    },

    /**
     * Triggers render() on all children or simply display the value as a label,
     * if it is set.
     */
    renderChildViews: function() {
        if(this.value && this.showBackButton) {
           
            /* render the back button and add it to the toolbar's html*/
            this.html += '<div class="ui-btn-left">';
            this.html += this.renderBackButton();
            this.html += '</div>';

            /* render the centered value */
            this.html += '<h1>' + this.value + '</h1>';
        }  else if(this.value) {
            this.html += '<h1>' + this.value + '</h1>';
	}  else if (this.childViews) {
	    var childViews = this.getChildViewsAsArray();
            var viewPositions = {};
            for(var i in childViews) {
                var view = this[childViews[i]];
                view._name = childViews[i];
                if( viewPositions[view.anchorLocation] ) {
                    M.Logger.log('ToolbarView has two items positioned at M.' +
                        view.anchorLocation + 
                        '.  Only one item permitted in each location', M.WARN);
                    return;
                }
                viewPositions[view.anchorLocation] = YES;
                switch (view.anchorLocation) {
                    case M.LEFT:
                        this.html += '<div class="ui-btn-left">';
                        this.html += view.render() + this.renderBackButton();
                        this.html += '</div>';
                        break;
                    case M.CENTER:
                        this.html += '<h1>';
                        this.html += view.render();
                        this.html += '</h1>';
                        break;
                    case M.RIGHT:
                        this.html += '<div class="ui-btn-right">';
                        this.html += view.render();
                        this.html += '</div>';
                        break;
                    default:
                        M.Logger.log('ToolbarView children must have an anchorLocation of M.LEFT, M.CENTER, or M.RIGHT', M.WARN);
                        return;
                }
            }
            if(!viewPositions[M.LEFT]&&this.showBackButton){
		 this.html += '<div class="ui-btn-left">';
                 this.html +=  this.renderBackButton();
                 this.html += '</div>';
	    }
        }
    },

    /**
     * Updates the value of the toolbar with DOM access by jQuery.
     *
     * @private
     */
    renderUpdate: function() {
        this.computeValue();
        $('#' + this.id + ' h1').text(this.value);
    },

    /**
     * This method is responsible for registering events for view elements and its child views. It
     * basically passes the view's event-property to M.EventDispatcher to bind the appropriate
     * events.
     *
     * It extend M.View's registerEvents method with some special stuff for list views and their
     * internal events.
     */
    registerEvents: function() {
        if(this.backButton) {
            this.backButton.registerEvents();
        }
        this.bindToCaller(this, M.View.registerEvents)();
    },

    /**
     * Applies some style-attributes to the toolbar.
     *
     * @private
     * @returns {String} The toolbar's styling as html representation.
     */
    style: function() {
        var html = '';
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    },

    /**
     * create the toolbar's back button
     * fix back button TMPP     
     * @private
     * @returns {String} The toolbar's back button html
     */   
    renderBackButton: function(){
	var btBackHTML = '';
        if(this.showBackButton){	    
            this.backButton = this.backButton || M.ButtonView.design({
                value: 'Back',
                icon: 'arrow-l',
                internalEvents: {
                    tap: {
                        action: function() {
                            history.back(-1);
                        }
                    }
                }
            });
	    btBackHTML = this.backButton.render();
	}
	return btBackHTML;
    },
    //end
     
    logState:function(){
	M.Logger.log('ID:'+this.id, M.INFO);
    }
});
