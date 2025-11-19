import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import NavbarMenu from "../components/NavbarMemu"

const RouterLayout = () => {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <header className="w-full max-w-full">
        <Navbar />   
        <NavbarMenu />
      </header>   
      <main className="w-full max-w-full">
        <Outlet/>
      </main>
      <footer className="w-full max-w-full">
        <Footer/>
      </footer>
    </div>
  );
};

export default RouterLayout;