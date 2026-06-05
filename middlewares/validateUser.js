const validateUser = (req, res, next) => {
    const { name, email, password } = req.body;

    // 1. Check if it's a registration request and 'name' is missing
    // (We skip this check for login since login only needs email/password)
    if (req.path === '/register' && !name) {
        return res.status(400).send({
            success: false,
            message: "Name is required for registration."
        });
    }

    // 2. Check for missing email or password
    if (!email || !password) {
        return res.status(400).send({
            success: false,
            message: "Email and password are required fields."
        });
    }

    // 3. Email Syntax Validation (The Regex Check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            success: false,
            message: "Invalid email format. Please use standard formatting (e.g., user@example.com)."
        });
    }

    // 4. Password Length Check
    if (password.length < 6) {
        return res.status(400).send({
            success: false,
            message: "Password must be at least 6 characters long."
        });
    }

    // If everything passes, move forward gracefully
    next();
};

module.exports = validateUser;