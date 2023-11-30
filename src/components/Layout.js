import {Outlet} from "react-router-dom";
import Footer from "./Footer/Footer";
import USOFHeader from "./Header/USOFHeader";


function Layout() {

    return (
        <div>
            <USOFHeader />
            <Outlet />
            <Footer />
        </div>
    )
}

export default Layout;