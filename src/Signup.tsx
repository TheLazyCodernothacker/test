import Logo from "./Logo_square.png";
import { useRef } from "react";

export default function Signup() {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  async function submit(e) {
    e.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;
    if (document.cookie === "signedup=true") {
      alert("You have already signed up!");
      return;
    }
    if (username.length < 3) {
      alert("Username must be at least 3 characters long!");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }
    if (username.length > 20) {
      alert("Username must be at most 20 characters long!");
      return;
    }
    if (password.length > 20) {
      alert("Password must be at most 20 characters long!");
      return;
    }
    //use regex to check if username is alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      alert("Username must be alphanumeric!");
      return;
    }

    if (password.includes(" ")) {
      alert("Password cannot contain spaces!");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.message === "User saved") {
      alert("Signup successful!");
      document.cookie = "signedup=true";
      window.location.href = "/login";
    } else {
      alert(data.message);
    }
  }
  return (
    <>
      <div className="flex flex-wrap" style={{ minHeight: "90vh" }}>
        <div
          className="flex items-center justify-center p-8"
          style={{ flex: "300px 1 1" }}
        >
          <img src={Logo} className="w-1/2"></img>
        </div>
        <div
          className="flex items-center justify-center p-8 bg-sky-700"
          style={{ flex: "300px 1 1" }}
        >
          <div className="bg-white rounded shadow-lg p-8">
            <h1 className="text-3xl">Signup</h1>
            <form className="mt-4" onSubmit={submit}>
              <div className="mb-4">
                <label className="block text-lg">Username</label>
                <input
                  ref={usernameRef}
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                ></input>
              </div>
              <div className="mb-4">
                <label className="block text-lg">Password</label>
                <input
                  ref={passwordRef}
                  type="password"
                  className="w-full px-3 py-2 border rounded"
                ></input>
              </div>
              <button className="w-full bg-sky-600 text-white rounded px-3 py-2">
                Signup
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
