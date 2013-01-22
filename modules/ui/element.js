// ==========================================================================
// Project:   The M-Project Plus - Mobile HTML5 Application Framework
// Creator:   
// Date:      07.01.2013
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
// LOG
//	+) 23.01.2013 : create
// ==========================================================================

M.Element = M.View.extend({
    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.Element',
  		  
    attribute: null,  
    e : 'div',
    /**
     * Renders a simple div container and applies css classes if specified.
     *
     * @private
     * @returns {String} The container view's html representation.
     */
    render: function() {
        this.html += '<' + this.e + ' id="' + this.id + '"' + this.style() + '>';

        this.renderChildViews();

        this.html += '</' + this.e + '>';

        return this.html;
    },

    /**
     * Applies some style-attributes to the container view.
     *
     * @private
     * @returns {String} The container's styling as html representation.
     */
    style: function() {
        var html = ' ';	
	if(this.attribute != null){
		for (var i in this.attribute) {
			if (this.attribute.hasOwnProperty(i)) { 
				html += (i+ " =' "+ this.attribute[i]+" ' ");
			}
		}
	}
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '" style="' + (this.cssStyle = (this.cssStyle != null) ? this.cssStyle : '') + '" ';
        }
        return html;
    }
});
