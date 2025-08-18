import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const ReceiveUpdatePageTopBar = () => {
  const location = useLocation();

  return (
    <>
      <div className="gthh-controller-bar">
        <ul className="gth-controller-view-block">
          <li><Link className={`gth-controller-view-item ${location.pathname === "/store/recv_update/request-quotation"

            ? "active" : ""
            } `} to="/store/recv_update/request-quotation">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              data-name="Layer 1"
              viewBox="0 0 24 24"
              width={14}
              height={14}
              fill="currentColor"
              className='me-1'
            >
              <path d="M8,12c3.309,0,6-2.691,6-6S11.309,0,8,0,2,2.691,2,6s2.691,6,6,6Zm14,2.051v-.051c0-2.206-1.794-4-4-4s-4,1.794-4,4v.051c-1.14,.232-2,1.242-2,2.449v3.5c0,2.206,1.794,4,4,4h4c2.206,0,4-1.794,4-4v-3.5c0-1.207-.86-2.217-2-2.449Zm-6-.051c0-1.103,.897-2,2-2s2,.897,2,2h-4Zm-6,6c0,1.538,.586,2.937,1.54,4H2c-1.299,0-2-1.03-2-2,0-4.411,3.589-8,8-8,.883,0,1.729,.149,2.524,.414-.332,.629-.524,1.339-.524,2.086v3.5Z" />
            </svg>

            Order Receive Update</Link></li>



        </ul>
      </div>
    </>
  )
}

export default ReceiveUpdatePageTopBar