//Navbar.jsx


export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full text-white px-34 flex justify-between items-center h-20 z-10">
      <p className="font-semibold text-3xl">🌱 GreenRemedy</p>
      <ul className="flex space-x-6 font-semibold">
        <li>
          <a
            href="#"
            className="hover:bg-white hover:text-black px-7 py-3 rounded-full transition-colors duration-500"
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="/login"
            className="hover:bg-white hover:text-black px-7 py-3 rounded-full transition-colors duration-500"
          >
           Login
          </a>
        </li>
        <li>
          <a
            href="/signup"
            className="hover:bg-white hover:text-black px-7 py-3 rounded-full transition-colors duration-500"
          >
           Sign Up
          </a>
        </li>
        <li>
          <a
            href="/about"
            className="hover:bg-white hover:text-black px-7 py-3 rounded-full transition-colors duration-500 bg-white text-black"
          >
            About
          </a>
        </li>
      </ul>
    </nav>
  );
}