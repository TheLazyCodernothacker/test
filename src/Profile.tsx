import useSession from "./hooks/useSession";
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);
  const handleRef = useRef(null);
  const imageRef = useRef(null);
  const infoRef = useRef(null);
  useEffect(() => {
    useSession().then((res) => {
      if (res.message === "Session not found") {
        window.location.href = "/login";
      } else {
        setUser(res.user);
        setLoading(false);
      }
    });
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (
      user.username == userRef.current.value &&
      user.handle == handleRef.current.value &&
      user.image == imageRef.current.value &&
      user.info == infoRef.current.value
    ) {
      alert("Please make a change.");
      return;
    }
    const res = await fetch("/api/updateUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userRef.current.value,
        handle: handleRef.current.value,
        image: imageRef.current.value,
        info: infoRef.current.value,
      }),
    });
    const data = await res.json();
    if (data.message === "Success") {
      window.location.reload();
    } else {
      alert(data.message);
    }
  }
  return (
    <div className="p-4" style={{ minHeight: "80vh" }}>
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <div className="flex gap-4 p-4">
            <img
              src={
                user.image
                  ? user.image
                  : "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg"
              }
              className="h-48 rounded-full"
            />
            <div className="flex flex-col justify-center ml-4">
              <h1 className="text-3xl">{user.username}</h1>
              <h1 className="text-xl mt-2 text-gray-600">{user.handle}</h1>
              <h1 className="text-xl mt-6">{user.info}</h1>
            </div>
          </div>
          <div className="p-4">
            <h1 className="text-4xl">Edit User Info</h1>
            <form className="mt-4" onSubmit={submit}>
              <h1 className="text-xl my-2">Username:</h1>
              <Input
                type="text"
                placeholder={user.username}
                defaultValue={user.username}
                ref={userRef}
                className="w-full p-2 border rounded"
              />
              <h1 className="text-xl my-2">Handle:</h1>
              <Input
                type="text"
                placeholder={user.handle}
                defaultValue={user.handle}
                ref={handleRef}
                className="w-full p-2 border rounded mt-2"
              />
              <h1 className="text-xl my-2">Image URL:</h1>

              <Input
                type="text"
                placeholder={user.image}
                defaultValue={user.image}
                ref={imageRef}
                className="w-full p-2 border rounded mt-2"
              />
              <h1 className="text-xl my-2">About me:</h1>

              <Textarea
                placeholder={user.info}
                defaultValue={user.info}
                className="w-full p-2 border rounded mt-2"
                ref={infoRef}
              ></Textarea>
              <Button className="w-full  mt-2 rounded">Submit</Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
