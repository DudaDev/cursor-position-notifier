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
	$(this.containerSelector).on(
		'mouseenter.CursorPositionNotifier mouseleave.CursorPositionNotifier',
	 	this.commonSelector,
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
	var attrVal = event.toElement ? $(event.toElement).attr(this.identifierAttribute) : undefined,
		$currentElement = $(event.toElement),
		path = [];
	
	while ($currentElement.length) {
		path.push($currentElement.attr(this.identifierAttribute))
		$currentElement = $currentElement.parent().closest(this.commonSelector);
	}

	path = path.reverse();

	return {
		cursorOn: attrVal,
		path: path
	}
};

CursorPositionNotifier.prototype.pause = function(){
	this.isActive = false;
	$(this.containerSelector).off('mouseenter.cursorPositionNotifier mouseleave.cursorPositionNotifier');
};

CursorPositionNotifier.prototype.resume = CursorPositionNotifier.prototype.start;

CursorPositionNotifier.prototype.destroy = function(){
	this.hold();
	this.callback = null;
};

module.exports = CursorPositionNotifier;