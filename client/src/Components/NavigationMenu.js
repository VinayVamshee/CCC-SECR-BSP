import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import HomeIcon from './PNGs/home-icon.png'
import ContactIcon from './PNGs/contact-icon.png'
import NoticeIcon from './PNGs/notice-icon.png'
import GalleryIcon from './PNGs/gallery-icon.png'
import BooksIcon from './PNGs/books-icon.png'
import ThemeIcon from './PNGs/theme-icon.png'

const ThemeStored = () => {
    let Theme = localStorage.getItem('Theme');
    if (Theme) {
        return (
            JSON.parse(localStorage.getItem('Theme'))
        )
    }
    else {
        return [];
    }
}

export default function NavigationMenu() {



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

    const [Theme, setTheme] = useState(ThemeStored);
    const ChangeTheme = () => {
        if (Theme === 'light-theme') {
            setTheme('dark-theme');
        }
        else {
            setTheme('light-theme')
        }
        window.location.reload();
    }

    useEffect(() => {
        localStorage.setItem('Theme', JSON.stringify(Theme))
    }, [Theme]);


    const [OtherDropDown, setOtherDropDown] = useState({
        Name: '',
        Link: ''
    })

    const AddNewOtherDropDown = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://ccc-bsp-server.vercel.app/AddNewOtherDropDown', { ...OtherDropDown })
                .then(result => {
                    console.log(result)
                    alert('Added')
                    window.location.reload();
                })
                .catch(error => console.log(error))
        } catch (error) {
            console.log(error);
        }
    }

    const [AllOtherDropDown, setAllOtherDropDown] = useState([]);

    useEffect(() => {
        axios.get('https://ccc-bsp-server.vercel.app/GetOtherDropDown')
            .then(result => setAllOtherDropDown(result.data))
            .catch(error => console.log(error))
    }, [])

    const DeleteOtherDropDown = async (id) => {
        axios.delete('https://ccc-bsp-server.vercel.app/DeleteOtherDropDown/' + id)
            .then(result => {
                console.log(result)
                window.location.reload();
            })
            .catch(error => console.log(error))
    }

    const [IsToggleCollapseOpen, setIsToggleCollapseOpen] = useState(false);

    const NavigationToggleCollapse = () => {
        setIsToggleCollapseOpen(!IsToggleCollapseOpen);
    }


    return (
        <div className='NavigationMenu'>

            <div className='NavigationToggle'>
                <button className={`btn ${IsToggleCollapseOpen ? 'rotate' : ''}`} onClick={NavigationToggleCollapse} type="button" data-bs-toggle="collapse" data-bs-target="#collapseNavigationToggle" aria-expanded="false" aria-controls="collapseNavigationToggle">
                    <img src='https://i.pinimg.com/originals/26/9d/d1/269dd16fa1f5ff51accd09e7e1602267.png' alt='...' />
                </button>
                <div className="collapse" id="collapseNavigationToggle">
                    <div className=" card-body">
                        <Link to='/' className='btn btn-Link-Toggle'><img src={HomeIcon} alt='...' />Home</Link>
                        <Link to='/Contact' className='btn btn-Link-Toggle'><img src={ContactIcon} alt='...' />Contact</Link>
                        <Link to='/Notice' className='btn btn-Link-Toggle'><img src={NoticeIcon} alt='...' />Notice</Link>
                        <Link to='/Books' className='btn btn-Link-Toggle'><img src={BooksIcon} alt='...' />Books & Circulars</Link>
                        <Link to='/Videos' className='btn btn-Link-Toggle'><img src='https://cdn-icons-png.flaticon.com/512/4404/4404094.png' alt='...' />Technical & Safety Videos</Link>
                        <Link to='/Gallery' className='btn btn-Link-Toggle'><img src={GalleryIcon} alt='...' />Gallery</Link>

                        <div className="dropend">
                            <button className="btn btn-Link-Toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <img src='https://static-00.iconduck.com/assets.00/other-icon-1024x1024-vi0erzei.png' alt='...' />Other
                            </button>

                            <ul className="dropdown-menu">
                                {
                                    AllOtherDropDown && AllOtherDropDown.map((Element, idx) => {
                                        return (
                                            <li className='d-flex my-1' key={idx}><a className="dropdown-item" href={Element.Link} target='_blank' rel="noreferrer">{Element.Name}</a>
                                                {
                                                    IsLoggedIn ?
                                                        <button className='btn btn-outline-danger mx-2' onClick={() => DeleteOtherDropDown(Element._id)}>Delete</button>
                                                        :
                                                        null
                                                }

                                            </li>
                                        )
                                    })
                                }
                                {
                                    IsLoggedIn ?
                                        <li className='AddNew'>
                                            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#AddNewOtherModal">
                                                Add
                                            </button>
                                        </li>
                                        :
                                        null
                                }

                            </ul>
                        </div>

                        <button className='btn btn-Link-Toggle' onClick={ChangeTheme}><img src={ThemeIcon} alt='...' />Theme</button>
                        <Link to='/Admin' className='btn btn-Link-Toggle'><img src='https://cdn-icons-png.flaticon.com/512/560/560199.png' alt='...' />Login</Link>
                    </div>
                </div>
            </div>

            <Link to='/' className='btn btn-Link'><img src={HomeIcon} alt='...' />Home</Link>
            <Link to='/Contact' className='btn btn-Link'><img src={ContactIcon} alt='...' />Staff</Link>
            <Link to='/Notice' className='btn btn-Link'><img src={NoticeIcon} alt='...' />Notice</Link>
            <Link to='/Books' className='btn btn-Link'><img src={BooksIcon} alt='...' />Books & Circulars</Link>
            <Link to='/Videos' className='btn btn-Link'><img src='https://cdn-icons-png.flaticon.com/512/4404/4404094.png' alt='...' />Technical & Safety Videos</Link>
            <Link to='/Gallery' className='btn btn-Link'><img src={GalleryIcon} alt='...' />Gallery</Link>

            <div className="dropdown">
                <button className="btn btn-Link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src='https://static-00.iconduck.com/assets.00/other-icon-1024x1024-vi0erzei.png' alt='...' />Other
                </button>

                <ul className="dropdown-menu">
                    {
                        AllOtherDropDown && AllOtherDropDown.map((Element, idx) => {
                            return (
                                <li className='d-flex my-1' key={idx}><a className="dropdown-item" href={Element.Link} target='_blank' rel="noreferrer">{Element.Name}</a>
                                    {
                                        IsLoggedIn ?
                                            <button className='btn btn-outline-danger mx-2' onClick={() => DeleteOtherDropDown(Element._id)}>Delete</button>
                                            :
                                            null
                                    }

                                </li>
                            )
                        })
                    }
                    {
                        IsLoggedIn ?
                            <li className='AddNew'>
                                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#AddNewOtherModal">
                                    Add
                                </button>
                            </li>
                            :
                            null
                    }

                </ul>
            </div>

            <button className='btn btn-Link' onClick={ChangeTheme}><img src={ThemeIcon} alt='...' />Theme</button>
            <Link to='/Admin' className='btn btn-Link btn-warning'><img src='https://cdn-icons-png.flaticon.com/512/560/560199.png' alt='...' />Login</Link>
            

            <div className="modal fade" id="AddNewOtherModal" tabIndex="-1" aria-labelledby="AddNewOtherModalLabel" aria-hidden="true">
                <div className="modal-dialog AddNew">
                    <div className="modal-content">
                        <form onSubmit={AddNewOtherDropDown}>
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="AddNewOtherModalLabel">Add New Site</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <label>Site Name</label>
                                <input placeholder='Site Name' value={OtherDropDown.Name} onChange={(e) => setOtherDropDown({ ...OtherDropDown, Name: e.target.value })} type='text' />
                                <label>Site URL</label>
                                <input placeholder='Site URL' value={OtherDropDown.Link} onChange={(e) => setOtherDropDown({ ...OtherDropDown, Link: e.target.value })} type='url' />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-primary">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div >
    )
}
