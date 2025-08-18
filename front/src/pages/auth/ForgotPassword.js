import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Axios } from '../../environment/AxiosInstance'
import { ErrorMessage } from '../../environment/ToastMessage'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const Submit = (e) => {
    e.preventDefault();
    if (email) {
      Axios.post('user/forget-password', { email: email })
        .then((res) => {
          navigate("/otp", { state: res.data.data })
        }).catch((err) => {
          ErrorMessage(err.response?.data.msg)
        })

    } else {
      ErrorMessage("Required field is missing")
    }
  }
  //dark theme image change
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Check for the theme on initial load
    const currentTheme = document.body.classList.contains("dark-theme");
    setIsDarkTheme(currentTheme);

    // Listen for changes to the body's class (if toggling happens outside this component)
    const observer = new MutationObserver(() => {
      const updatedTheme = document.body.classList.contains("dark-theme");
      setIsDarkTheme(updatedTheme);
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);
  //dark theme image change end

  return (
    <div className='login-auth-wrap'>
      <div className='container'>
        <div className='row justify-content-evenly align-items-center'>
          <div className='col-lg-5 col-md-6 col-sm-12'>
            <div className='loginBox'>
              <div className="logo-wrap">
                {/* <a href="/"><img src={process.env.PUBLIC_URL + 'assets/images/AMB-LOGO.png'} alt="Automybizz" className='img-fluid' /></a> */}
                <div>
                  <img
                    src={
                      isDarkTheme
                        ? `${process.env.PUBLIC_URL}/assets/images/AMB-LOGO-white.png`
                        : `${process.env.PUBLIC_URL}/assets/images/AMB-LOGO.png`
                    }
                    className="img-fluid"
                    alt="Automybizz"
                  />
                </div>
              </div>
              <h1 className='login-title'>
                Reset password!
              </h1>
              <div className='form-wrap mt-4'>
                <form className='w-100' onSubmit={Submit}>
                  <div className="input-group mb-4">
                    <div className="input-group-prepend">
                      <div className="input-group-text"><i class="fas fa-envelope"></i></div>
                    </div>
                    <input type="email" required className="form-control" value={email} placeholder="Enter Your Email" onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <button type="submit" name="submit" className="btn btn-exp-primary-dark w-100 f-s-18">Reset Password</button>
                </form>
                <h6 className='mt-4 mb-0 text-center text-muted f-w-medium'>
                  Don’t want to reset ? <Link to="/login" className='text-exp-blue1'>Sign In</Link>
                </h6>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>

  )
}

export default ForgotPassword