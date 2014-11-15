$(document).on('ready', function() {
	$(document).on('click', '.side_bar ul li', function(event) {
		if($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		}
		else {
			$(this).addClass('selected');
		}
	});
});