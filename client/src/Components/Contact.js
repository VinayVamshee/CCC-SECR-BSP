import React, { useEffect, useState } from 'react'
import axios from 'axios';

export default function Contact() {

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

    const [contactData, setContactData] = useState({
        CREWID: '',
        'CREW NAME': '',
        FATHER: '',
        GENDER: '',
        TRACTION: '',
        CADRE: '',
        'MOBILE NO': '',
        'CREW TYPE': '',
        'AVAIL DATE': '',
        'EMP CODE': '',
        'APP.DATE': '',
        DOB: ''
    });

    const [EditContact, setEditContact] = useState({
        CREWID: '',
        'CREW NAME': '',
        FATHER: '',
        GENDER: '',
        TRACTION: '',
        CADRE: '',
        'MOBILE NO': '',
        'CREW TYPE': '',
        'AVAIL DATE': '',
        'EMP CODE': '',
        'APP.DATE': '',
        DOB: ''
    });

    const GetContactProfile = async (id) => {
        axios.get('https://ccc-bsp-server.vercel.app/GetContactProfile/' + id)
            .then(result => setEditContact(result.data))
            .catch(error => console.log(error))
    }

    const EditContactProfile = async (id, e) => {
        e.preventDefault();
        try {
            axios.put("https://ccc-bsp-server.vercel.app/EditContactProfile/" + id, { ...EditContact })
                .then(result => {
                    console.log(result)
                    alert('Edited')
                    window.location.reload();
                })
                .catch(error => console.log(error))
        } catch (error) {
            console.log(error);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactData({ ...contactData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('https://ccc-bsp-server.vercel.app/AddNewContact', contactData)
            .then((response) => {
                console.log(response.data);
                alert('New Contact Added');
                window.location.reload();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const [AllContacts, setAllContacts] = useState();

    useEffect(() => {
        axios.get('https://ccc-bsp-server.vercel.app/GetContacts')
            .then(async (result) => {
                // await new Promise(resolve => setTimeout(resolve, 500));
                setAllContacts(result.data)
            })
            .catch(error => console.log(error))
    }, [])

    const DeleteContact = async (id) => {
        const AskUser = window.confirm("Are you sure?")
        if (AskUser) {
            axios.delete('https://ccc-bsp-server.vercel.app/DeleteContact/' + id)
                .then(result => {
                    console.log(result)
                    window.location.reload();
                })
                .catch(error => console.log(error))
        }
    }

    const [SearchQuery, setSearchQuery] = useState('');
    const Keys = ["CREWID", "CREW NAME", "FATHER", "GENDER", "TRACTION", "CADRE", "MOBILE NO", "CREW TYPE", "EMP CODE", "DOB", "APP.DATE"];

    const [SelectedContact, setSelectedContact] = useState({});

    // eslint-disable-next-line
    const OpenContact = (contact) => {
        setSelectedContact(contact);
    }

    const CloseContact = (e) => {
        e.preventDefault();
        setSelectedContact({});
    }

    return (
        <div className='Contact'>
            <div className='Search'>
                <input onChange={(e) => setSearchQuery(e.target.value)} placeholder='Search All ...' />
            </div>

          
                        <div className='Search-results'>
                            <table className="table">
                                <thead className='fixed-header'>
                                    <tr>
                                        <th scope="col"> <label>CREW ID</label></th>
                                        {/* <th scope="col"> <label>EMP Code</label></th> */}
                                        <th scope="col"> <label>CREW NAME</label></th>
                                        <th scope="col"><label>MOBILE NO</label></th>
                                        <th scope="col"><label>CREW TYPE</label></th>
                                        {/* <th scope="col"><label>DETAILS</label></th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        AllContacts ?
                                            AllContacts.filter((contact) => Keys.some((key) => String(contact[key]).toLowerCase().includes(SearchQuery.toLowerCase()))).map((Element, idx) => {
                                                return (
                                                    <tr key={idx} className='PopIn' style={{ animationDelay: `${idx * 0.1}s` }}>
                                                        <th scope="row">{Element["CREWID"]}</th>
                                                        {/* <td>{Element["EMP CODE"]}</td> */}
                                                        <td>{Element["CREW NAME"]}
                                                            {
                                                                IsLoggedIn ?
                                                                    <>
                                                                        <button className='btn btn-outline-danger mx-2' onClick={() => DeleteContact(Element._id)}>Delete</button>
                                                                        <button className='btn btn-outline-primary' onClick={() => GetContactProfile(Element._id)} type="button" data-bs-toggle="modal" data-bs-target="#EditContactModal">Edit</button>
                                                                    </>
                                                                    :
                                                                    null
                                                            }
                                                        </td>
                                                        <td>
                                                            <div className='Call'>
                                                                <a className='btn' href={`tel:${Element["MOBILE NO"]}`}><img src='https://cdn1.iconfinder.com/data/icons/free-98-icons/32/call-512.png' alt='...' /></a>
                                                                {Element["MOBILE NO"]}
                                                            </div>
                                                        </td>
                                                        <td>{Element["CREW TYPE"]}</td>
                                                        {/* <td>
                                                         <button type="button" onClick={() => OpenContact(Element)} className="btn btn-info" data-bs-toggle="modal" data-bs-target="#SelectedContactModal">Profile
                                                         </button>
                                                     </td> */}
                                                    </tr>
                                                )
                                            })
                                            :
                                            <tr>
                                                <td colSpan="4" className="loading-container">
                                                    <div className="loader"></div>
                                                </td>
                                            </tr>
                                    }
                                </tbody>
                            </table>
                        </div>



                        <div className='AddNew'>

                            {
                                IsLoggedIn ?
                                    <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#AddNewContactModal">
                                        Add New Contact
                                    </button>
                                    :
                                    null
                            }

                            <div className="modal fade" id="AddNewContactModal" tabIndex="-1" aria-labelledby="AddNewContactModalLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <form encType="multipart/form-data" onSubmit={handleSubmit}>
                                            <div className="modal-header">
                                                <h1 className="modal-title fs-5" id="AddNewContactModalLabel">New Contact Profile</h1>
                                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div className="modal-body">
                                                <label>CREW ID</label>
                                                <input type="text" name="CREWID" value={contactData.CREWID} onChange={handleInputChange} />

                                                <label>CREW NAME</label>
                                                <input type="text" name="CREW NAME" value={contactData['CREW NAME']} onChange={handleInputChange} />

                                                <label>FATHER</label>
                                                <input type="text" name="FATHER" value={contactData.FATHER} onChange={handleInputChange} />

                                                <label>GENDER</label>
                                                <input type="text" name="GENDER" value={contactData.GENDER} onChange={handleInputChange} />

                                                <label>TRACTION</label>
                                                <input type="text" name="TRACTION" value={contactData.TRACTION} onChange={handleInputChange} />

                                                <label>CADRE</label>
                                                <input type="text" name="CADRE" value={contactData.CADRE} onChange={handleInputChange} />

                                                <label>MOBILE NO</label>
                                                <input type="text" name="MOBILE NO" value={contactData['MOBILE NO']} onChange={handleInputChange} />

                                                <label>CREW TYPE</label>
                                                <input type="text" name="CREW TYPE" value={contactData['CREW TYPE']} onChange={handleInputChange} />

                                                <label>AVAIL DATE</label>
                                                <input type="date" name="AVAIL DATE" value={contactData['AVAIL DATE']} onChange={handleInputChange} />

                                                <label>EMP CODE</label>
                                                <input type="text" name="EMP CODE" value={contactData['EMP CODE']} onChange={handleInputChange} />

                                                <label>APP.DATE</label>
                                                <input type="date" name="APP.DATE" value={contactData['APP.DATE']} onChange={handleInputChange} />
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

                        {
                            SelectedContact && (
                                <div className="modal fade" id="SelectedContactModal" tabIndex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="SelectedContactModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <form>
                                                <div className="modal-header">
                                                    <h1 className="modal-title fs-5" id="SelectedContactModalLabel">Profile</h1>
                                                    <button type="button" onClick={CloseContact} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div className="modal-body">
                                                    <ul>
                                                        {
                                                            Object.entries(SelectedContact).slice(2).map(([Element, value]) => {
                                                                return (
                                                                    <li key={Element}><label>{Element}</label>
                                                                        <p>{typeof value === 'object' ? value.DATE ? new Date(value.DATE).toLocaleDateString() : "Invalid Date" : value}</p>
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                    </ul>
                                                </div>
                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-secondary" onClick={CloseContact} data-bs-dismiss="modal">Close</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        <div className='AddNew'>
                            <div className="modal fade" id="EditContactModal" tabIndex="-1" aria-labelledby="EditContactModalLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <form onSubmit={(e) => EditContactProfile(EditContact._id, e)}>
                                            <div className="modal-header">
                                                <h1 className="modal-title fs-5" id="EditContactModalLabel">Edit Staff</h1>
                                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div className="modal-body AddModal">
                                                <label>Crew ID:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact.CREWID}
                                                    onChange={(event) => setEditContact({ ...EditContact, CREWID: event.target.value })}
                                                />

                                                <label>Crew Name:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact['CREW NAME']}
                                                    onChange={(event) => setEditContact({ ...EditContact, 'CREW NAME': event.target.value })}
                                                />

                                                <label>Father:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact.FATHER}
                                                    onChange={(event) => setEditContact({ ...EditContact, FATHER: event.target.value })}
                                                />

                                                <label>Gender:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact.GENDER}
                                                    onChange={(event) => setEditContact({ ...EditContact, GENDER: event.target.value })}
                                                />

                                                <label> DOB:</label>
                                                <input
                                                    type='date'
                                                    value={EditContact.DOB}
                                                    onChange={(event) => setEditContact({ ...EditContact, DOB: event.target.value })}
                                                />

                                                <label>Traction:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact.TRACTION}
                                                    onChange={(event) => setEditContact({ ...EditContact, TRACTION: event.target.value })}
                                                />

                                                <label>Cadre:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact.CADRE}
                                                    onChange={(event) => setEditContact({ ...EditContact, CADRE: event.target.value })}
                                                />

                                                <label>Mobile Number:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact['MOBILE NO']}
                                                    onChange={(event) => setEditContact({ ...EditContact, 'MOBILE NO': event.target.value })}
                                                />

                                                <label>Crew Type:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact['CREW TYPE']}
                                                    onChange={(event) => setEditContact({ ...EditContact, 'CREW TYPE': event.target.value })}
                                                />

                                                <label>Avail Date:</label>
                                                <input
                                                    type='date'
                                                    value={EditContact['AVAIL DATE']}
                                                    onChange={(event) => setEditContact({ ...EditContact, 'AVAIL DATE': event.target.value })}
                                                />

                                                <label>Employee Code:</label>
                                                <input
                                                    type='text'
                                                    value={EditContact['EMP CODE']}
                                                    onChange={(event) => setEditContact({ ...EditContact, 'EMP CODE': event.target.value })}
                                                />

                                                <label>Application Date:</label>
                                                <input
                                                    type='date'
                                                    value={EditContact['APP.DATE']}
                                                    onChange={(event) => setEditContact({ ...EditContact, 'APP.DATE': event.target.value })}
                                                />


                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                                <button type="submit" className="btn btn-primary">Update</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                   
        </div>
    )
}
