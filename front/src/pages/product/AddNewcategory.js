import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import { UserAuth } from '../auth/Auth';
import { AllUser, GetTaskPriority, GetTaskRemainder } from '../../environment/GlobalApi';
import "../global.css"
import { PrivateAxios } from '../../environment/AxiosInstance';
//import { useNavigate } from 'react-router-dom';

function AddNewcategory() {
    const navigate = useNavigate();
    // Set reminder
    const { Logout } = UserAuth();
    const [isCheckedReminder, setIsCheckedReminder] = useState(false);
    const [isFileRequired, setIsFileRequired] = useState(false);
    const [error, setError] = useState({});

    const [taskData, setTaskData] = useState({
        "catname": "",

    });

    //const navigate = useNavigate();


    const SubmitData = async (e) => {
        e.preventDefault();
        // let formData = await new FormData();
        // formData.append('catname', taskData)

        PrivateAxios.post("category/add-cat", taskData)
            .then((res) => {

                if (res.status === 200) {
                    SuccessMessage('Product category added!');
                    navigate('/category');
                }
            }).catch((err) => {
                ErrorMessage('Error: Title can only contain alphanumeric characters and spaces.');
                console.error('There was an error!', error);
            })

    }




    return (
        <React.Fragment>
            <div className='p-4'>
                <div className='mb-4'>
                    {/* <Link to="/category" className='text-dark'><i class="fas fa-arrow-left me-1" /><span class="ms-2 f-s-16">Back</span></Link> */}
                    <button
                        type="button"
                        className="link-btn text-dark "
                        onClick={() => navigate(-1)} // Navigate back in history
                    >
                        <i className="fas fa-arrow-left me-1" />
                        <span className="ms-2 f-s-16">Back</span>
                    </button>
                </div>
                <div className='card'>
                    <div className='card-header'>
                        <h3 className="card-title">Add New Category</h3>
                    </div>
                    <form action='' onSubmit={SubmitData} method='post'>
                        <div className='card-body pb-1'>
                            <div className='row'>
                                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                    <div className='form-group'>
                                        <label className='form-label'>Category Name</label>
                                        <input type='text' className="form-control" name='catname' placeholder='Enter Category Name' onChange={(e) => setTaskData({ ...taskData, catname: e.target.value })} />
                                        {error.catname ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.catname}</span> : ""}
                                    </div>

                                </div>


                            </div>
                        </div>
                        <div class="card-footer d-flex justify-content-end">
                            <button type="reset" class="btn btn-exp-light me-2">Reset</button>
                            <button type="submit" class="btn btn-exp-green">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </React.Fragment>
    )
}

export default AddNewcategory;
