import React, { useEffect, useState } from "react";
import { Form, Link, Navigate, useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Table, Alert, Modal } from "react-bootstrap";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,
  formatDateTimeForMySQL,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import { DropDownList } from "@progress/kendo-react-dropdowns";

function MyNewpurchase() {
  const [total, setTotal] = useState("");
  const calculateTotal = () => {
    let untaxedAmount = 0;
    let totalTaxAmount = 0;

    products.forEach((product) => {
      const qty = parseFloat(product.qty) || 0;
      const unitPrice = parseFloat(product.unit_price) || 0;
      const taxRate = parseFloat(product.tax) || 0;

      const lineSubtotal = qty * unitPrice;
      const lineTax = (lineSubtotal * taxRate) / 100;

      untaxedAmount += lineSubtotal;
      totalTaxAmount += lineTax;
    });

    const sgst = totalTaxAmount / 2;
    const cgst = totalTaxAmount / 2;
    const totalAmount = untaxedAmount + totalTaxAmount;

    return {
      untaxedAmount,
      taxAmount: sgst,
      totalAmount,
    };
  };

  const handleClick = () => {
    ErrorMessage("Please add primary vendor data first.");
  };
  // Set reminder
  const { vendor, userDetails, productData, getGeneralSettingssymbol } = UserAuth();
  const [isCheckedReminder, setIsCheckedReminder] = useState(false);
  const [isFileRequired, setIsFileRequired] = useState(false);
  const [error, setError] = useState({});

  const [show, setShow] = useState(false);

  const [catProduct, setcategory] = useState([
    { value: "select", label: "-Select-" },
  ]);
  const [products, setProducts] = useState([
    {
      product_id: "",
      description: "",
      qty: 1,
      unit_price: 0,
      tax: 18,
      taxExcl: 0,
      vendor_id: "",
    },
  ]);

  const [purchaseName, setPurchaseName] = useState("");
  const [vendorId, setVendor] = useState({
    vendor_id: "",
  });
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  const navigate = useNavigate();
  const [orderDeadline, setOrderDeadline] = useState(null);
  const [vendorReference, setVendorReference] = useState("");

  const [expectedArrival, setExpectedArrival] = useState("");
  const [buyer, setBuyer] = useState(userDetails.name);
  const [sourceDocument, setSourceDocument] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [alert, setAlert] = useState("");

  // const handleProductChange = (index, field, value) => {
  //   const newProducts = [...products];

  //   // Update the field directly
  //   newProducts[index][field] = value;

  //   // Always recalculate regardless of what changed
  //   const qty = parseFloat(newProducts[index].qty) || 0;
  //   const unitPrice = parseFloat(newProducts[index].unit_price) || 0;
  //   const taxRate = parseFloat(newProducts[index].tax) || 0;

  //   const taxExcl = qty * unitPrice;
  //   const taxAmount = (taxExcl * taxRate) / 100;
  //   const taxIncl = taxExcl + taxAmount;

  //   newProducts[index].taxExcl = taxExcl;
  //   newProducts[index].taxAmount = taxAmount;
  //   newProducts[index].taxIncl = taxIncl;
  //   newProducts[index].vendor_id = vendorId.vendor_id;

  //   setProducts(newProducts);
  // };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];

    if (field === "product_id") {
      const selectedProduct = productData.find((p) => p.id === value);
      if (selectedProduct) {
        newProducts[index] = {
          ...newProducts[index],
          product_id: value,
          unit_price: selectedProduct.regular_buying_price || 0,
          tax: selectedProduct.tax || 0,
        
        };
      }
    } else {
      newProducts[index][field] = value;
    }

    const qty = parseFloat(newProducts[index].qty) || 0;
    const unitPrice = parseFloat(newProducts[index].unit_price) || 0;
    const taxRate = parseFloat(newProducts[index].tax) || 0;

    const taxExcl = qty * unitPrice;
    const taxAmount = (taxExcl * taxRate) / 100;
    const taxIncl = taxExcl + taxAmount;

    newProducts[index].taxExcl = taxExcl;
    newProducts[index].taxAmount = taxAmount;
    newProducts[index].taxIncl = taxIncl;
    newProducts[index].vendor_id = vendorId.vendor_id;

    setProducts(newProducts);
  };



  const addProduct = () => {
    setProducts([
      ...products,
      {
        product_id: "",
        description: "",
        qty: 1,
        unit_price: 0,
        tax: 18,
      },
    ]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) {
      setAlert("You cannot delete the last item.");
      return;
    }
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [alert]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();

      const data = {
        purchase_name: purchaseName,
        vendor_id: vendorId.vendor_id,
        vendor_reference: vendorReference,
        order_dateline: formatDateTimeForMySQL(orderDeadline),
        is_parent_id: '0',
        is_parent: '1',
        expected_arrival: formatDateTimeForMySQL(expectedArrival),
        buyer,
        source_document: sourceDocument,
        payment_terms: paymentTerms,
        products,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        TaxAmt: (taxAmount * 2).toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };
      console.log(data);

      const response = await PrivateAxios.post("purchase/add", data);

      if (response.status === 201) {
        SuccessMessage("Data saved successfully");
        navigate("/operation/create-rfq-active");

      } else {

        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [newPurchaseDate, setnewPurchaseDate] = useState({
    startData: "",
    endDate: ""
    //depertment: ""
  })




  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          {/* <Link to="/operation/create-rfq-active" className="text-dark">
            <i class="fas fa-arrow-left me-1" />
            <span class="ms-2 f-s-16">Back</span>
          </Link> */}
          <button
            type="button"
            className="link-btn text-dark"
            onClick={() => navigate(-1)} // Navigate back in history
          >
            <i className="fas fa-arrow-left me-1" />
            <span className="ms-2 f-s-16">Back</span>
          </button>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Requests for New Quotation</h3>
          </div>

          <form onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <div className="custom-select-wrap">
                      <Select
                        name="vendor_name"
                        options={vendor}
                        required
                        getOptionLabel={(option) => option.vendor_name}
                        getOptionValue={(option) => option.id}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                        onChange={(e) =>
                          setVendor({ ...vendorId, vendor_id: e.id })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Order Deadline</label>
                    {/* <input
                    type="datetime-local"
                    value={orderDeadline}
                    onChange={(e) => setOrderDeadline(e.target.value)}
                    required
                    className="form-control"
                  /> */}
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={orderDeadline}
                        onChange={(date) => setOrderDeadline(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select Date and Time"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor Reference</label>
                    <input
                      type="text"
                      value={vendorReference}
                      onChange={(e) => setVendorReference(e.target.value)}
                      placeholder="Vendor Reference"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Expected Arrival</label>
                    {/* <input
                    type="datetime-local"
                    value={expectedArrival}
                    onChange={(e) => setExpectedArrival(e.target.value)}
                    className="form-control"
                  /> */}
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={expectedArrival}
                        onChange={(date) => setExpectedArrival(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select Date and Time"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Buyer</label>
                    <input
                      readOnly
                      value={userDetails.name}
                      onChange={(e) => setBuyer(e.target.value)}
                      placeholder="Buyer"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Source Document</label>
                    <input
                      type="text"
                      value={sourceDocument}
                      onChange={(e) => setSourceDocument(e.target.value)}
                      placeholder="Source Document"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Payment Terms</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Payment Terms"
                      className="form-control"
                    />
                  </div>
                </div>
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                                <div className='form-group'>
                                    <label className='form-label'>Note</label>
                                    <input type="textarea" value={purchaseName} onChange={(e) => setPurchaseName(e.target.value)} placeholder="Note" className="form-control"/>
                                </div>
                            </div> */}

                <div className="col-12 mt-4">
                  <div className="w-100">
                    <ul class="nav nav-tabs gth-tabs" id="myTab" role="tablist">
                      <li class="nav-item" role="presentation">
                        <button
                          class="nav-link active"
                          id="personal-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#personal"
                          type="button"
                          role="tab"
                          aria-controls="personal"
                          aria-selected="true"
                        >
                          Products
                        </button>
                      </li>
                      <li class="nav-item" role="presentation">
                        <button
                          class="nav-link"
                          id="employment-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#employment"
                          type="button"
                          role="tab"
                          aria-controls="employment"
                          aria-selected="false"
                        >
                          Alternative
                        </button>
                      </li>
                    </ul>
                    <div class="tab-content" id="myTabContent">
                      <div
                        class="tab-pane fade show active pt-3"
                        id="personal"
                        role="tabpanel"
                        aria-labelledby="personal-tab">
                        {/* <div className="product_table"> */}
                        {alert && <Alert variant="danger">{alert}</Alert>}
                        <div className="">
                          <Table responsive className="table text-nowrap table-bordered primary-table-head">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Taxes (%)</th>
                                <th>Tax Excl.</th>
                                <th>Tax Amt.</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.map((product, index) => (
                                <tr key={index}>
                                  <td>
                                    <div style={{ minWidth: "200px" }}>
                                      {/* <Select
                                        name="product_id"
                                        value={productData.find(
                                          (p) => p.id === product.product_id
                                        )}
                                        options={productData}
                                        getOptionLabel={(option) =>
                                          option.product_name
                                        }
                                        getOptionValue={(option) => option.id}
                                        theme={(theme) => ({
                                          ...theme,
                                          colors: {
                                            ...theme.colors,
                                            primary25: "#ddddff",
                                            primary: "#6161ff",
                                          },
                                        })}
                                        onChange={(selectedOption) =>
                                          handleProductChange(
                                            index,
                                            "product_id",
                                            selectedOption.id
                                          )
                                        }
                                      /> */}
                                      <DropDownList
                                        className="custom_keno_dropdown"
                                        name="product_id"
                                        data={productData} // Add placeholder to data
                                        value={
                                          productData.find((p) => p.id === product.product_id)
                                        }
                                        textField="product_name"
                                        dataItemKey="id"
                                        onChange={(e) => {
                                          console.log("Selected product ID:", e.value?.id);
                                          const selected = productData.find((p) => p.id === e.value?.id);
                                          console.log("Selected product full object:", selected);
                                          handleProductChange(index, "product_id", e.value?.id || "");
                                        }}
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "200px" }}>
                                      <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Description"
                                        value={product.description}
                                        onChange={(e) =>
                                          handleProductChange(
                                            index,
                                            "description",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "200px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.qty}
                                        onChange={(e) =>
                                          handleProductChange(
                                            index,
                                            "qty",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "200px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.unit_price}
                                        onChange={(e) =>
                                          handleProductChange(
                                            index,
                                            "unit_price",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "150px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.tax}
                                        onChange={(e) =>
                                          handleProductChange(
                                            index,
                                            "tax",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "150px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.unit_price * product.qty}
                                        disabled
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "150px" }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={product.taxAmount?.toFixed(2) || 0}
                                        disabled
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ minWidth: "80px" }}>
                                      <i
                                        class="fas fa-trash-alt text-danger"
                                        onClick={() => removeProduct(index)}
                                        style={{ cursor: "pointer" }}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        {/* </div> */}

                        <button type='button' className="btn btn-outline-primary mt-2 btn-sm" onClick={addProduct}>
                          <i class="fas fa-plus"></i>
                          <span class="ms-2"> Add Product</span>

                        </button>
                        <div className="col-12 text-right">
                          <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">Subtotal : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-1">{getGeneralSettingssymbol}
                              {calculateTotal().untaxedAmount.toFixed(2)}</span></p>
                          <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">SGST : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().taxAmount.toFixed(2)}</span></p>
                          <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">CGST : </span>
                            <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().taxAmount.toFixed(2)}</span></p>
                          <p className="border-top pt-2"><span className="f-s-20 fw-bold text-primary-grey-2">Total : </span>
                            <span className="fw-bold f-s-20 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().totalAmount.toFixed(2)}</span>
                          </p>


                          {/* <p>
                          Untaxed Amount: {getGeneralSettingssymbol}
                          {calculateTotal().untaxedAmount.toFixed(2)}
                        </p>
                        <p>SGST: {getGeneralSettingssymbol}{calculateTotal().taxAmount.toFixed(2)}</p>
                        <p>CGST: {getGeneralSettingssymbol}{calculateTotal().taxAmount.toFixed(2)}</p>
                        <h5 className="mb-4">
                          Total: {getGeneralSettingssymbol}{calculateTotal().totalAmount.toFixed(2)}
                        </h5> */}
                        </div>
                      </div>

                      <div
                        class="tab-pane fade"
                        id="employment"
                        role="tabpanel"
                        aria-labelledby="employment-tab"
                      >
                        <div className="row p-3">
                          <div className="col-12">
                            Create a call for tender by adding alternative requests for
                            quotation to different vendors. Make your choice by
                            selecting the best combination of lead time, OTD and/or
                            total amount. By comparing product lines you can also decide
                            to order some products from one vendor and others from
                            another vendor.
                          </div>
                          <div className="col-12 my-4">
                            <button type="button" class="btn btn-outline-primary btn-sm" onClick={() => setShow(true)}>
                              <i class="fas fa-plus"></i>
                              <span class="ms-2"> Create Alternative</span>

                            </button>

                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                  {/* <div
                    class="tab-pane fade"
                    id="employment"
                    role="tabpanel"
                    aria-labelledby="employment-tab"
                  >
                    <div className="row p-3">
                      <div className="col-6">
                        Create a call for tender by adding alternative requests for
                        quotation to different vendors. Make your choice by
                        selecting the best combination of lead time, OTD and/or
                        total amount. By comparing product lines you can also decide
                        to order some products from one vendor and others from
                        another vendor.
                      </div>
                      <div className="col-6">
                        <button type="button" class="btn btn-exp-green" onClick={() => setShow(true)}>
                          Create Alternative
                        </button>

                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-end">
              <button type="reset" class="btn btn-exp-light me-2">
                Reset
              </button>
              <button type="submit" class="btn btn-success">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        backdrop="static"
        show={show}
        size="md"
        centered
        onHide={() => setShow(false)}
        // dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Add New Alternative Vendor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="moday-body-overflow-none">
          <div className="row">
            <div className="col-12">
              <div className="form-group">
                <label className="form-label">Vendor</label>
                <div className="custom-select-wrap">
                  <Select
                    name="vendor_name"
                    options={vendor}
                    getOptionLabel={(option) => option.vendor_name}
                    getOptionValue={(option) => option.id}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary25: "#ddddff",
                        primary: "#6161ff",
                      },
                    })}
                    onChange={(e) => setVendor({ ...vendorId, vendor_id: e.id })}
                  />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div class=" d-flex justify-content-end pt-3">

                <button type="submit" class="btn btn-success" onClick={handleClick}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

export default MyNewpurchase;
