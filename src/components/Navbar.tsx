export default function Navbar() {
  return (
    <nav className="bg-sky-600 flex p-4 gap-4 items-center">
      <h1 className="text-white text-xl px-3 py-2">Feather Chat</h1>
      <a
        href="/login"
        className="ml-auto text-white text-xl  bg-sky-700 px-4 py-2 rounded"
      >
        Login
      </a>
      <a
        href="/signup"
        className=" text-white text-xl  bg-sky-800 px-4 py-2 rounded"
      >
        Signup
      </a>
    </nav>
  );
}
