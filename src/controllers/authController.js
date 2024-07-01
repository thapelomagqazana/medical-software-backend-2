const { validationResult } = require("express-validator");
const authService = require("../services/authService");

// Register a new user
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, firstName, lastName } = req.body;

    try {
        // Call registerUser from authService
        const result = await authService.registerUser({ email, password, role, firstName, lastName });

        if (result.error){
            return res.status(400).json({ msg: result.error });
        }

        res.json({ msg: "User registered successfully" });
    } catch (err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Authenticate user and get token
exports.loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
  
    try {
      // Call loginUser from authService
      const result = await authService.loginUser({ email, password });

  
      if (result.error) {
        return res.status(400).json({ msg: result.error });
      }
  
      res.json({ token: result.token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};