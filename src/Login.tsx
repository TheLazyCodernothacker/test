import Logo from "./Logo_square.png"

export default function Login(){
    return (
        <>
        <div className="flex flex-wrap">
            <div className="flex items-center justify-center p-8" style={{"flex": "300px 1 1"}}>
                <img src={Logo} className="w-1/2"></img>
            </div>
            <div className="flex items-center justify-center p-8 bg-sky-700" style={{"flex": "300px 1 1"}}>
                <div className="bg-white rounded shadow-lg"
                >
                    <h1>Login</h1>
                </div>
            </div>

        </div>
        </>
    )
}