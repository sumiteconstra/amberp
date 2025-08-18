import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import { Form, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Axios } from '../../environment/AxiosInstance';
import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import "./login.min.css"
import { UserAuth } from './Auth';
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);
  // useEffect(() => {
  //   const storedUsername = localStorage.getItem('username');
  //   const storedPassword = localStorage.getItem('password');
  //   const storedRememberMe = localStorage.getItem('rememberMe') === 'true';

  //   if (storedRememberMe) {
  //     setUsername(storedUsername);
  //     setPassword(storedPassword);
  //     setRememberMe(storedRememberMe);
  //   }
  // }, []);




  const LoginData = (e) => {
    var name = e.target.name;
    setUser({ ...user, [name]: e.target.value })
  }

  const [user, setUser] = useState({ email: '', password: '' });
  const [error, setError] = useState({});
  const { StoreToken } = UserAuth();

  const LoginSubmit = (e) => {
    e.preventDefault();
    Axios.post('user/login', user)
      .then((res) => {
        if (res.status === 200) {
          StoreToken(res.data.token); // StoreToken now handles the token internally
          SuccessMessage(res.data.message)
        }
      })
      .catch((err) => {
        console.log(err);
        const userError = {};
        if (err.response && err.response.data && err.response.data.details) {
          err.response.data.details.forEach((error) => {
            userError[error.context.label] = error.message;
          });
        } else {
          ErrorMessage("Login failed. Please try again.")
        }
        setError(userError);
      });
  };

  return (
    <>
      <div className='login-auth-wrap'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-6 col-md-6 col-sm-12'>
              <div className='loginBox'>
                <div className="logo-wrap">
                  <div>
                    <img
                      src={`${process.env.PUBLIC_URL}/assets/images/AMB-LOGO.png`}
                      className="img-fluid"
                      alt="Automybizz"
                    />
                  </div>
                </div>
                <h1 className='login-title'>
                  Login to account
                </h1>
                <p className='login-subtitle'>Access to the most powerfull tool in the industry.</p>

                <div className='form-wrap'>
                  <form className='w-100' onSubmit={LoginSubmit}>
                    <div className="mb-4">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <div className="input-group-text"><i className="fas fa-user"></i></div>
                        </div>
                        <input type="email" value={user.email} className={error.email ? "form-control is-invalid" : "form-control"} placeholder="Enter email" name='email' required onChange={LoginData} />
                      </div>

                      {error.email ? <span className="field-invalid"><i className="fas fa-triangle-exclamation me-1"></i>{error.email}</span> : ""}
                    </div>

                    <div className="mb-4">
                      <div className="input-group">
                        <div className="input-group-text"><i class="fas fa-lock"></i></div>
                        <input className={error.password ? "form-control border-right-0 is-invalid" : "form-control border-right-0"} value={user.password} type={showPassword ? "text" : "password"} name="password" placeholder="Enter Password" onChange={LoginData} autoComplete="current-password" required id="password" style={{ paddingRight: 20, }} />
                        <div className="input-group-text bg-white">
                          <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} onClick={togglePasswordVisibility} style={{ marginRight: 5, cursor: 'pointer', color: '#777' }} />
                        </div>
                      </div>
                      {error.password ? <span className="field-invalid"><i className="fas fa-triangle-exclamation me-1"></i>{error.password}</span> : ""}

                    </div>

                    <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center">
                      <label className="custom-checkbox mb-0">
                        Remember Password
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                        <span className="checkmark" />
                      </label>
                      <span className="d-inline-block my-2 f-w-medium">
                        <Link to={"/forget-password"} className='text-exp-blue1'>Forgot Password ?</Link>
                      </span>
                    </div>
                    {
                     
                        <button type="submit" name="submit" className="btn btn-exp-primary-dark w-100 f-s-18">Sign In</button>
                    }

                  </form>
                  {/* <h6 className='mt-4 mb-0 text-center text-muted f-w-medium'>
                    Don't have an account yet ? <a href="/register" className='text-exp-blue1'>Create an account</a>
                  </h6> */}
                </div>
                {/* <div className='or-sign my-4'>
                  <span>Or, Sign in with</span>
                </div> */}
                {/* <div className='other-login'>
                  <a href="#" className='other-login-wrap'>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} version="1.1" x="0px" y="0px" viewBox="0 0 48 48" enableBackground="new 0 0 48 48" className="other-login-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>

                    <span className="other-login-name">Google</span>
                  </a>
                  <a href="#" className='other-login-wrap'>
                    <svg stroke="currentColor" fill="#1877f2" strokeWidth={0} viewBox="0 0 256 256" className="other-login-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm12,191.13V156h20a12,12,0,0,0,0-24H140V112a12,12,0,0,1,12-12h16a12,12,0,0,0,0-24H152a36,36,0,0,0-36,36v20H96a12,12,0,0,0,0,24h20v55.13a84,84,0,1,1,24,0Z" /></svg>

                    <span className="other-login-name">Facebook</span>
                  </a>
                  <a href="#" className='other-login-wrap'>
                    <svg stroke="currentColor" fill="#0a66c2" strokeWidth="0" viewBox="0 0 256 256" className="other-login-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M216,20H40A20,20,0,0,0,20,40V216a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V40A20,20,0,0,0,216,20Zm-4,192H44V44H212ZM112,176V120a12,12,0,0,1,21.43-7.41A40,40,0,0,1,192,148v28a12,12,0,0,1-24,0V148a16,16,0,0,0-32,0v28a12,12,0,0,1-24,0ZM96,120v56a12,12,0,0,1-24,0V120a12,12,0,0,1,24,0ZM68,80A16,16,0,1,1,84,96,16,16,0,0,1,68,80Z"></path></svg>

                    <span className="other-login-name">LinkedIn</span>
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>

      </div>

    </ >

  )
}

export default Login