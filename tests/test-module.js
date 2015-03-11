"use strict";

function CursorPositionNotifier(options) {
	var self = this;
	options = options || {};
	this.containerSelector = options.containerSelector;
	this.commonSelector = options.commonSelector;
	this.identifierAttribute = options.identifierAttribute;
	this.callback = options.callback || $.noop;
	this.columns = options.columns || 1;
	this.rows = options.rows || 1;
	this.debounceDelay = options.debounceDelay || 100;
	this.isActive = false;
	this._current = {};
	(function() {
		var __current = {
			column: 0,
			row: 0,
			cursorOn: null
		};
		Object.defineProperty(this._current, 'observed', {
			set: function(newCurrent) {
				newCurrent = _.extend({}, __current, newCurrent);
				if (!newCurrent.cursorOn) {
					newCurrent.row = null;
					newCurrent.column = null;
				}
				if (!(!newCurrent.cursorOn &&
						typeof newCurrent.row === 'number' &&
						typeof newCurrent.column === 'number'
					) &&
					!(
						newCurrent.cursorOn &&
						(
							typeof newCurrent.row !== 'number' ||
							typeof newCurrent.column !== 'number'
						)
					) &&
					!(
						(typeof newCurrent.row === 'number' && newCurrent.row < 0) ||
						(typeof newCurrent.column === 'number' && newCurrent.column < 0)
					) &&
					(
						newCurrent.cursorOn !== __current.cursorOn ||
						newCurrent.row !== __current.row ||
						newCurrent.column !== __current.column
					)
				) {
					__current = newCurrent;
					self.callback({
						cursorOn: __current.cursorOn,
						row: __current.row,
						column: __current.column
					});
				} else {
					__current = newCurrent;
				}

			},
			get: function() {
				return __current;
			}
		});
	}.bind(this))();

};

CursorPositionNotifier.prototype.start = function() {
	var self = this;
	this.isActive = true;
	$('body').on(
		'mouseenter.CursorPositionNotifier mouseleave.CursorPositionNotifier',
		this.containerSelector + ' ' + this.commonSelector,
		this._onElementSwitch.bind(this)
	);
};

CursorPositionNotifier.prototype._onElementSwitch = function(event) {
	var parsed;
	if (this.isActive) {
		parsed = this._parseEvent(event);
		this._initCurrentTracking(parsed, event);
	}
};

CursorPositionNotifier.prototype._parseEvent = function(event) {
	var attrVal,
		path = [],
		$toElement = $(event.toElement),
		$currentElement,
		isValidElement,
		boundingRect,
		rect = {
			height: null,
			width: null
		};
	if ($toElement.length > 0 && $toElement.is(this.commonSelector)) {
		attrVal = $toElement.attr(this.identifierAttribute);
		$currentElement = $toElement;
		path = [];

		while ($currentElement.length) {
			path.push($currentElement.attr(this.identifierAttribute));
			$currentElement = $currentElement.parent().closest(this.commonSelector);
		}

		path = path.reverse();
	}

	isValidElement = $toElement.length && attrVal;
	if (isValidElement) {
		boundingRect = $toElement.get(0).getBoundingClientRect();
		rect.height = boundingRect.height;
		rect.width = boundingRect.width;
	}
	return {
		cursorOn: attrVal,
		path: path,
		element: isValidElement ? $toElement : null,
		height: rect.height,
		width: rect.width
	};
};

CursorPositionNotifier.prototype._initCurrentTracking = function(info, event) {
	var element = info.element;

	if (this._current.observed.element) {
		this._current.observed.element.off('mousemove.cursorPositionNotifier');
	}
	this._current.observed = info;
	if (info.cursorOn) {
		this._onCurrentMousemove(event);
		element.on('mousemove.cursorPositionNotifier', _.debounce(this._onCurrentMousemove.bind(this), this.debounceDelay));
	}

};

CursorPositionNotifier.prototype.pause = function() {
	this.isActive = false;
	$('body').off('mouseenter.cursorPositionNotifier mouseleave.cursorPositionNotifier');
};

CursorPositionNotifier.prototype._onCurrentMousemove = function(event) {
	var $this = $(event.currentTarget),
		position = {
			x: event.pageX - $this.offset().left,
			y: event.pageY - $this.offset().top
		},
		gridPosition = this._computeGridPosition(position);
	this._current.observed = {
		row: gridPosition.row,
		column: gridPosition.column,
	};
};

CursorPositionNotifier.prototype._computeGridPosition = function(position) {
	var gridPosition = {};
	gridPosition.row = Math.floor(position.y / Math.floor(this._current.observed.height / this.rows));
	gridPosition.column = Math.floor(position.x / Math.floor(this._current.observed.width / this.columns));
	return gridPosition;
};

CursorPositionNotifier.prototype.resume = CursorPositionNotifier.prototype.start;

CursorPositionNotifier.prototype.destroy = function() {
	this.hold();
	this.callback = null;
};