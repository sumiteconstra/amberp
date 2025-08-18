import React, { useEffect, useState } from "react";

import Select from "react-select";
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  Axios,
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
const EditCustomer = () => {
  const location = useLocation();
  const { data } = location.state || {};
  const { Logout } = UserAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  console.log(data);
  const [formData, setFormData] = useState({
    name: data.name,
    type: data.type,
    address: data.address,
    address2: data.address2,
    sales_person: data.sales_person,
    gstin: data.gstin,
    pan: data.pan,
    phone: data.phone,
    mobile: data.mobile,
    email: data.email,
    zip: data.zip,
    country: data.country,
    state: data.state,
    city: data.city,
    website: data.website,
    account_number: data.bank.account_number,
    bank_name: data.bank.bank_name,
    account_holder: data.bank.account_holder,
    ifsc_code: data.bank.ifsc_code,
    ratings: data?.ratings || "",

  });
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
useEffect(() => {
    Axios
      .get("https://api.first.org/data/v1/countries") // No headers needed
      .then((response) => {
        const rawData = response.data.data;
        const countryOptions = Object.keys(rawData).map((key) => ({
          label: rawData[key].country,
          value: rawData[key].country
        }));
        setCountries(countryOptions);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });
  }, []);

  const [message, setMessage] = useState("");
  const [error, setError] = useState({});

  const getTaskData = async (e, data) => {
    if (e.target) {
      var name = e.target.name;
      setFormData({ ...formData, [name]: e.target.value });
    } else {
      setFormData({ ...formData, [data.name]: e.value });

    }
  };
 const [tags, setTags] = useState(() => {
    try {
      return data && data.tags ? JSON.parse(data.tags) : [];
    } catch (error) {
      console.error('Error parsing tags:', error);
      return [];
    }
  });
  const handleChange = (newTags) => {
    setTags(newTags);
  };

  const fileUpload = async (e) => {
    const file = e.target.files[0];
    let fileSize = file.size;
    if (Number(fileSize) >= 2097152) {
      setError({ file: "This image in getter than 2MB" });
    } else {
      setFormData({ ...formData, file: e.target.files[0] });
      setError("");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let formData1 = await new FormData();
    formData1.append('name', formData.name)
    formData1.append('type', formData.type)
    formData1.append('address', formData.address)
    formData1.append('address2', formData.address2)
    formData1.append('sales_person', formData.sales_person)
    formData1.append('gstin', formData.gstin)
    formData1.append('pan', formData.pan)
    formData1.append('phone', formData.phone)
    formData1.append('mobile', formData.mobile)
    formData1.append('email', formData.email)
    formData1.append('zip', formData.zip)
    formData1.append('country', formData.country)
    formData1.append('state', formData.state)
    formData1.append('city', formData.city)
    formData1.append('website', formData.website)
    formData1.append('account_number', formData.account_number)
    formData1.append('bank_name', formData.bank_name)
    formData1.append('account_holder', formData.account_holder)
    formData1.append('ifsc_code', formData.ifsc_code)
    formData1.append('file', formData.file)
    formData1.append('ratings', formData.ratings);

    const tagsString = JSON.stringify(tags || []);
    formData1.append("tags", tagsString);
    
   
    PrivateAxiosFile.post(`customer/update/${id}`, formData1)
      .then((res) => {
        if (res.status === 200) {
          SuccessMessage("Custometr updated successfully!");
          navigate("/customers");
        }
      })
      // .catch((err) => {
      //   ErrorMessage(
      //     "Error: vendor can only contain alphanumeric characters and spaces."
      //   );
      //   console.error("There was an error!", error);
      // });
  };

  return (
    <React.Fragment>
      <div className="p-4">
      <div className="mb-4">
        <Link to="/customers" className="text-dark ">
          <i class="fas fa-arrow-left me-1"></i>
          <span class="ms-2 f-s-16">Back</span>
        </Link>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Update Customer</h3>
        </div>


        <form action="" onSubmit={handleSubmit} method="post">
          <div className="card-body pb-1">
            <div className="row">
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>GSTIN</label>
                  <input type='text' value={formData.gstin} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='gstin' placeholder='e.g. BE0477472501' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Customer Name</label>
                  <input type='text' value={formData.name} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='name' placeholder='Enter Customer Name' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Vendor Type</label>
                  <div className='custom-select-wrap'>
                    <select class="form-select" value={formData.type} aria-label="Default select example" name='type' onChange={getTaskData} required>
                      <option value="">Select </option>
                      <option value="Individual" >Individual</option>
                      <option value="Company" >Company</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Website</label>
                  <input type='url' value={formData.website} className="form-control" name='website' placeholder='http://www.econstra.com' onChange={getTaskData}  />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Address</label>
                  <input type='text' value={formData.address} className="form-control" name='address' placeholder='Enter Product Code' onChange={getTaskData} required />
                </div>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Address 2</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address2"
                    placeholder="Enter Product Code"
                    onChange={getTaskData}
                    value={formData.address2}

                  />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Country</label>
                  <Select
                    name='country'
                    value={{
                      value: formData.country,
                      label: formData.country,
                    }}
                    options={countries}
                    onChange={getTaskData}
                    placeholder="Select a country"
                  />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>State</label>
                  <input type='text' value={formData.state} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='state' placeholder='Enter state' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>City</label>
                  <input type='text' value={formData.city} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='city' placeholder='Enter city' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Zip</label>
                  <input type='text' value={formData.zip} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='zip' placeholder='Enter zip Code' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Email</label>
                  <input type='email' value={formData.email} className="form-control" name='email' placeholder='Enter your email' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Phone</label>
                  <input type='text' value={formData.phone} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='phone' placeholder='Enter your phone' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Mobile</label>
                  <input type='text' value={formData.mobile} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='mobile' placeholder='Enter your mobile number' onChange={getTaskData} required />
                </div>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Sales Person</label>
                  <div className="custom-select-wrap">
                    <input
                      type="text"
                      value={formData.sales_person}
                      className="form-control"
                      name="sales_person"
                      placeholder="Enter Sales Person Name"
                      onChange={getTaskData}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>PAN</label>
                  <input type='text' value={formData.pan} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='pan' placeholder='e.g. ABCTY1234k' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Bank Account Number</label>
                  <input type='text' value={formData.account_number != null ? formData.account_number : ""} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='account_number' placeholder='e.g. 6345234564539' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Bank Name</label>
                  <input type='text' value={formData.bank_name != '' ? formData.bank_name : ""} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='bank_name' placeholder='e.g. HDFC' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Account Holder</label>
                  <input type='text' value={formData.account_holder != '' ? formData.account_holder : ""} pattern="[A-Za-z0-9 ]*" className="form-control" name='account_holder' placeholder='e.g. Anil Gupta' onChange={getTaskData} required />
                </div>
              </div>
              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>IFSC</label>
                  <input type='text' value={formData.ifsc_code != '' ? formData.ifsc_code : ""} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='ifsc_code' placeholder='e.g. HDFC0000088' onChange={getTaskData} required />
                </div>
              </div>

              <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                <div className='form-group'>
                  <label className='form-label'>Upload File (if any)</label>
                  <input type='file' className='form-control' placeholder='Upload file' accept=".png, .jpg, .jpeg" onChange={fileUpload} />
                </div>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                                <div className="form-group">
                                  <label className="form-label">Items (Press Enter after done)</label>
                                  <TagsInput className="form-label" value={tags} onChange={handleChange} />
                                </div>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                                <div className="form-group">
                                  <label className="form-label">Vendor Score</label>
                                  <input type='number' min={1} max={5} value={formData.ratings != '' ? formData.ratings : ""} className="form-control" name='ratings' placeholder='e.g. 1-5' onChange={getTaskData} />
                                </div>
                              </div>
            </div>
          </div>
          <div class="card-footer d-flex justify-content-end">

            <button type="submit" class="btn btn-exp-green">
              Update
            </button>
          </div>
        </form>
      </div>
      </div>
    </React.Fragment>
  );
};

export default EditCustomer;
