$(document).ready(function() {
    // If the user is already logged in, redirect to appropriate page
    $.ajax({
        url: "api/getLoggedInUser",
        dataType: "json",
        success: function(user) {
            if (user) {
                redirect(user.type);
            }
        }
    });

    // Verify login credentials when "Login" is clicked
    $("#login").submit(function(event) {
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "api/getUserAndLogin",
            data: { email: $("#login_email").val(), password: $("#login_password").val() },
            dataType: "json",
            success: function(result) {
                if (result !== null) {
                    redirect(result.type);
                } else {
                    alert("Incorrect login information.");
                }
            }
        });
    });
});

// Redirect the user to either the form or report page depending on permissions
function redirect(userType) {
    if (userType === "instructor") {
        window.location.href = "form.html";
    } else if (userType === "admin") {
        window.location.href = "report.html";
    }
}