import React, { createContext, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Validation from "./LoginValidation";
import axios from "axios";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import toast, { Toaster } from "react-hot-toast";

export const UserdetailsContext = createContext(null);

const Login = () => {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [user,setUser] = useState();

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };
  // const UserdetailsContext = createContext(null);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: [event.target.value],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors(Validation(values));
    if (errors.email === "" && errors.password === "") {
      axios
        .post("http://localhost:8081/login", values)
        .then((res) => {
          console.log("Login response:", res); // Log the response from the server
          if (res.data.message === "Success") {
            navigate("/home", { state: res.data.userDetails }); // Navigate to the home page
            setTimeout(() => {
              toast.success("Logged in successfully");
            }, 500);
          } else {
            console.log("Login failed:", res.data.message);
            toast("No record existed");
          }
        })
        .catch((err) => console.log("Login error:", err));
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h2 className="d-flex justify-content-center">Login</h2>
        <form action="" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label for="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              name="email"
              onChange={handleInput}
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
                placeholder="Enter Password"
                name="password"
                onChange={handleInput}
                className="form-control rounded-0"
                autoComplete="current-password"
              />
              <span
                class="flex justify-around items-center"
                onClick={handleToggle}
              >
                <Icon class="absolute mr-10" icon={icon} size={25} />
              </span>
              {errors.password && (
                <span className="text-danger">{errors.password}</span>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100 ">
            <strong>Log in</strong>
          </button>
          <p>You are agreed to our terms and policies</p>
          <Toaster position="top-center" reverseOrder={false} />
          <Link
            to="/Signup"
            className="btn btn-default border w-100 bg-light text-decoration-none"
          >
            <strong>Create Account</strong>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
