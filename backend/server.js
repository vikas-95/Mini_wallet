const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const router = express.Router();
const app = express();
const axios = require("axios");
require("dotenv").config();
const port = process.env.PORT || 8081;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "signup",
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);

router.post("/signup", async (req, res) => {
  // Destructure name, email, password, and recaptchaToken from the request body
  const {
    userId,
    name,
    email,
    password,
    refId,
    recaptchaToken,
    date,
    address,
    pvtkey,
  } = req.body;

  try {
    // Verify the reCAPTCHA token
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.REACT_APP_SECRET_KEY}&response=${recaptchaToken}`
    );

    // Check if the reCAPTCHA verification is successful
    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // If verification is successful, proceed with inserting the user data into the database
    const sql =
      "INSERT INTO register_table (`userId`,`name`,`email`,`password`, `Refferal_Id`, `date`, `address`, `privatekey`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      userId,
      name,
      email,
      password,
      refId,
      date,
      address,
      pvtkey,
    ];

    console.log(values);

    db.query(sql, values, (err, data) => {
      if (err) {
        console.log(err, "errerrerrerr");
        return res
          .status(500)
          .json({ message: "Error inserting data into database" });
      }
      return res.status(200).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error verifying reCAPTCHA" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the database to check if the user with the provided email and password exists
    const sql =
      "SELECT *, `address` FROM register_table WHERE email = ? AND password = ?";
    const values = [email, password];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      console.log("Database result:", result);

      // Check if a user with the provided email and password was found
      if (result.length > 0) {
        // User found, return "Success" response
        return res
          .status(200)
          .json({ message: "Success", userDetails: result[0] });
      } else {
        // User not found, return "Unauthorized" response
        return res.status(401).json({ message: "Unauthorized" });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/home", async (req, res) => {
  try {
    const { transaction2 } = req.body;

    // First, let's alter the table if necessary
    const alterQuery = "ALTER TABLE user_transaction_details ADD COLUMN IF NOT EXISTS extra_column VARCHAR(255)";
    db.query(alterQuery, (alterErr, alterResult) => {
      if (alterErr) {
        console.error("Error altering table:", alterErr);
        return res.status(500).json({
          message: "Error altering table",
        });
      }

      // Now proceed with inserting transactions
      for (const transaction of transaction2) {
        const { txHash, fromAddress, toAddress, value, timestamp } = transaction;

        const sql =
          "INSERT INTO user_transaction_details (`tx_hash`, `from_address`, `to_address`, `value`, `timestamp`) VALUES (?, ?, ?, ?, ?)";
        const values = [txHash, fromAddress, toAddress, value, timestamp];

        db.query(sql, values, (err, result) => {
          if (err) {
            console.error(
              "Error inserting transaction details into the database:",
              err
            );
            return res.status(500).json({
              message: "Error inserting transaction details into the database",
            });
          }
          console.log("Transaction details inserted successfully:", result);
        });
      }

      return res.status(200).json({ message: "Transaction details inserted successfully" });
    });
  } catch (error) {
    console.error("Error handling transaction request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/home/balance", async (req, res) => {
  try {
    const { user_id, deposit_usdt, total_deposit_usdt, activation_wallet } = req.body;

    // Check if the user exists in the wallet_table
    const checkUserQuery = "SELECT * FROM wallet_table WHERE user_id = ?";
    db.query(checkUserQuery, [user_id], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking user:", checkErr);
        return res.status(500).json({ message: "Error checking user" });
      }

      if (checkResult.length === 0) {
        // User does not exist, insert the balance
        const insertQuery = "INSERT INTO wallet_table (`user_id`, `deposit_usdt`, `total_deposit_usdt`, `activation_wallet`) VALUES (?, ?, ?, ?)";
        db.query(insertQuery, [user_id, deposit_usdt, total_deposit_usdt, activation_wallet], (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Error inserting wallet balances:", insertErr);
            return res.status(500).json({ message: "Error inserting wallet balances" });
          }
          return res.status(200).json({ message: "Wallet balance inserted successfully" });
        });
      } else {
        // User exists, update the balance
        const updateQuery = "UPDATE wallet_table SET `deposit_usdt` = ?, `total_deposit_usdt` = ?, `activation_wallet` = ? WHERE `user_id` = ?";
        db.query(updateQuery, [deposit_usdt, total_deposit_usdt, activation_wallet, user_id], (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating wallet balances:", updateErr);
            return res.status(500).json({ message: "Error updating wallet balances" });
          }
          return res.status(200).json({ message: "Wallet balance updated successfully" });
        });
      }
    });
  } catch (error) {
    console.error("Error handling transaction request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});