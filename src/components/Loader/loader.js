import React from 'react';
import { RotatingLines } from 'react-loader-spinner';
import * as s from "../../styles/globalStyles";

function Loader() {
    return (
        <div className="overlay">
            <div className="spinner">
            <s.Image src={"config/images/loader.gif"} wid="50" />
           {/* <RotatingLines width="100" strokeColor="#FF5733" /> */}
           </div>
        </div>
    );
}



export default Loader;