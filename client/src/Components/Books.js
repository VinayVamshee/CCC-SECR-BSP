import React, { useEffect, useState } from 'react'
import axios from 'axios';

export default function Books() {

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

  const [Books, setBooks] = useState({
    Name: '',
    Link: '',
    Category: '',
    ClusterName: '',
    ClusterLink: '',
    TimeAdded: ''
  });

  const [Category, setCateogry] = useState({
    Name: ''
  });

  const AddNewBook = async (e) => {
    e.preventDefault();
    try {
      const updatedBooks = { ...Books, TimeAdded: new Date() };
      setBooks(updatedBooks);
      await axios.post("https://ccc-bsp-server.vercel.app/AddNewBook", { ...updatedBooks })
        .then(result => {
          console.log(result)
          alert('New Book Added')
          window.location.reload();
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  const AddNewCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://ccc-bsp-server.vercel.app/AddNewCategory", { ...Category })
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

  function getPreviewLink(originalLink) {
    if (originalLink.includes('drive.google.com/file')) {
      return originalLink.replace('/view?usp=sharing', '/preview');
    } else if (originalLink.includes('docs.google.com/document')) {
      return originalLink.replace('/edit?usp=sharing', '/preview');
    } else {
      return originalLink;
    }
  }

  const handleLink = (e) => {
    const OriginalLink = e.target.value;
    const PreviewLink = getPreviewLink(OriginalLink);
    setBooks({ ...Books, Link: PreviewLink });
  }

  const handleClusterLink = (e) => {
    const OriginalLink = e.target.value;
    const PreviewLink = getPreviewLink(OriginalLink);
    setBooks({ ...Books, ClusterLink: PreviewLink });
  }

  const [AllBooks, setAllBooks] = useState();
  const [AllCategory, setAllCategory] = useState([]);

  useEffect(() => {
    axios.get('https://ccc-bsp-server.vercel.app/GetBooks')
      .then(result => setAllBooks(result.data))
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    axios.get('https://ccc-bsp-server.vercel.app/GetCategory')
      .then(result => setAllCategory(result.data))
      .catch(error => console.log(error))
  }, [])

  const DeleteBook = async (id) => {
    axios.delete('https://ccc-bsp-server.vercel.app/DeleteBook/' + id)
      .then(result => {
        console.log(result)
        window.location.reload();
      })
      .catch(error => console.log(error))
  }

  const DeleteCategory = async (id) => {
    axios.delete('https://ccc-bsp-server.vercel.app/DeleteCategory/' + id)
      .then(result => {
        console.log(result)
        window.location.reload();
      })
      .catch(error => console.log(error))
  }

  // const ScrolltoCollapse = (targetId) => {
  //   const targetElement = document.getElementById(targetId);

  //   if (targetElement) {
  //     targetElement.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };

  const ClearSearch = () => {
    setSearchQuery('');
  }

  const CategorySearch = (e) => {
    if (SearchQuery === '') {
      setSearchQuery(e.target.value);
    }
    else {
      setSearchQuery('');
    }
  }

  const [SearchQuery, setSearchQuery] = useState('');

  return (
    <div className='Books'>
      <div className='Search'>
        <input value={SearchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder='Search Book ...' />
      </div>

      {/* {
        IsStaffLoggedIn ?
          <> */}
            <div className='Books-Categories'>
              {
                AllCategory.map((Element, idx) => {
                  const collapseId = `collpseSearchCategory${idx}`;
                  return (
                    <div className='Category' key={idx}>
                      <button className="btn btn-category" onClick={ClearSearch} type="button" data-bs-toggle="collapse" data-bs-target={`#${collapseId}`} aria-expanded="false" aria-controls={collapseId}>
                        {Element.Name}
                      </button>
                      {
                        IsLoggedIn ?
                          <button className='btn btn-outline-danger' onClick={() => DeleteCategory(Element._id)}>Delete</button>
                          :
                          null
                      }
                      <div className="collapse" id={collapseId}>
                        <div className="card card-body">
                          {
                            AllBooks && AllBooks.filter((book) => book.Category === Element.Name).slice().reverse().map((CategoryElement, bookIdx) => {
                              return (
                                <div key={bookIdx}>
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
              {
                AllBooks ?
                  AllBooks.filter((book) => book.Name.toLowerCase().includes(SearchQuery.toLowerCase())).slice().reverse().map((Element, idx) => {
                    const collapseId = `collapseSearchSpecific${idx}`;
                    // const ClustercollapseId = `clustercollapseSearchSpecific${idx}`;
                    const animationDelay = `${1 + idx * 0.1}s`;
                    return (
                      <div className='AllBooks PopIn' style={{ animationDelay }} key={idx}>

                        <div className='books-button'>
                          {/* <button className="btn" type="button" data-bs-toggle="collapse" data-bs-target={`#${collapseId}`} aria-expanded="false" aria-controls={collapseId}>
                           {Element.Name}
                        </button> */}
                          <a href={Element.Link} target='_blank' rel="noreferrer">{Element.Name}</a>

                          {/* Cluster */}
                          {/* <button className="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target={`#${ClustercollapseId}`} aria-expanded="false" aria-controls={ClustercollapseId}>
                            {Element.ClusterName}
                           </button> */}

                          <p>
                            {
                              (() => {
                                const date = new Date(Element.TimeAdded);
                                const isValidDate = !isNaN(date.getTime());
                                const formattedDate = isValidDate
                                  ? date.toLocaleDateString('en-GB')
                                  : Element.TimeAdded;
                                const formattedTime = isValidDate
                                  ? date.toLocaleTimeString('en-US', { hour12: true })
                                  : '';
                                return isValidDate ? `${formattedDate}, ${formattedTime}` : Element.TimeAdded;
                              })()
                            }
                          </p>
                          {
                            IsLoggedIn ?
                              <button className='btn btn-danger' onClick={(e) => DeleteBook(Element._id)}>Delete</button>
                              :
                              null
                          }

                        </div>
                        <div className="collapse" id={collapseId}>
                          <div className="card card-body">
                            <iframe title='CollapseFrame' src={Element.Link} width="100%" height="600px" />
                          </div>
                        </div>
                        {/* <div className="collapse" id={ClustercollapseId}>
                             <div className="card card-body">
                          <p>{Element.ClusterName}</p>
                         <iframe title='CollapseFrame' src={Element.ClusterLink} width="100%" height="600px" />
                           </div>
                           </div> */}

                      </div>
                    )
                  })
                  :
                  <div className='AllBooks'>
                    <div className="loading-container">
                      <div className="loader"></div>
                    </div>
                  </div>
              }
            </div>

            <div className='AddNew'>
              {
                IsLoggedIn ?
                  <>
                    <button className='btn btn-warning' data-bs-toggle="modal" data-bs-target="#AddNewBookModal">Add New Book</button>
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#AddNewCategoryModal">
                      Add New Category
                    </button>
                  </>
                  :
                  null
              }


              <div className="modal fade" id="AddNewBookModal" tabIndex="-1" aria-labelledby="AddNewBookModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={AddNewBook}>
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="AddNewBookModalLabel">Add New Book</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <label>Book Name</label>
                        <input type='text' value={Books.Name} onChange={(e) => setBooks({ ...Books, Name: e.target.value })} placeholder='Name' />
                        <label>Drive Link</label>
                        <input type='url' value={Books.Link} onChange={handleLink} placeholder='Drive Link Only ...' />
                        <label>Book Category</label>
                        <select onChange={(event) => setBooks({ ...Books, Category: event.target.value })}>
                          <option value="null"> -- Select --</option>
                          {
                            AllCategory.map((Element, idx) => {
                              return (
                                <option key={idx} value={Element.Name}>{Element.Name}</option>
                              )
                            })
                          }
                        </select>
                        <label>Cluster Name</label>
                        <input type='text' value={Books.ClusterName} onChange={(e) => setBooks({ ...Books, ClusterName: e.target.value })} placeholder='Name' />
                        <label>Cluster Drive Link</label>
                        <input type='url' value={Books.ClusterLink} onChange={handleClusterLink} placeholder='Drive Link Only ...' />
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" className="btn btn-primary">Add</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="modal fade" id="AddNewCategoryModal" tabIndex="-1" aria-labelledby="AddNewCategoryModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={AddNewCategory}>
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="AddNewCategoryModalLabel">Add New Category</h1>
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
