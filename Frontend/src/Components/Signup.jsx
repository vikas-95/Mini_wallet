import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Validation from "./SignupValidation";
import axios from "axios";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import ReCAPTCHA from "react-google-recaptcha";
import dotenv from "dotenv";
import { ethers } from "ethers";
import "./Signup.css";
import Home from "./Home";
import toast, { Toaster } from "react-hot-toast";
// dotenv.config();

const Signup = () => {
  const captchaRef = useRef(null);
  // let createNewAccount;
  // let pvtKey;
  // let address;

  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);
  const [userid, setNewUserId] = useState(null);

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const defaultRefferalId = 324231;

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors(Validation(values));
    try {
      if (errors.name === "" && errors.email === "" && errors.password === "") {
        // Get the reCAPTCHA token
        const token = captchaRef.current.getValue();
        captchaRef.current.reset();
        // console.log("Token:", token);

        // Verify if the token exists
        if (!token) {
          toast("Please check the Captcha");
          return;
        }

        const newAccount = ethers.Wallet.createRandom();
        const newPvtKey = newAccount.privateKey;
        const newAddress = newAccount.address;

        const userId = () => {
          let arr = [1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 0];
          let v = [];
          let x;
          for (let i = 0; i < 6; i++) {
            v[i] = arr[Math.floor(Math.random() * arr.length)];
            x = v.join("");
          }
          return x;
        };
        console.log(userId());

        const currentDate = new Date();
        const date = currentDate.getDate(); // Get the day of the month (1-31)
        const month = currentDate.getMonth() + 1; // Get the month (0-11), add 1 to adjust for 1-based indexing
        const year = currentDate.getFullYear(); // Get the year (YYYY)
        const hours = currentDate.getHours(); // Get the hour (0-23)
        const minutes = currentDate.getMinutes(); // Get the minutes (0-59)
        const seconds = currentDate.getSeconds(); // Get the seconds (0-59)

        // Format the date and time as desired (e.g., MM/DD/YYYY HH:MM:SS)
        const formattedDateTime = `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;

        // Send the signup data along with the reCAPTCHA token
        const response = await axios.post("http://localhost:8081/signup", {
          userId: userId(),
          ...values,
          refId: defaultRefferalId,
          recaptchaToken: token, // Correct key for the reCAPTCHA token
          date: formattedDateTime,
          address: newAddress,
          pvtkey: newPvtKey,
        });

        // Handle the response
        if (response.data.message === "User registered successfully") {
          navigate("/");
          setTimeout(() => {
            toast.success("Your account has been created");
          }, 500);
        } else {
          toast.error("Error creating account");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
        <div className="bg-white p-3 rounded w-25">
          <h2 className="d-flex justify-content-center">Signup</h2>
          <form action="" onSubmit={handleSubmit}>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="mb-3">
              <label for="name">
                <strong>Name</strong>
              </label>
              <input
                b
                type="text"
                onChange={handleInput}
                placeholder="Enter Name"
                name="name"
                className="form-control rounded-0"
              />
              {errors.name && (
                <span className="text-danger">{errors.name}</span>
              )}
            </div>

            <div className="mb-3">
              <label for="email">
                <strong>Email</strong>
              </label>
              <input
                type="email"
                onChange={handleInput}
                placeholder="Enter Email"
                name="email"
                className="form-control rounded-0"
              />
              {errors.email && (
                <span className="text-danger">{errors.email}</span>
              )}
            </div>

            <div className="mb-3">
              <label for="password">
                <strong>Password</strong>
              </label>
              <div
                className="flex justify-between"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type={type}
                  onChange={handleInput}
                  placeholder="Enter Password"
                  name="password"
                  className="form-control rounded-0"
                  autoComplete="current-password"
                />
                <span
                  class="flex justify-around items-center"
                  onClick={handleToggle}
                >
                  <Icon class="absolute mr-10" icon={icon} size={25} />
                </span>
              </div>

              {errors.password && (
                <span className="text-danger">{errors.password}</span>
              )}
            </div>

            <div className="mb-3">
              <label for="Ref">
                <strong>Referral Code</strong>
              </label>
              <input
                type="text"
                onChange={handleInput}
                name="refId"
                className="form-control rounded-0"
                defaultValue={`${defaultRefferalId}`}
                readOnly
              />
            </div>
            <div className="captcha">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_REACT_APP_SITE_KEY}
                ref={captchaRef}
              />
            </div>

            <button type="submit" className="btn btn-success w-100 mt-3">
              <strong>Sign up</strong>
            </button>
            <p>You are agreed to our terms and policies</p>
            <Link
              to="/"
              className="btn btn-default border w-100 bg-light text-decoration-none"
            >
              <strong>Login</strong>
            </Link>
          </form>
        </div>
      </div>
      {/* <Home PrivateKey={newPvtKey} Address={"fsdgdfg"} /> */}
    </>
  );
};

export default Signup;
