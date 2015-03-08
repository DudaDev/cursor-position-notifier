var $ = require('jquery');
var _ = require('lodash');

function CursorPositionNotifier(options){
	options = options || {};
	this.containerSelector = options.containerSelector;
	this.commonSelector = options.commonSelector;
	this.identifierAttribute = options.identifierAttribute;
	this.callback = options.callback || $.noop;
	this.debounceDelay = options.debounceDelay || 100;
	this.isActive = false;
};

CursorPositionNotifier.prototype.start = function(){
	var self = this;
	this.isActive = true;
	$('body').on(
		'mouseenter.CursorPositionNotifier mouseleave.CursorPositionNotifier',
	 	this.containerSelector + ' ' + this.commonSelector,
	 	_.debounce(this._onEvent.bind(this), this.debounceDelay));
};

CursorPositionNotifier.prototype._onEvent = function(event){
	var data;
	if (this.isActive) {
		data = this._parseEvent(event);
		this.callback(data);
	}
};

CursorPositionNotifier.prototype._parseEvent = function(event){
	var attrVal,
		path = [],
		$toElement = $(event.toElement),
		$currentElement;
	if ($toElement.length > 0 && $toElement.is(this.commonSelector)){
		attrVal = $toElement.attr(this.identifierAttribute);
		$currentElement = $toElement;
		path = [];
		
		while ($currentElement.length) {
			path.push($currentElement.attr(this.identifierAttribute));
			$currentElement = $currentElement.parent().closest(this.commonSelector);
		}

		path = path.reverse();	
	}
	
	return {
		cursorOn: attrVal,
		path: path
	}
};

CursorPositionNotifier.prototype.pause = function(){
	this.isActive = false;
	$('body').off('mouseenter.cursorPositionNotifier mouseleave.cursorPositionNotifier');
};

CursorPositionNotifier.prototype.resume = CursorPositionNotifier.prototype.start;

CursorPositionNotifier.prototype.destroy = function(){
	this.hold();
	this.callback = null;
};

module.exports = CursorPositionNotifier;