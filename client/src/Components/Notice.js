import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { requestNotificationPermission } from "./firebase"; 
import { getMessaging } from "firebase/messaging";

export default function Notice() {

  useEffect(() => {
    const saveToken = async () => {
      const messaging = getMessaging(); // Assume you have already initialized Firebase in your app
      const vapidKey = "BNTpzJ8zAVvU6dAdqFK-9z3Q6nBktlxymla_K2RchclZcn3xGa7SiblBIRkj2O3UXXnkhNsam-P6q-pFIM0e_Fo"; // Your VAPID key
      const fcmtoken = await requestNotificationPermission(messaging, vapidKey); // Get token from the centralized function
      if (fcmtoken) {
        const userId = "sharedUserAccount"; // Since multiple users share the same account
        await axios.post("https://ccc-bsp-server.vercel.app/save-fcm-token", { userId, fcmToken: fcmtoken });
      }
    };
    saveToken();
  }, []);
  
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

  const [Notice, setNotice] = useState({
    Title: '',
    Description: '',
    Category: '',
    TimeAdded: ''
  })

  const AddNewNotice = async (e) => {
    e.preventDefault();
    try {
      const updatedNotice = { ...Notice, TimeAdded: new Date().toLocaleString() };
      setNotice(updatedNotice);
      await axios.post("https://ccc-bsp-server.vercel.app/AddNewNotice", { ...updatedNotice })
        .then(result => {
          alert('New Notice Added')
          window.location.reload();
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  const [AllNotice, setAllNotice] = useState([]);

  useEffect(() => {
    axios.get('https://ccc-bsp-server.vercel.app/GetNotice')
      .then(result => setAllNotice(result.data))
      .catch(error => console.log(error))
  }, [])

  const DeleteNotice = async (id) => {
    axios.delete('https://ccc-bsp-server.vercel.app/DeleteNotice/' + id)
      .then(result => {
        window.location.reload();
      })
      .catch(error => console.log(error))
  }

  const [NoticeCategory, setNoticeCateogry] = useState({
    Name: ''
  });

  const AddNewNoticeCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://ccc-bsp-server.vercel.app/AddNewNoticeCategory", { ...NoticeCategory })
        .then(result => {
          alert('New Category Added')
          window.location.reload();
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  const [AllNoticeCategory, setAllNoticeCategory] = useState([]);
  useEffect(() => {
    axios.get('https://ccc-bsp-server.vercel.app/GetNoticeCategory')
      .then(result => setAllNoticeCategory(result.data))
  }, [])

  const DeleteNoticeCategory = async (id) => {
    axios.delete('https://ccc-bsp-server.vercel.app/DeleteNoticeCategory/' + id)
      .then(result => {
        window.location.reload();
      })
      .catch()
  }

  const [SearchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (SearchQuery === '') {
      setSearchQuery(e.target.value);
    } else {
      setSearchQuery('');
    }
  };


  return (
    <div className='Notice'>
      <h1 className='Heading'>Notice</h1>

      {/* {
        IsStaffLoggedIn ?
          <> */}

            <div className='Notice-Categories'>
              {
                AllNoticeCategory.map((Element, idx) => {
                  return (
                    <div key={idx} className='Category'>
                      <button  className='btn btn-category' value={Element.Name} onClick={handleSearch}>{Element.Name}</button>
                      {
                        IsLoggedIn ?
                          <button className='btn btn-outline-danger' onClick={() => DeleteNoticeCategory(Element._id)}>Delete</button>
                          :
                          null
                      }
                    </div>
                  )
                })
              }
            </div>
            {
              AllNotice && AllNotice.filter((notice) => (notice.Category !== null && notice.Category !== undefined) && notice.Category.toLowerCase().includes(SearchQuery.toLowerCase())).slice().reverse().map((Element, idx) => {
                const animationDelay = `${idx * 0.1}s`;
                return (
                  <div className='card PopIn' style={{ animationDelay }} key={idx}>
                    <div className='card-head'>
                      <div className='card-title'>{Element.Title}</div>
                      {
                        IsLoggedIn ?
                          <button className='btn btn-sm btn-danger' onClick={() => DeleteNotice(Element._id)}>Delete</button>
                          :
                          null
                      }
                    </div>
                    <div className='card card-body'>
                      {Element.Description}
                    </div>
                    <p className='text-end'>{Element.TimeAdded}</p>
                  </div>
                )
              })
            }


            <div className='AddNew'>
              {
                IsLoggedIn ?
                  <>
                    <button type="button" className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#AddNoticeCategoryModal">
                      Add New Category
                    </button>

                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#AddNoticeModal">
                      Add New Notice
                    </button>
                  </>

                  :
                  null
              }


              <div className="modal fade" id="AddNoticeModal" tabIndex="-1" aria-labelledby="AddNoticeModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={AddNewNotice}>
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="AddNoticeModalLabel">Add New Notice</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <label>Notice Title</label>
                        <input value={Notice.Title} onChange={(e) => setNotice({ ...Notice, Title: e.target.value })} placeholder='Title' />
                        <label>Description</label>
                        <input value={Notice.Description} onChange={(e) => setNotice({ ...Notice, Description: e.target.value })} placeholder='Description' />
                        <label>Category</label>
                        <select onChange={(e) => setNotice({ ...Notice, Category: e.target.value })}>
                          <option value='null'> -- Select --</option>
                          {
                            AllNoticeCategory.map((Element, idx) => {
                              return (
                                <option key={idx} value={Element.Name}>{Element.Name}</option>
                              )
                            })
                          }
                        </select>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Notice</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="modal fade" id="AddNoticeCategoryModal" tabIndex="-1" aria-labelledby="AddNoticeCategoryModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={AddNewNoticeCategory}>
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="AddNoticeCategoryModalLabel">Add New Category</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <label>Category Name</label>
                        <input value={NoticeCategory.Name} onChange={(e) => setNoticeCateogry({ ...NoticeCategory, Name: e.target.value })} placeholder='Category Name' />
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" className="btn btn-primary">Add</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>




            </div>
          {/* </>
          :
          null
      } */}

    </div>
  )
}
