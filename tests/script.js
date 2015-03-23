$(function(){
	window.cpn = new CursorPositionNotifier({
		containerSelector: '.container',
		commonSelector: '[widget]',
		rows: 2,
		columns:2,
		identifierAttribute: 'id',
		callback: function(data){
			console.log(data);
			$('[widget]').removeClass('hovered from-top from-right from-bottom from-left');
			if (data.cursorOn){
				$('#' + data.cursorOn).addClass('hovered');
				if (data.row === 0){
					$('#' + data.cursorOn).addClass('from-top');
				}
				if (data.row === 1){
					$('#' + data.cursorOn).addClass('from-bottom');
				}
				if (data.column === 0){
					$('#' + data.cursorOn).addClass('from-left');
				}
				if (data.column === 1){
					$('#' + data.cursorOn).addClass('from-right');
				}
			}
		}
	});
	window.cpn.start();
});

