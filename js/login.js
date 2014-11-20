$(document).ready(function() {
    $("#login").submit(function(event) {
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "api/getUserAndLogin",
            data: { email: $("#login_email").val(), password: $("#login_password").val() },
            dataType: "json",
            success: function(result) {
                if (result !== null) {
                    var type = result.type;
                    if (type === "instructor") {
                        window.location.href = "form.html";
                    } else if (type === "admin") {
                        window.location.href = "report.html";
                    }
                } else {
                    alert("Incorrect login information.");
                }
            }
        });
    });
});