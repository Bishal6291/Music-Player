import "./Home-Page.css";
import { useNavigate } from "react-router-dom"; //Reac router hook(help to move another page).

export default function HomePage() { 
  const navigate = useNavigate();
  const fileHandle = (e)=>{
    const file = Array.from(e.target.files);  // Converts that FileList into a normal JavaScript array.
      if (file.length > 0) {
      navigate("/player", {state: {file}});
    }   
  };   

    return (
    <>
      <div className="phone_page">
        <div className="navbar-logo">
        </div>
        <div className="outer-media-box">
         <div className ="media-box">
          <label htmlFor="fileFetch">
         <i className="bi bi-file-earmark-music d-block d-sm-none" id="music-add-switch"
  ></i>
  </label>
  <input type="file" id="fileFetch" multiple accept="audio/*" style={{display:"none"}} onChange={fileHandle}/>
 </div>
</div>
 </div>
 </>
  );
}