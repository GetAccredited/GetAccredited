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