import React from 'react'

export default function Home() {
  return (
    <div className='Home'>

      <div id="carouselExampleInterval" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active" >
            <h5 className="text-center">BILASPUR RAILWAY STATION</h5>
            <img src="https://i.ibb.co/D7BJhQh/Whats-App-Image-2024-01-13-at-23-55-38.jpg" className="d-block w-100" alt="..." />
          </div>
          <div className="carousel-item" >
            <h5 className="text-center">GM OFFICE</h5>
            <img src="https://i.ibb.co/88zmRrN/Whats-App-Image-2024-01-13-at-23-56-29.jpg" className="d-block w-100" alt="..." />
          </div>
          <div className="carousel-item" >
            <h5 className="text-center">BILASPUR LOBBY</h5>
            <img src="https://i.ibb.co/xGJxNXL/Whats-App-Image-2024-01-13-at-23-56-08.jpg" className="d-block w-100" alt="..." />
          </div>
  {/* <div className="carousel-item" >
             <h5 className="text-center" style={{fontSize:'xx-large'}}>SHRI VASU GUPTA Sr DEE(OP)/BSP/SECR,&nbsp;&nbsp;&nbsp; Shree Ramendra Tewari PCEE/SECR/BSP</h5>
             <img src="https://i.ibb.co/Gc7yHCC/Whats-App-Image-2024-01-25-at-23-36-57.jpg" style={{ objectFit: 'contain' }} className="d-block w-100" alt="..." />
             <h5 className="text-center" style={{fontSize:'xx-large'}}>Shree Praveen pandey DRM/BSP/SECR</h5>
           </div> */}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  )
}