import Logo from "./Logo_square.png";

export default function Login() {
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
            <h1 className="text-3xl">Login</h1>
            <form className="mt-4">
              <div className="mb-4">
                <label className="block text-lg">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                ></input>
              </div>
              <div className="mb-4">
                <label className="block text-lg">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded"
                ></input>
              </div>
              <button className="w-full bg-sky-600 text-white rounded px-3 py-2">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
