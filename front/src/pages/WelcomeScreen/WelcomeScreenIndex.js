import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom';
import "./welcomecss.min.css"
import { Modal } from 'react-bootstrap';
import { UserAuth } from '../auth/Auth';


function WelcomeScreenIndex() {
    const { Logout, userDetails } = UserAuth();
    const sessionLogout = () => {
        Logout();
        // window.open(window.location.href,"_blank")

    }
    const location = useLocation();
    // ==============================================collapse sidebar and add class to body when on welcome screen
    useEffect(() => {
        if (location.pathname === `/v1/welcome`) {
            document.body.classList.add("sidebar-collapse");
        } else {
            document.body.classList.remove("sidebar-collapse");
        }
        return () => {
            document.body.classList.remove("sidebar-collapse");
        };
    }, [location.pathname]);

    // ==============================================Tour modal
    const [showTourModal, setShowTourModal] = useState(false);
    const tourModalClose = () => setShowTourModal(false);
    const tourModalShow = () => setShowTourModal(true);

    // ==============================================Explore all module


    // const exploreAllModule = () => {
    //     const sidebar = document.querySelector('.sidebar-mini');
    //     if (sidebar) {
    //         const isOpen = sidebar.classList.contains('sidebar-open');
    //         if (isOpen) {
    //             sidebar.classList.remove('sidebar-open', 'option');
    //             sidebar.classList.add('sidebar-closed', 'sidebar-collapse');
    //         } else {
    //             sidebar.classList.remove('sidebar-closed', 'sidebar-collapse');
    //             sidebar.classList.add('sidebar-open');
    //             if (window.innerWidth < 992) {
    //                 sidebar.classList.add('option');
    //             }
    //         }
    //     }
    // };

    const [sidebarOverlay, setSidebarOverlay] = useState(false);

    const exploreAllModule = () => {
        const sidebar = document.querySelector('.sidebar-mini');
        if (sidebar) {
            const isOpen = sidebar.classList.contains('sidebar-open');
            if (isOpen) {
                sidebar.classList.remove('sidebar-open', 'option');
                sidebar.classList.add('sidebar-closed', 'sidebar-collapse');
                setSidebarOverlay(false);
            } else {
                sidebar.classList.remove('sidebar-closed', 'sidebar-collapse');
                sidebar.classList.add('sidebar-open');
                if (window.innerWidth < 992) {
                    sidebar.classList.add('option');
                }
                setSidebarOverlay(true);
            }
        }
    };

    // Hide sidebar and overlay when overlay is clicked
    const handleOverlayClick = () => {
        const sidebar = document.querySelector('.sidebar-mini');
        if (sidebar) {
            sidebar.classList.remove('sidebar-open', 'option');
            sidebar.classList.add('sidebar-closed', 'sidebar-collapse');
        }
        setSidebarOverlay(false);
    };

    // Optionally: Hide overlay if sidebar is closed by other means
    useEffect(() => {
        const handleResizeOrClick = () => {
            const sidebar = document.querySelector('.sidebar-mini');
            if (sidebar && !sidebar.classList.contains('sidebar-open')) {
                setSidebarOverlay(false);
            }
        };
        window.addEventListener('resize', handleResizeOrClick);
        document.addEventListener('mousedown', handleResizeOrClick);
        return () => {
            window.removeEventListener('resize', handleResizeOrClick);
            document.removeEventListener('mousedown', handleResizeOrClick);
        };
    }, []);


    return (
        <>
            {sidebarOverlay && (
                <div
                    id="sidebar-overlay"
                    style={{
                        display: 'block',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.1)',
                        zIndex: 1037
                    }}
                    onClick={handleOverlayClick}
                ></div>
            )}
            <div className=''>
                <div className="welcome-screen">
                    <div className='welcome-header'>
                        <div className='container'>
                            <div className='card welcome-card mb-0 shadow-sm'>
                                <div className='card-body'>
                                    <h1 className='fs-6'>Made in India, Made with Pride
                                        <img src="https://flagcdn.com/in.svg" alt="India Flag" width="25" className='ms-2' />
                                    </h1>
                                    <h2 className='fs-4 fw-bold'>automybizz – Tailored for the <span className='text-teal-dark'>Any Industry</span> 👕✨🚀</h2>
                                    <p className='mb-0 f-s-14'>We are glad to have you here. Explore our features and enjoy your experience.</p>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='welcome-body'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-lg-12'>
                                    <div className='card shadow-none border onboarding-card'>
                                        <div className='card-body d-flex flex-wrap justify-content-between align-items-center gap-2'>
                                            <div className='onboarding-card-clinet-name'>
                                                <h2 className='fs-4 fw-bold'>Welcome <span className='text-primary'>{userDetails.name}!</span></h2>
                                                <p className='mb-0 fw-medium f-s-16'>Great to see you! Start exploring and let the journey begin 🌟</p>
                                            </div>
                                            <div>
                                                <img src={process.env.PUBLIC_URL + "/assets/images/welcome-back.gif"} alt="Welcome Icon" width={150} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='col-lg-6'>
                                    <div className='d-flex flex-wrap gap-2 mb-3'>
                                        <div className='product-tour cursor-pointer' onClick={tourModalShow}>
                                            <div className='product-tour-icon' style={{ fontSize: '40px', lineHeight: '1' }}>
                                                🏰
                                            </div>
                                            <p className='mb-0 fw-medium f-s-14'>Take a Product Tour<i class="fas fa-external-link-alt ms-2"></i></p>
                                        </div>
                                        <div className='product-tour cursor-pointer' onClick={exploreAllModule}>
                                            <div className='product-tour-icon' style={{ fontSize: '40px', lineHeight: '1' }}>
                                                📦
                                            </div>
                                            <p className='mb-0 fw-medium f-s-14'>Explore All Modules<i class="fas fa-external-link-alt ms-2"></i></p>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-6'>
                                    <div className='card shadow-none border billing-card bg-light'>
                                        <div className='card-body d-flex flex-wrap justify-content-between align-items-center gap-2'>
                                            <div className='billing-card-info'>
                                                <h5 className='text-primary'>Billing Information</h5>
                                                <p className='fs-6 fw-medium'>Your Current Plan : <b>Basic Plan</b></p>
                                                <p className='mb-0'>Your plan will expire within</p>
                                                <p className='fs-5 fw-bold mb-0 text-danger'>30 Days</p>
                                            </div>
                                            <div style={{ fontSize: '100px', lineHeight: '1' }}>
                                                🧾
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-12'>
                                    <div className='onboarding-card-tabs'>
                                        <ul className="nav nav-pills mb-2" id="myTab" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link active f-s-14 fw-bold"
                                                    id="home-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#home"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="home"
                                                    aria-selected="true"
                                                >
                                                    Home
                                                </button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link f-s-14 fw-bold"
                                                    id="profile-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#profile"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="profile"
                                                    aria-selected="false"
                                                >
                                                    Profile
                                                </button>
                                            </li>
                                        </ul>
                                        <div className="tab-content">
                                            <div
                                                className="tab-pane active"
                                                id="home"
                                                role="tabpanel"
                                                aria-labelledby="home-tab"
                                            >
                                                <h5>Boost your profits by up to 110% with automybizz 🚀</h5>
                                                <p className='f-s-14'>automybizz empowers your team to perform at their best, leading to measurable increases in both revenue and profit.</p>
                                            </div>
                                            <div
                                                className="tab-pane"
                                                id="profile"
                                                role="tabpanel"
                                                aria-labelledby="profile-tab"
                                            >
                                                <h5>Your data is 100% secure — protected with the same level of encryption trusted by leading email providers. 🔐</h5>
                                                <p className='f-s-14'>All automybizz services and data are hosted on AWS — the trusted name in cloud security, offering PCI DSS certification, SSL encryption, and protection against DDoS attacks.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* <div className='col-lg-12'>
                                    <div className='tour_video_wrapper'>
                                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/s5j35CQhmCk?si=C6-BEBUslXjB_pyz" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                                    </div>
                                </div> */}

                                {/* <div className='card shadow-none border tran-history-card mb-0'>
                                        <div className='card-body'>
                                            <h5 className='text-primary'>📄 Transaction History</h5>
                                            <div className='fixed-table-wrapper'>
                                                <table className="table table-striped fixedTable-head">
                                                    <thead>
                                                        <tr>
                                                            <th className='text-nowrap'>Purchase Plan</th>
                                                            <th className='text-nowrap'>Purchase Date</th>
                                                            <th className='text-nowrap'>Transaction ID</th>
                                                            <th className='text-nowrap'>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                Basic Plan <span className='badge badge-success'>Active plan</span>
                                                            </td>
                                                            <td>01 Jan, 2025</td>
                                                            <td>#GTH0000211550</td>
                                                            <td>
                                                                <span className='text-nowrap'>&#8377; 1000.00</span>
                                                                <button className='btn btn-sm btn-primary'><span className='me-2'>🧾</span>Invoice</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                Basic Plan
                                                            </td>
                                                            <td>01 Jan, 2024</td>
                                                            <td>#GTH0000211550</td>
                                                            <td>
                                                                <span className='text-nowrap'>&#8377; 1000.00</span>
                                                                <button className='btn btn-sm btn-primary'><span className='me-2'>🧾</span>Invoice</button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div> */}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <Modal
                show={showTourModal}
                onHide={tourModalClose}
                backdrop="static"
                keyboard={false}
                centered
                size="xl"
                className="tour_modal"
            >
                <Modal.Header>
                    <Modal.Title>Product Tour</Modal.Title>
                </Modal.Header>
                <button onClick={tourModalClose} className="border-0 close_btn">
                    <i class="fas fa-times f-s-16" close_btn></i>
                </button>
                <Modal.Body>
                    <div className='tour_video_wrapper'>
                    </div>
                </Modal.Body>
            </Modal> */}
        </>
    )
}

export default WelcomeScreenIndex