import "../App.css";
import Logo from "../Logo_square.png";

export default function Loader() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "90vh" }}
    >
      <div className="p-4 flex flex-col items-center">
        <img src={Logo} className="w-48"></img>
        <h1 className="text-xl">Loading...</h1>
      </div>
    </div>
  );
}
