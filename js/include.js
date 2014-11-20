$(document).ready(function() {
	$.ajax({
		url: "api/getLoggedInUser",
        dataType: "json",
		success: function(user) {
			if (user) {
				$("#user").html(user.name);
			} else {
				$("#user").html("N/A");
			}
		}
	});

	$("#logout").click(function() {
		$.ajax({
			url: "api/logout",
			success: function() {
				window.location.href = "index.html";
			}
		});
	});
});

function getSemester() {
	var today = new Date();
	var month = today.getMonth();
	var year = today.getFullYear();

	var semester = "";

	if(month > 6) {
		semester = "Fall";
	}
	else {
		semester = "Spring";
	}

	semester += year;

	return semester;
}