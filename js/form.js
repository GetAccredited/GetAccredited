$(document).on('ready', function() {
	$(document).on('click', '.side_bar ul li', function(event) {
		$('.side_bar ul li').removeClass('selected');
		$(this).addClass('selected');
	});
	$( "#tabs" ).tabs();
});