import React, { useEffect, useState } from 'react'
import axios from 'axios'
import pnr from './PNGs/PNR1.jpeg'

export default function Admin() {

  const [IsLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true)
    }
    else {
      setIsLoggedIn(false)
    }
  }, [])


  // eslint-disable-next-line
  const [IsStaffLoggedIn, setIsStaffLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('Stafftoken');
    if (token) {
      setIsStaffLoggedIn(true)
    }
    else {
      setIsStaffLoggedIn(false)
    }
  }, [])

  const [Feedback, setFeedBack] = useState({
    Name: '',
    FeedbackData: '',
    TimeAdded: ''
  })

  const AddNewFeedback = async (e) => {
    e.preventDefault();
    try {
      const updatedFeedback = { ...Feedback, TimeAdded: new Date() };
      await axios.post("https://ccc-bsp-server.vercel.app/AddNewFeedback", { ...updatedFeedback })
        .then(result => {
          console.log(result)
          alert('Thank You For Your Valuable Time & Feedback !')
          window.location.reload();
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  const [AllFeedback, setAllFeedback] = useState();

  useEffect(() => {
    axios.get('https://ccc-bsp-server.vercel.app/GetFeedback')
      .then(result => setAllFeedback(result.data))
      .catch(error => console.log(error))
  }, [])

  // const DeleteFeedback = async (id) => {
  //   axios.delete('https://ccc-bsp-server.vercel.app/DeleteFeedback/' + id)
  //     .then(result => {
  //       console.log(result)
  //       window.location.reload();
  //     })
  //     .catch(error => console.log(error))
  // }




  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const AddAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ccc-bsp-server.vercel.app/Register', { username, password })
        .then(result => {
          alert('User Registration Successful')
          console.log(result)
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  const CheckAdmin = async (e) => {
    e.preventDefault();
    axios.post('https://ccc-bsp-server.vercel.app/Login', { username, password })
      .then(result => {
        if (result.data.token) {
          localStorage.setItem('token', result.data.token)
          alert('Login Successful')
          window.location.reload();
        }
        else if (result.data === 'Please Check the Password') {
          alert('Incorrect Password')
        }
        else {
          alert('Error')
        }
      })
      .catch(error => console.log(error))
  }

  const Logout = () => {
    const AskUser = window.confirm("Are you sure?")

    if (AskUser) {
      localStorage.removeItem('token');
      window.location.reload();
    }
  }

  const StaffLogout = () => {
    const AskUser = window.confirm("Are you sure?")
    if (AskUser) {
      localStorage.removeItem('Stafftoken');
      window.location.reload();
    }
  }

  const [Staffusername, setStaffUsername] = useState("");
  const [Staffpassword, setStaffPassword] = useState("");

  const AddStaffUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ccc-bsp-server.vercel.app/StaffRegister', { Staffusername, Staffpassword })
        .then(result => {
          alert('Staff Registration Successful')
          console.log(result)
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  const CheckStaff = async (e) => {
    e.preventDefault();
    axios.post('https://ccc-bsp-server.vercel.app/StaffLogin', { Staffusername, Staffpassword })
      .then(result => {
        if (result.data.token) {
          localStorage.setItem('Stafftoken', result.data.token)
          alert('Login Successful')
          window.location.reload();
        }
        else if (result.data === 'Please Check the Password') {
          alert('Incorrect Password')
        }
        else {
          alert('Error')
        }
      })
      .catch(error => console.log(error))
  }

  return (
    <div className='Admin'>
      <div className='AddNew'>

        {
  /* 
  IsStaffLoggedIn ?
    <button className='btn btn-danger' onClick={StaffLogout}>Staff Logout</button>
    :
    <button type="button" className="btn btn-info" data-bs-toggle="modal" data-bs-target="#StaffLoginModal">
      Staff Login
    </button>
  */
}



        {
          IsLoggedIn ?
            <button type="button" className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#AddStaffUserModal">
              Add Staff User
            </button>
            :
            null
        }
        {
          IsLoggedIn ?
            <button type="button" className="btn btn-Link btn-outline-success" data-bs-toggle="modal" data-bs-target="#RegisterModal">
              New User
            </button>
            :
            null
        }
        {
          IsLoggedIn ?
            <button className='btn btn-Link btn-danger' onClick={Logout}>LogOut</button>
            :
            <button className='btn btn-Link btn-danger' data-bs-toggle="modal" data-bs-target="#LoginModal">Admin Login</button>
        }
      </div>
      <div className='AdminProfile'>
        <div className='AdminDetails'>
          <h1>P.NAGESWAR RAO</h1>
          <h3>Chief Loco Inspector</h3>
          <h3>Bilaspur/SECR</h3>
          <h2>
            Phone no: <a href="tel:9752441439">9752441439</a>
          </h2>
        </div>
        <div className='Image'>
          <img className='PopRight' src={pnr} alt='...' />
        </div>
      </div>


      <div className='AddNew'>

        <button type="button" className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#FeedBackModal">
          Give Feedback !
        </button>

        <div className="modal fade" id="FeedBackModal" tabIndex="-1" aria-labelledby="FeedBackModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={AddNewFeedback}>
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="FeedBackModalLabel">Give Your Valuable Feedback !</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <label>Name</label>
                  <input value={Feedback.Name} onChange={(e) => setFeedBack({ ...Feedback, Name: e.target.value })} placeholder='Your Name ...' />
                  <label>Feedback</label>
                  <input value={Feedback.FeedbackData} onChange={(e) => setFeedBack({ ...Feedback, FeedbackData: e.target.value })} placeholder='Your Feedback ...' />
                </div>
                <div className="modal-footer">
                  <button type='submit' className="btn btn-primary">Send</button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
      <div className='DevelopedBy'>
        <p>Developed By <a href='https://vinayvamsheeresume.vercel.app/' target='_blank' rel="noreferrer">Pechetti Vinay Vamshee</a></p>
      </div>

      <div className='Feedbacks'>
        <p>The content provided on this website is for educational and informational purposes only. It is not intended to be used as evidence or reference in any legal proceedings, police cases, or official matters. Users are advised to consult qualified professionals or trusted sources for any formal or legal requirements.
          <br />
          In case of any problems, issues, or disputes, please contact the admin for assistance
        </p>
        {
          IsLoggedIn ?
            <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFeedback" aria-expanded="false" aria-controls="collapseFeedback">
              Feedbacks
            </button>
            :
            null
        }

        <div>
          <div className="collapse" id="collapseFeedback">
            {
              AllFeedback && AllFeedback.slice().reverse().map((Element, idx) => {
                const date = new Date(Element.TimeAdded);
      
      const isValidDate = !isNaN(date.getTime());
      
      const formattedDate = isValidDate ? date.toLocaleDateString('en-GB') : Element.TimeAdded;
      const formattedTime = isValidDate ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

                return (
                  <div key={idx} className="card card-header">
                    {Element.Name}
                    <div className=' card card-body'>
                      {Element.FeedbackData}
                    </div>
                    <p className='text-end mt-2'>  {formattedDate} {formattedTime} </p>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>




      {/* CheckAdmin */}
      <div className="modal fade" id="LoginModal" tabIndex="-1" aria-labelledby="LoginModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form className='LoginForm' onSubmit={CheckAdmin}>
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="LoginModalLabel">Admin Login</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <input placeholder='Username' value={username} onChange={(event) => setUsername(event.target.value)} type='text' />
                <input placeholder='Password' value={password} onChange={(event) => setPassword(event.target.value)} type='password' />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AddNewAdmin */}
      <div className="modal fade" id="RegisterModal" tabIndex="-1" aria-labelledby="RegisterModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form className='LoginForm' onSubmit={AddAdmin}>
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="RegisterModalLabel">Register</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder='Username' type='text' />
                <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder='Password' type='password' />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Register</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CheckStaff */}
      <div className="modal fade" id="StaffLoginModal" tabIndex="-1" aria-labelledby="StaffLoginModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content LoginForm">
            <form onSubmit={CheckStaff}>
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="StaffLoginModalLabel">Staff Login</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <input value={Staffusername} onChange={(event) => setStaffUsername(event.target.value)} placeholder='Username' type='text' />
                <input value={Staffpassword} onChange={(event) => setStaffPassword(event.target.value)} placeholder='Password' type='password' />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AddStaff */}
      <div className="modal fade" id="AddStaffUserModal" tabIndex="-1" aria-labelledby="AddStaffUserModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content LoginForm">
            <form onSubmit={AddStaffUser}>
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="AddStaffUserModalLabel">Add New Staff</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <input value={Staffusername} onChange={(event) => setStaffUsername(event.target.value)} placeholder='Username' type='text' />
                <input value={Staffpassword} onChange={(event) => setStaffPassword(event.target.value)} placeholder='Password' type='password' />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Add New Staff</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}
