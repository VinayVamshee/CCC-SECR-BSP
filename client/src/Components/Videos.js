import React, { useEffect, useState } from 'react'
import axios from 'axios';

export default function Videos() {

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

  const [Videos, setVideos] = useState({
    Name: '',
    Link: '',
    Category: '',
    TimeAdded: ''
  });

  const [Category, setCateogry] = useState({
    Name: ''
  });

  const AddNewVideo = async (e) => {
    e.preventDefault();
    try {
      const updatedVideos = { ...Videos, TimeAdded: new Date() };
      setVideos(updatedVideos);
      await axios.post("https://ccc-bsp-server.vercel.app/AddNewVideo", { ...updatedVideos })
        .then(result => {
          console.log(result)
          alert('New Video Added')
          window.location.reload();
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  const AddNewVideoCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://ccc-bsp-server.vercel.app/AddNewVideoCategory", { ...Category })
        .then(result => {
          console.log(result)
          alert('New Category Added')
          window.location.reload();
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  const [AllVideos, setAllVideos] = useState();
  const [AllVideoCategory, setAllVideoCategory] = useState([]);

  useEffect(() => {
    axios.get('https://ccc-bsp-server.vercel.app/GetVideos')
      .then(result => setAllVideos(result.data))
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    axios.get('https://ccc-bsp-server.vercel.app/GetVideoCategory')
      .then(result => setAllVideoCategory(result.data))
      .catch(error => console.log(error))
  }, [])

  const DeleteVideo = async (id) => {
    axios.delete('https://ccc-bsp-server.vercel.app/DeleteVideo/' + id)
      .then(result => {
        console.log(result)
        window.location.reload();
      })
      .catch(error => console.log(error))
  }

  const DeleteVideoCategory = async (id) => {
    axios.delete('https://ccc-bsp-server.vercel.app/DeleteVideoCategory/' + id)
      .then(result => {
        console.log(result)
        window.location.reload();
      })
      .catch(error => console.log(error))
  }

  function getPreviewLink(originalLink) {
    if (originalLink.includes('drive.google.com/file')) {
      return originalLink.replace('/view?usp=sharing', '/preview');
    } else {
      return originalLink;
    }
  }

  const handleLink = (e) => {
    const OriginalLink = e.target.value;
    const PreviewLink = getPreviewLink(OriginalLink);
    setVideos({ ...Videos, Link: PreviewLink });
  }

  const [SearchQuery, setSearchQuery] = useState('');

  const CategorySearch = (e) => {
    if (SearchQuery === '') {
      setSearchQuery(e.target.value);
    }
    else {
      setSearchQuery('');
    }
  }

  const ClearSearch = (e) => {
    setSearchQuery('');
  }

  return (
    <div className='Videos'>
      <div className='Search'>
        <input value={SearchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder='Search Video ...' />
      </div>
      {/* {
        IsStaffLoggedIn ?
          <> */}
            <div className='Videos-Categories'>
              {
                AllVideoCategory.map((Element, idx) => {
                  const collapseId = `collpseSearchCategory${idx}`;
                  return (
                    <div className='Category' key={idx}>
                      <button className="btn btn-category" onClick={ClearSearch} type="button" data-bs-toggle="collapse" data-bs-target={`#${collapseId}`} aria-expanded="false" aria-controls={collapseId}>
                        {Element.Name}
                      </button>
                      {
                        IsLoggedIn ?
                          <button className='btn btn-outline-danger' onClick={() => DeleteVideoCategory(Element._id)}>Delete</button>
                          :
                          null
                      }

                      <div className="collapse" id={collapseId}>
                        <div className="card card-body">
                          {
                            AllVideos && AllVideos.filter((video) => video.Category === Element.Name).slice().reverse().map((CategoryElement, videoIdx) => {
                              return (
                                <div key={videoIdx}>
                                  <button className='btn' value={CategoryElement.Name} onClick={CategorySearch}>{CategoryElement.Name}</button>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>

            <div className='card card-body'>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                {
                  AllVideos && AllVideos.filter((video) => video.Name.toLowerCase().includes(SearchQuery.toLowerCase())).slice().reverse().map((Element, idx) => {
                    const animationDelay = `${1 + idx * 0.1}s`;
                    const date = new Date(Element.TimeAdded);
                    const isValidDate = !isNaN(date.getTime());
                    const formattedDate = isValidDate
                      ? date.toLocaleDateString('en-GB')
                      : Element.TimeAdded;
                    const formattedTime = isValidDate
                      ? date.toLocaleTimeString('en-US', { hour12: true })
                      : '';
                    return (
                      <div className="col" key={idx}>
                        <div className="card PopRight" style={{ animationDelay }}>
                          <iframe title='Videos' src={Element.Link} width="100%" height="360" alt='...' />
                          <div className="card-body">
                            <p className="card-text">{Element.Name}</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="btn-group">
                                <a href={Element.Link} target='_blank' rel="noreferrer" className="btn btn-sm btn-outline-primary">View</a>
                                {
                                  IsLoggedIn ?
                                    <button className='btn btn-sm btn-outline-danger' onClick={() => DeleteVideo(Element._id)}>Delete</button>
                                    :
                                    null
                                }

                              </div>
                              <small className="text-body-secondary">{formattedDate}, {formattedTime}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            <div className='AddNew'>
              {
                IsLoggedIn ?
                  <>
                    <button className='btn btn-warning' data-bs-toggle="modal" data-bs-target="#AddNewVideoModal">Add New Video</button>
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#AddNewVideoCategoryModal">
                      Add New Category
                    </button>
                  </>
                  :
                  null
              }


              <div className="modal fade" id="AddNewVideoModal" tabIndex="-1" aria-labelledby="AddNewVideoModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={AddNewVideo}>
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="AddNewVideoModalLabel">Add New Video</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <label>Video Name</label>
                        <input type='text' value={Videos.Name} onChange={(e) => setVideos({ ...Videos, Name: e.target.value })} placeholder='Name' />
                        <label>Drive Link</label>
                        <input type='url' value={Videos.Link} onChange={handleLink} placeholder='Drive Link Only ...' />
                        <label>Video Category</label>
                        <select onChange={(event) => setVideos({ ...Videos, Category: event.target.value })}>
                          <option value="null"> -- Select --</option>
                          {
                            AllVideoCategory.map((Element, idx) => {
                              return (
                                <option key={idx} value={Element.Name}>{Element.Name}</option>
                              )
                            })
                          }
                        </select>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" className="btn btn-primary">Add</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="modal fade" id="AddNewVideoCategoryModal" tabIndex="-1" aria-labelledby="AddNewVideoCategoryModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={AddNewVideoCategory}>
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="AddNewVideoCategoryModalLabel">Add New Category</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <label>Category Name</label>
                        <input value={Category.Name} onChange={(e) => setCateogry({ ...Category, Name: e.target.value })} placeholder='Category Name' />
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
