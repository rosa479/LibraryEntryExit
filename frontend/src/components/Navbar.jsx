import { NavLink } from "react-router-dom"



const Navbar = () => {
  return (
    <header className="bg-blue-900 w-full text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <img src="iitkgp-logo.png" alt="Logo" className="h-8" />
          IIT Kharagpur
        </h1>
        <nav className="space-x-6 font-medium">
          <NavLink to="/" className="hover:underline">Home</NavLink>
          <NavLink to="/dashboard" className="hover:underline">Admin</NavLink >
        </nav>
      </header>
  )
}

export default Navbar
