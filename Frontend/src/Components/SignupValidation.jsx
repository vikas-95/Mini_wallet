function Validation(values){
    let error = {};
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?\/\\~-]).{10,}$/;

    if (values.name === "") {
        error.name = "Name should not be empty";
    } else if (values.name.length > 50) {
        error.name = "Name should not exceed 50 characters";
    } else {
        error.name = "";
    }

    if (values.email === "") {
        error.email = "Email should not be empty";
    } else if (!email_pattern.test(values.email)) {
        error.email = "Email pattern didn't match";
    } else if (values.email.length > 255) {
        error.email = "Email should not exceed 255 characters";
    } else {
        error.email = "";
    }

    if (values.password === "") {
        error.password = "Password should not be empty";
    } else if (!password_pattern.test(values.password)) {
        error.password = "Password should contain [10 characters, 1 digit, 1 lowercase, 1 uppercase, 1 special character]";
    } else {
        error.password = "";
    }

    return error;
}

export default Validation;
