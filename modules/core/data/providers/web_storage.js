// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Sebastian
// Date:      15.11.2010
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('core/data/data_provider.js');


M.WEBSTORAGE_LOCAL = 'localstorage';

M.WEBSTORAGE_SESSION = 'webstorage';

/**
 * @class
 * 
 * Encapsulates access to the Web Storage (in-browser key value store). It can be either the LocalStorage or SessionStorage.
 * LocalStorage is an in-browser key-value store to permanently persist data.
 * SessionStorage is also an in-browser key-value store but only persists data for the lifetime of browser window/tab.
 * This data provider persists model records as JSON strings with their name and id as key.
 * When fetching these strings from storage, their automatically converted in their corresponding model records.
 *
 * Operates synchronous.
 *
 * @extends M.DataProvider
 */
M.DataProviderWebStorage = M.DataProvider.extend(
/** @scope M.DataProviderWebStorage.prototype */ {

    /**
     * The type of this object.
     * @type String
     */
    type: 'M.DataProviderWebStorage',

    /**
     * The storage object. Either window.localStorage or window.sessionStorage
     */
    storage: null,

    /**
     * Saves a model record to the local storage
     * The key is the model record's name combined with id, value is stringified object
     * e.g.
     * Note_123 => '{ text: 'buy some food' }'
     *
     * @param {Object} that (is a model).
     * @returns {Boolean} Boolean indicating whether save was successful (YES|true) or not (NO|false).
     */
    save: function(obj) {
        try {
            //console.log(obj);
            /* add m_id to saved object */
            /*var a = JSON.stringify(obj.model.record).split('{', 2);
            a[2] = a[1];
            a[1] = '"m_id":' + obj.model.m_id + ',';
            a[0] = '{';
            var value = a.join('');*/
            var value = JSON.stringify(obj.model.record);
            this.storage.setItem(this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_' + obj.model.m_id, value);
            return YES;
        } catch(e) {
            M.Logger.log(M.WARN, 'Error saving ' + obj.model.record + ' to localStorage with key: ' + this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_' + that.m_id);
            return NO;
        }

    },              

    /**
     * deletes a model from the local storage
     * key defines which one to delete
     * e.g. key: 'Note_123'
     *
     * @param {Object} obj The param obj, includes model
     * @returns {Boolean} Boolean indicating whether save was successful (YES|true) or not (NO|false).
     */
    del: function(obj) {
        try {
            if(this.storage.getItem(this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_' + obj.model.m_id)){ // check if key-value pair exists
                this.storage.removeItem(this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_' + obj.model.m_id);
                obj.model.recordManager.remove(obj.model.m_id);
                return YES;
            }
            return NO;
        } catch(e) {
            M.Logger.log(M.WARN, 'Error removing key: ' + this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_' + obj.model.m_id + ' from localStorage');
            return NO;
        }
    },

    /**
     * Finds all models of type defined by modelName that match a key or a simple query.
     * A simple query example: 'price < 2.21'
     * Right now, no AND or OR joins possible, just one query constraint.
     *
     * If no query is passed, all models are returned by calling findAll()
     * @param {Object} The param object containing e.g. the query or the key.
     * @returns {Object|Boolean} Returns an object if find is done with a key, an array of objects when a query is given or no
     * parameter passed.
     */
    find: function(obj) {
        if(obj.key) {
            var record = this.findByKey(obj);
            if(!record) {
                return NO;
            }
            /*construct new model record with the saved id*/
            var reg = new RegExp('^' + this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_([0-9]+)').exec(obj.key);
            var m_id = reg && reg[1] ? reg[1] : null;
            if (!m_id) {
                M.Logger.log('retrieved model has no valid key: ' + obj.key, M.ERR);
                return NO;
            }
            var m = obj.model.createRecord($.extend(record, {m_id: parseInt(m_id), state: M.STATE_VALID}));
            if(obj.callbacks && obj.callbacks.success && M.EventDispatcher.checkHandler(obj.callbacks.success)) {
                this.bindToCaller(obj.callbacks.success.target, obj.callbacks.success.action, [obj.transactionId, m])();
            }
        }

        if(obj.query){
            /**
             * RegEx to match simple queries. E.g.:
             * username = 'paul'
             * price < 12.23
             * result >= -23
             * Captures:
             * 1:   identifier      ( e.g. price )      => (\w*)
             * 2:   operator        ( e.g. < )          => ([<>!=]{1,2}) (actually !! is also allowed but will result in an error
             * 3:   value           ( e.g. 12.23 )      => String or Number: (['"]\w*['"]|(-)?\d+(\.\d+)?)
             */
            var query_regex = /^\s*(\w*)\s*([<>!=]{1,2})\s*(['"]?\w*['"]?|(-)?\d+(\.\d+)?)\s*$/;
            var regexec = query_regex.exec(obj.query);
            if(regexec) {
                var ident = regexec[1];
                var op = regexec[2];
                var val = regexec[3].replace(/['"]/g, "");/* delete quotes from captured string, needs to be done in regex*/
                var res = this.findAll(obj);
                switch(op) {
                    case '=':
                        res = _.select(res, function(o){
                            return o.record[ident] === val;
                        });
                        break;
                    case '!=':
                        res = _.select(res, function(o){
                            return o.record[ident] !== val;
                        });
                        break;
                    case '<':
                        res = _.select(res, function(o){
                            return o.record[ident] < val;
                        });
                        break;
                    case '>':
                        res = _.select(res, function(o){
                            return o.record[ident] > val;
                        });
                        break;
                    case '<=':
                        res = _.select(res, function(o){
                            return o.record[ident] <= val;
                        });
                        break;
                    case '>=':
                        res = _.select(res, function(o){
                            return o.record[ident] >= val;
                        });
                        break;
                    default:
                        M.Logger.log('Unknown operator in query: ' + op, M.WARN);
                        res = [];
                        break;
                }
            } else{
                M.Logger.log('Query does not satisfy query grammar.', M.WARN);
                res = [];
            }
            if(obj.callbacks && obj.callbacks.success && M.EventDispatcher.checkHandler(obj.callbacks.success)) {
                this.bindToCaller(obj.callbacks.success.target, obj.callbacks.success.action, [obj.transactionId, res])();
            }
            
        } else { /* if no query is passed, all models for modelName shall be returned */
            var records = this.findAll(obj);
            if(obj.callbacks && obj.callbacks.success && M.EventDispatcher.checkHandler(obj.callbacks.success)) {
                this.bindToCaller(obj.callbacks.success.target, obj.callbacks.success.action, [obj.transactionId, records])();
            }
        }
    },

    /**
     * Finds a record identified by the key.
     *
     * @param {Object} The param object containing e.g. the query or the key.
     * @returns {Object|Boolean} Returns an object identified by key, correctly built as a model record by calling
     * or a boolean (NO|false) if no key is given or the key does not exist in LocalStorage.
     * parameter passed.
     */
    findByKey: function(obj) {
        var reg = new RegExp('^' + this.keyPrefix + M.Application.name + this.keySuffix);
        /* assume that if key starts with local storage prefix, correct key is given, other wise construct it and key might be m_id */
        obj.key = reg.test(obj.key) ? obj.key : this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_' + obj.key;

        // if key is available
        if(this.storage.getItem(obj.key)) {
            return this.buildRecord(obj.key, obj)
        } else {
            return NO;
        }
    },

    /**
     * Returns all models defined by modelName.
     *
     * Models are saved with key: Modelname_ID, e.g. Note_123
     *
     * @param {Object} obj The param obj, includes model
     * @returns {Object} The array of fetched objects/model records. If no records the array is empty.
     */
    findAll: function(obj) {
        var result = [];
        for(var i = 0; i < this.storage.length; i++) {
            var k = this.storage.key(i);
            regexResult = new RegExp('^' + this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_').exec(k);
            if(regexResult) {
                var record = this.buildRecord(k, obj);//JSON.parse(this.storage.getItem(k));

                /*construct new model record with the saved m_id*/
                var reg = new RegExp('^' + this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_([0-9]+)').exec(k);
                var m_id = reg && reg[1] ? reg[1] : null;
                if(!m_id) {
                    M.Logger.log('Model Record m_id not correct: ' + m_id, M.ERR);
                    continue; // if m_id does not exist, continue with next record element
                }
                var m = obj.model.createRecord($.extend(record, {m_id: parseInt(m_id), state: M.STATE_VALID}));
                
                result.push(m);
            }
        }
        return result;
    },

    /**
     * Fetches a record from LocalStorage and checks whether automatic parsing by JSON.parse set the elements right.
     * Means: check whether resulting object's properties have the data type define by their model attribute object.
     * E.g. String containing a date is automatically transfered into a M.Date object when the model attribute has the data type
     * 'Date' set for this property.
     * 
     * @param {String} key The key to fetch the element from LocalStorage
     * @param {Object} obj The param object, includes model
     * @returns {Object} record The record object. Includes all model record properties with correctly set data types.
     */
    buildRecord: function(key, obj) {
        var record = JSON.parse(this.storage.getItem(key));
        for(var i in record) {
            if(obj.model.__meta[i] && typeof(record[i]) !== obj.model.__meta[i].dataType.toLowerCase()) {
                switch(obj.model.__meta[i].dataType) {
                    case 'Date':
                        record[i] = M.Date.create(record[i]);
                        break;
                }
            }
        }
        return record;
    },

    /**
     * Returns all keys for model defined by modelName.
     *
     * @param {Object} obj The param obj, includes model
     * @returns {Object} keys All keys for model records in LocalStorage for a certain model identified by the model's name.
     */
    allKeys: function(obj) {
        var keys = [];
        for (var i = 0; i < this.storage.length; i++){
            var k = this.storage.key(i)
            regexResult = new RegExp('^' + this.keyPrefix + M.Application.name + this.keySuffix + obj.model.name + '_').exec(k);
            if(regexResult) {
                keys.push(k);
            }
        }
        return keys;
    },

    configure: function(obj) {
        obj = obj || {};
        switch(obj.storage) {
            case M.WEBSTORAGE_SESSION:
                obj.storage = window.sessionStorage; // maybe check if possible
                break;
            case M.WEBSTORAGE_LOCAL:
            default:
                obj.storage = window.localStorage;
                break;
        }

        obj.keyPrefix = obj.keyPrefix ? obj.keyPrefix : M.Application.getConfig('keyPrefix');
        obj.keySuffix = obj.keySuffix ? obj.keySuffix : M.Application.getConfig('keySuffix');

        return this.extend(obj);
    }

});