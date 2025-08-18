import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import Loader from "../../../environment/Loader";
import { SuccessMessage, ErrorMessage } from "../../../environment/ToastMessage";
import SettingsInventoryTopBar from "./SettingsInventoryTopBar";

function WarehousesPermission() {
  const [key, setKey] = useState("In-Stock Stores");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [update, setUpdate] = useState(false);
  const [create, setCreate] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [departmentValue, setDepartmentValue] = useState("");
  const [departmentInputValue, setDepartmentInputValue] = useState({
    name: "",
    gstn_type: "",
    gstn_no: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
    state: "",
    pin: "",
    store_type: key,
    is_default: "",
  });
  const [countries, setCountries] = useState([]);


  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("https://countriesnow.space/api/v0.1/countries");
      const data = await response.json();
      setCountries(data.data);
    };
    fetchCountries();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await PrivateAxios.get("warehousesselect");
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const departmentUpdateModelClose = () => {
    setUpdate(false);
    setDepartmentValue("");
  };
  const departmentCreateModelClose = () => {
    setCreate(false);
  };
  const deleteModalClose = () => {
    setDeleteShow(false);
    setDeleteId("");
  };

  const createStore = () => {
    setLoading(true);
    PrivateAxios.post("warehousesadd", departmentInputValue)
      .then((res) => {
        setLoading(false);
        SuccessMessage(res.data.data);
        departmentCreateModelClose();
        fetchData();
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };
  const UpdateDepartment = () => {
    setLoading(true);
    PrivateAxios.put(`warehousesupdate/${departmentValue.id}`, departmentValue)
      .then((res) => {
        const updatedDepartment = data.map((item) =>
          item.id === departmentValue.id
            ? {
              ...item,
              name: departmentValue.name,
              gstn_type: departmentValue.gstn_type,
              gstn_no: departmentValue.gstn_no,
              address1: departmentValue.address1,
              address2: departmentValue.address2,
              city: departmentValue.city,
              country: departmentValue.country,
              state: departmentValue.state,
              pin: departmentValue.pin,
              store_type: key,
              is_default: departmentValue.is_default,
            }
            : item
        );

        setLoading(false);
        SuccessMessage(res.data.data);
        departmentUpdateModelClose();
        fetchData();
      })
      .catch((res) => {
        setLoading(false);
      });
  };
  const deleteDepartment = async () => {
    setLoading(true);
    try {
      const response = await PrivateAxios.delete(
        `warehousesdelete/${deleteId}`
      );

      if (response.status === 200) {
        const updatedData = data.filter((item) => item.id !== deleteId);
        setData(updatedData);
        SuccessMessage(response.data.data);
        deleteModalClose();
      } else if (response.status === 400) {
        deleteModalClose();
        ErrorMessage(
          response.data.error || "Default warehouse cannot be deleted."
        );
      }
    } catch (error) {
      ErrorMessage(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };
  //   const statusChange = (data, e) => {
  //     const newStatus = e.target.checked ? 1 : 0;
  //     setLoading(true);
  //     PrivateAxios.put(`update-department/${data.id}`, {
  //       title: data.title,
  //       status: e.target.checked,
  //     })
  //       .then((res) => {
  //         const updatedDepartment = department.map((item) =>
  //           item.id === data.id ? { ...item, status: newStatus } : item
  //         );

  //         setLoading(false);
  //         SuccessMessage(res.data.data);
  //         departmentUpdateModelClose();
  //       })
  //       .catch((res) => {
  //         setLoading(false);
  //       });
  //};

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <SettingsInventoryTopBar />
          <div className="p-4">
            <div className="card">
              <div className="card-body ">
                <div className="row">
                  <div className="col-md-6 col-sm-6 col-12">
                    <h3 className="card-title">Stores</h3>
                    <p>You can create multiple stores/ warehouses here</p>
                  </div>
                  <div className="col-md-6 col-sm-6 col-12 mb-2">
                    <button
                      onClick={() => setCreate(true)}
                      className="me-2 btn btn-exp-primary btn-sm ms-auto"
                    >
                      <i className="fas fa-plus me-2"></i>
                      New {key}
                    </button>
                  </div>
                </div>

                {/* <div className="card-body"> */}
                <ul
                  className="nav nav-tabs gth-tabs"
                  id="systemControllerFilterTab"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${key === "In-Stock Stores" ? "active" : ""
                        }`}
                      onClick={() => {
                        setKey("In-Stock Stores");
                        setDepartmentInputValue({
                          ...departmentInputValue,
                          store_type: "Rejected Goods Stores",
                        });
                      }}
                      data-bs-toggle="tab"
                      data-bs-target="#systemTaskTodo"
                      type="button"
                      role="tab"
                      aria-controls="systemTaskTodo"
                      aria-selected={key === "In-Stock Stores"}
                    >
                      <span className="btn-todo">In-Stock Stores</span>
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${key === "Rejected Goods Stores" ? "active" : ""
                        }`}
                      onClick={() => {
                        setKey("Rejected Goods Stores");
                        setDepartmentInputValue({
                          ...departmentInputValue,
                          store_type: "Rejected Goods Stores",
                        });
                      }}
                      data-bs-toggle="tab"
                      data-bs-target="#systemTaskInProgress"
                      type="button"
                      role="tab"
                      aria-controls="systemTaskInProgress"
                      aria-selected={key === "Rejected Goods Stores"}
                    >
                      <span className="btn-inprogress">
                        Rejected Goods Stores
                      </span>
                    </button>
                  </li>
                </ul>

                <div className="tab-content pt-0">
                  <div
                    className={`tab-pane ${key === "In-Stock Stores" ? "active" : ""
                      }`}
                    id="systemTaskTodo"
                    role="tabpanel"
                  >
                    {key == "In-Stock Stores" && (
                      <div className="px-0 pt-3">
                        <div className="row">
                          {Array.isArray(data) &&
                            data
                              .filter(
                                (item) => item.store_type === "In-Stock Stores"
                              )
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="col-lg-4 col-md-6 col-12"
                                >
                                  <div
                                    className={`rounded-10 border ${item.is_default == 1
                                      ? "gth-bg-success-light"
                                      : ""
                                      } mb-3`}
                                  >
                                    <div className="p-3">
                                      <div className="d-flex align-items-center">
                                        <h5 className="my-1 fs-6">{item.name}</h5>
                                        <Dropdown align="end" className="ms-auto">
                                          <Dropdown.Toggle
                                            className="scal-threedot-dropdown"
                                            variant="unset"
                                          >
                                            <i className="fas fa-ellipsis-v"></i>
                                          </Dropdown.Toggle>
                                          <Dropdown.Menu className="">
                                            <Dropdown.Item
                                              onClick={() => {
                                                setDepartmentValue(item);
                                                setUpdate(true);
                                              }}
                                            >
                                              {" "}
                                              Edit
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                              onClick={() => {
                                                setDeleteShow(true);
                                                setDeleteId(item.id);
                                              }}
                                            >
                                              {" "}
                                              Delete{" "}
                                            </Dropdown.Item>
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      </div>
                                      <div className="store-address">
                                        <div className="px-2 f-s-14 text-muted">
                                          {item.address1}
                                        </div>
                                        <div className="px-2 f-s-14 text-muted">
                                          {item.address2}
                                        </div>
                                        <div className="px-2 f-s-14 text-muted">
                                          {item.city}
                                        </div>
                                        <div className="px-2 f-s-14 text-muted">
                                          {item.country}
                                        </div>
                                        <div className="px-2 f-s-14 text-muted">
                                          {item.state}
                                        </div>
                                        <div className="px-2 f-s-14 text-muted">
                                          {item.pin}
                                        </div>
                                        <div className="p-2 f-s-14 text-muted">
                                          <b>GSTIN</b> - {item.gstn_no}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className={`tab-pane ${key === "Rejected Goods Stores" ? "active" : ""
                      }`}
                    id="systemTaskInProgress"
                    role="tabpanel"
                  >
                    {key == "Rejected Goods Stores" && (
                      <div className="px-0 pt-3">
                        <div className="row">
                          {data && key === "Rejected Goods Stores" && (
                            <div className="">
                              <div className="row">
                                {Array.isArray(data) &&
                                  data
                                    .filter(
                                      (item) =>
                                        item.store_type ===
                                        "Rejected Goods Stores"
                                    )
                                    .map((item) => (
                                      <div
                                        key={item.id}
                                        className="col-lg-4 col-md-6 col-12"
                                      >
                                        <div
                                          className={`rounded-10 border ${item.is_default == 1
                                            ? "gth-bg-success-light"
                                            : ""
                                            } mb-3`}
                                        >
                                          <div className="p-3">
                                            <div className="d-flex align-items-center">
                                              <h5 className="my-1 fs-6">
                                                {item.name}
                                              </h5>
                                              <Dropdown
                                                align="end"
                                                className="ms-auto"
                                              >
                                                <Dropdown.Toggle
                                                  className="scal-threedot-dropdown"
                                                  variant="unset"
                                                >
                                                  <i className="fas fa-ellipsis-v"></i>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="">
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      setDepartmentValue(item);
                                                      setUpdate(true);
                                                    }}
                                                  >
                                                    {" "}
                                                    Edit
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      setDeleteShow(true);
                                                      setDeleteId(item.id);
                                                    }}
                                                  >
                                                    {" "}
                                                    Delete{" "}
                                                  </Dropdown.Item>
                                                </Dropdown.Menu>
                                              </Dropdown>
                                            </div>
                                            <div className="store-address">
                                              <div className="px-2 f-s-14 text-muted">
                                                {item.address1}
                                              </div>
                                              <div className="px-2 f-s-14 text-muted">
                                                {item.address2}
                                              </div>
                                              <div className="px-2 f-s-14 text-muted">
                                                {item.city}
                                              </div>
                                              <div className="px-2 f-s-14 text-muted">
                                                {item.country}
                                              </div>
                                              <div className="px-2 f-s-14 text-muted">
                                                {item.state}
                                              </div>
                                              <div className="px-2 f-s-14 text-muted">
                                                {item.pin}
                                              </div>
                                              <div className="p-2 f-s-14 text-muted">
                                                <b>GSTIN</b> - {item.gstn_no}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* </div> */}
              </div>
            </div>
          </div>
        </>
      )}
      {/* create Department */}
      <Modal
        backdrop="static"
        show={create}
        onHide={departmentCreateModelClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{key}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter title"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">GSTIN Type</label>
              <Form.Select
                required
                aria-label="Default select example"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    gstn_type: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="Regular">Regular</option>
                <option value="Unregistered">Unregistered</option>
                <option value="Composition">Composition</option>
                <option value="Consumer">Consumer</option>
                <option value="Unknown">Unknown</option>
              </Form.Select>
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter GSTIN"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    gstn_no: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Address 1</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Address 1"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    address1: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Address 2</label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Address 2"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    address2: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">City </label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter City"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    city: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Country </label>
              <select
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    country: e.target.value,
                  })
                }
                className="form-control"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.country} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">State </label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter State"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    state: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Pin </label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Pin"
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    pin: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <input
                type="checkbox"
                value={1}
                onChange={(e) =>
                  setDepartmentInputValue({
                    ...departmentInputValue,
                    is_default: e.target.value,
                  })
                }
              />{" "}
              <label className="form-label">Mark As Default</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type='reset'
            variant="secondary"
            className="btn-sm"
            onClick={departmentCreateModelClose}
          >
            Close
          </Button>
          <Button type='submit' variant="primary" className="btn-sm" onClick={createStore}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update department */}
      <Modal show={update} onHide={departmentUpdateModelClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update {key}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className={`form-control`}
                value={departmentValue.name}
                placeholder="Enter title"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    name: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">GSTIN Type</label>
              <Form.Select
                aria-label="Default select example"
                value={departmentValue.gstn_type}
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    gstn_type: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="Regular">Regular</option>
                <option value="Unregistered">Unregistered</option>
                <option value="Composition">Composition</option>
                <option value="Consumer">Consumer</option>
                <option value="Unknown">Unknown</option>
              </Form.Select>
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                value={departmentValue.gstn_no}
                className={`form-control`}
                placeholder="Enter GSTIN"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    gstn_no: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Address 1</label>
              <input
                type="text"
                value={departmentValue.address1}
                className={`form-control`}
                placeholder="Enter Address 1"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    address1: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Address 2</label>
              <input
                type="text"
                className={`form-control`}
                value={departmentValue.address2}
                placeholder="Enter Address 2"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    address2: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">City </label>
              <input
                type="text"
                value={departmentValue.city}
                className={`form-control`}
                placeholder="Enter City"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    city: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Country </label>
              <select
                value={departmentValue.country}
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    country: e.target.value,
                  })
                }
                className="form-control"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.country} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">State </label>
              <input
                type="text"
                value={departmentValue.state}
                className={`form-control`}
                placeholder="Enter State"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    state: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">Pin </label>
              <input
                type="text"
                value={departmentValue.pin}
                className={`form-control`}
                placeholder="Enter Pin"
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    pin: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="col-12">

            <div className="form-group">
              <input
                type="checkbox"
                checked={departmentValue.is_default == 1}
                value={1}
                onChange={(e) =>
                  setDepartmentValue({
                    ...departmentValue,
                    is_default: e.target.value,
                  })
                }
              />{" "}
              <label className="form-label">Mark As Default</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="btn-sm"
            onClick={departmentUpdateModelClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            className="btn-sm"
            onClick={UpdateDepartment}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete department */}
      <Modal
        show={deleteShow}
        onHide={deleteModalClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="delete-confirm-wrap text-center">
            <div className="delete-confirm-icon mb-3 mt-2">
              <img
                src={
                  process.env.PUBLIC_URL + "/assets/images/delete-warning.svg"
                }
                alt="Warning"
                className="img-fluid"
              />
            </div>
            <h4 className="text-muted">Are you sure?</h4>
            <p className="text-muted">
              Do you really want to delete these record?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type='reset'
            className="btn btn-secondary btn-sm"
            onClick={deleteModalClose}
          >
            Cancel
          </button>
          <button type='submit' className="btn btn-exp-red btn-sm" onClick={deleteDepartment}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default WarehousesPermission;
