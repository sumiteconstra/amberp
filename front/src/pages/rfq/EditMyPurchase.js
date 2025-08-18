import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Table, Alert, Modal, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
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


function EditMyPurchase() {
  const { id } = useParams();
  const [total, setTotal] = useState("");
  const { vendor, userDetails, productData, getGeneralSettingssymbol } = UserAuth();
  const [selectedOption, setSelectedOption] = useState("");
  const [isCheckedReminder, setIsCheckedReminder] = useState(false);
  const [isFileRequired, setIsFileRequired] = useState(false);
  const [error, setError] = useState({});
  const [alert, setAlert] = useState("");
  const [show, setShow] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [catProduct, setCategory] = useState([
    { value: "select", label: "-Select-" },
  ]);
  const [products, setProducts] = useState([]);
  const [purchaseName, setPurchaseName] = useState("");
  const [vendorId, setVendor] = useState("");
  const [orderDeadline, setOrderDeadline] = useState("");
  const [vendorReference, setVendorReference] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [buyer, setBuyer] = useState(userDetails.name);
  const [sourceDocument, setSourceDocument] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [productsaddi, setProductsaddi] = useState([]);
  const [ProductCompare, setProductCompare] = useState([]);
  const [StatusData, setStatus] = useState("");


  const fetchProducts = async (id, venid) => {
    try {
      const response = await PrivateAxios.get(
        `/purchase/get_addi/${id}/${venid}`
      ); // Adjust the URL to your API endpoint

      if (response.status === 200 && Array.isArray(response.data)) {
        setProductsaddi(response.data);

      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };
  const PriceCompare = async () => {
    try {
      const response = await PrivateAxios.get(
        `/purchase/getPurchasecompare/${id}`
      ); // Adjust the URL to your API endpoint

      if (response.status === 200) {
        setProductCompare(response.data);

      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };


  const handleStatusChange = async (id, sid) => {
    const response = await PrivateAxios.put(`purchase/statuschange/${id}/${sid}`);
    const jsonData = response.data;
    if (response.status == 200) {
      SuccessMessage('Order Confirm Successfully.!');
      setShowPrice(true);
      PriceCompare();
    }

  }
  useEffect(() => {
    PriceCompare()
    const fetchData = async () => {
      try {

        const response = await PrivateAxios.get(`/purchase/purchase/${id}`);
        const data = response.data;


        setVendor({ vendor_id: data.vendor_id });
        setOrderDeadline(data.order_dateline);
        setVendorReference(data.vendor_reference);
        setExpectedArrival(data.expected_arrival);
        setBuyer(data.buyer);
        setSourceDocument(data.source_document);
        setPaymentTerms(data.payment_terms);

        const recalculatedProducts = data.products.map((product) => {
          const qty = parseFloat(product.qty) || 0;
          const unit_price = parseFloat(product.unit_price) || 0;
          const tax = parseFloat(product.tax) || 0;

          const taxExcl = qty * unit_price;
          const taxAmount = (taxExcl * tax) / 100;
          const taxIncl = taxExcl + taxAmount;

          return {
            ...product,
            taxExcl,
            taxAmount,
            taxIncl,
          };
        });
        setProducts(recalculatedProducts);

        setStatus(data.status);
        fetchProducts(data.id, data.vendor_id);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    //console.log(vendorId);
  }, [id]);
  // console.log(orderDeadline);
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
      taxAmount: sgst, // for display and payload
      totalAmount,
    };
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];

    // Handle product change with auto-fill
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

    // Parse updated values
    const qty = parseFloat(newProducts[index].qty) || 0;
    const unit_price = parseFloat(newProducts[index].unit_price) || 0;
    const tax = parseFloat(newProducts[index].tax) || 0;

    // Recalculate tax fields
    const taxExcl = qty * unit_price;
    const taxAmount = (taxExcl * tax) / 100;
    const taxIncl = taxExcl + taxAmount;

    newProducts[index].taxExcl = taxExcl;
    newProducts[index].taxAmount = taxAmount;
    newProducts[index].taxIncl = taxIncl;

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
        vendor_id: vendorId.vendor_id,
        tax: 18,

        taxExcl: 0, // Initialize taxExcl as a number
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
      const updatedProducts = products.map((product) => ({
        ...product,
        vendor_id: vendorId.vendor_id,
      }));
      const data = {
        vendor_id: vendorId.vendor_id,
        vendor_reference: vendorReference,
        order_dateline: orderDeadline,

        expected_arrival: formatDateTimeForMySQL(expectedArrival),
        buyer,
        source_document: sourceDocument,
        payment_terms: paymentTerms,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };


      //console.log(data);

      const response = await PrivateAxios.put(`purchase/update/${id}`, data);

      if (response.status === 200) {
        SuccessMessage("Data Updated.");
        navigate("/operation/create-rfq-active");
      } else {
        console.log(response.status);
        ErrorMessage("Failed to save data");

      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const navigate = useNavigate();
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => ({
        ...product,
        vendor_id: selectedOption.vendor_id_add,
      }));
      const data = {
        vendor_id: selectedOption.vendor_id_add,
        vendor_reference: vendorReference,
        is_parent_id: vendorId.vendor_id,
        is_parent: "0",
        parent_recd_id: id,
        order_dateline: orderDeadline,
        expected_arrival: formatDateTimeForMySQL(expectedArrival),
        buyer,
        source_document: sourceDocument,
        payment_terms: paymentTerms,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };



      const response = await PrivateAxios.post(`purchase/add_addi`, data);

      if (response.status === 201) {
        SuccessMessage("Data Updated Successfully.");
        setShow(false);
        fetchProducts(id, vendorId.vendor_id);

      } else {

        ErrorMessage("Failed to save data");
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const getStatus = (status) => {
    if (status === 1) {
      return 'Active';
    } else if (status === 2) {
      return 'RFQ';
    } else if (status === 3) {
      return 'Send to management';
    } else if (status === 4) {
      return 'Review Confirmed';
    } else if (status === 5) {
      return 'Order Confirm';
    } else if (status === 6) {
      return 'Fully Billed';
    } else if (status === 7) {
      return 'Payment Done';
    }
  };

  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          {/* <Link to="/purchase" className="text-dark">
        <i class="fas fa-arrow-left me-1"></i>
        <span class="ms-2 f-s-16">Back</span>
        </Link> */}
          <button
            type="button"
            className="link-btn text-dark "
            onClick={() => navigate(-1)} // Navigate back in history
          >
            <i className="fas fa-arrow-left me-1" />
            <span className="ms-2 f-s-16">Back</span>
          </button>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Edit Requests for New Quotation</h3>
          </div>

          <form onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor co</label>
                    <div className="custom-select-wrap">
                      <Select
                        name="vendor_name"
                        value={vendor.find((v) => v.id == vendorId.vendor_id)}
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
                        onChange={(e) => setVendor({ vendor_id: e.id })}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Order Deadline </label>
                    {/* <input
                      type="datetime-local"
                      value={
                        orderDeadline != ""
                          ? new Date(orderDeadline).toJSON().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => setOrderDeadline(e.target.value)}
                      required
                      className="form-control"
                    /> */}
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={orderDeadline ? new Date(orderDeadline) : null}
                        onChange={(date) => setOrderDeadline(date ? date.toISOString() : "")}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select Date and Time"
                        className="form-control"
                        required
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
                      value={
                        expectedArrival != ""
                          ? new Date(expectedArrival).toJSON().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => setExpectedArrival(e.target.value)}
                      className="form-control"
                    /> */}
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={expectedArrival ? new Date(expectedArrival) : null}
                        onChange={(date) => setExpectedArrival(date.toISOString())}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select Date and Time"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Buyer</label>
                    <input
                      readOnly
                      value={buyer}
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
              </div>

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
                  <div class="tab-content pt-3" id="myTabContent">
                    <div
                      class="tab-pane fade show active"
                      id="personal"
                      role="tabpanel"
                      aria-labelledby="personal-tab"
                    >
                      {alert && <Alert variant="danger">{alert}</Alert>}
                      <div className="">
                        <Table responsive className="table-bordered primary-table-head">
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
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "product_id",
                                          e.id
                                        )
                                      }
                                    /> */}
                                    <DropDownList
                                      className="custom_keno_dropdown"
                                      name="product_id"
                                      data={productData}
                                      value={productData.find((p) => p.id === product.product_id)}
                                      textField="product_name"
                                      dataItemKey="id"
                                      onChange={(e) =>
                                        handleProductChange(index, "product_id", e.value.id)
                                      }
                                    />
                                  </div>
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="description"
                                    value={product.description}
                                    onChange={(e) =>
                                      handleProductChange(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    name="qty"
                                    value={product.qty}
                                    onChange={(e) =>
                                      handleProductChange(
                                        index,
                                        "qty",
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    name="unit_price"
                                    value={product.unit_price}
                                    onChange={(e) =>
                                      handleProductChange(
                                        index,
                                        "unit_price",
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    name="tax"
                                    value={product.tax}
                                    onChange={(e) =>
                                      handleProductChange(
                                        index,
                                        "tax",
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                </td>
                                <td>{Number(product.taxExcl).toFixed(2) || 0}</td>
                                <td><input
                                  type="number"
                                  className="form-control"
                                  value={Number(product.taxAmount || 0).toFixed(2)}
                                  disabled
                                  onChange={(e) => handleProductChange(index, 'tax', e.target.value)}
                                /></td>

                                <td>
                                  <i
                                    class="fas fa-trash-alt text-danger"
                                    onClick={() => removeProduct(index)}
                                    style={{ cursor: "pointer" }}
                                  ></i>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <button type='button' onClick={addProduct} className="btn btn-outline-primary mt-2 btn-sm">
                        <i class="fas fa-plus"></i>
                        <span class="ms-2"> Add Product</span>
                        {/* Add Product */}
                      </button>
                      <div className="col-12 text-right">

                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">Untaxed Amount : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1">{getGeneralSettingssymbol}
                            {calculateTotal().untaxedAmount.toFixed(2)}</span></p>
                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">SGST : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().taxAmount.toFixed(2)}</span></p>
                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">CGST : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().taxAmount.toFixed(2)}</span></p>
                        <p className="border-top pt-2"><span className="f-s-20 fw-bold text-primary-grey-2">Total : </span>
                          <span className="fw-bold f-s-20 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().totalAmount.toFixed(2)}</span>
                        </p>

                      </div>
                    </div>
                    <div
                      class="tab-pane fade"
                      id="employment"
                      role="tabpanel"
                      aria-labelledby="employment-tab"
                    >
                      <div className="row">
                        <div className="col-12">
                          <div className="d-flex p-3 align-items-start">
                            <div className="alternative-text-area">
                              Create a call for tender by adding alternative requests
                              for quotation to different vendors. Make your choice by
                              selecting the best combination of lead time, OTD and/or
                              total amount. By comparing product lines you can also
                              decide to order some products from one vendor and others
                              from another vendor.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 mb-3">
                          {/* <div className="d-flex "> */}
                          {StatusData < 3 ?
                            <button
                              type="button"
                              class="btn btn-outline-success me-2 text-nowrap btn-sm"
                              onClick={() => setShow(true)}
                            >
                              <i class="fas fa-plus"></i>
                              <span class="ms-2"> Create Alternative </span>

                            </button>
                            : <></>
                          }
                          {productsaddi.length > 0 ? (
                            <button
                              type="button"
                              class="btn btn-exp-red btn-sm text-nowrap"
                              onClick={() => {
                                setShowPrice(true);
                                PriceCompare();
                              }}
                            >
                              Compare Price
                            </button>
                          ) : (
                            <p></p>
                          )}
                          {/* </div> */}
                          {/* </div> */}
                          {/* </div> */}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          {productsaddi.length > 0 ? (
                            <div className=" my-3 alternative">
                              <Table responsive className="table-bordered primary-table-head">
                                {/* <table className="table "> */}
                                <thead>
                                  <tr>
                                    <th>Reference Number</th>
                                    <th>Vendor</th>
                                    <th>Expected Arrival</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productsaddi.map((product) => (
                                    <tr key={product.id}>
                                      <td>
                                        {" "}
                                        <Link to={`/purchase/${product.id}`}>
                                          {product.reference_number}
                                        </Link>
                                      </td>
                                      <td>
                                        {" "}
                                        <Link to={`/purchase/${product.id}`}>
                                          {product.vendor.vendor_name}
                                        </Link>
                                      </td>
                                      <td>
                                        {" "}
                                        <Link to={`/purchase/${product.id}`}>
                                          {new Date(product.expected_arrival)
                                            .toJSON()
                                            .slice(0, 10)}
                                        </Link>
                                      </td>
                                      <td>
                                        {" "}
                                        <Link to={`/purchase/${product.id}`}>
                                          ₹ {product.total_amount}
                                        </Link>
                                      </td>
                                      <td>{getStatus(product.status)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          ) : (
                            <p className="ml-1">
                              <b>No additional vendor found.</b>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
            <div className="card-footer d-flex justify-content-end">
              <button type="submit" className="btn btn-success">
                Save
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
        <Modal.Body>
          <form onSubmit={handleClick}>
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <Select
                    name="vendor_name"
                    required
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
                    onChange={(e) => setSelectedOption({ vendor_id_add: e.id })}
                  />
                </div>
              </div>
              <div className="col-12">
                <div class=" d-flex justify-content-end pt-3">
                  <button type="submit" class="btn btn-exp-green ">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        backdrop="static"
        centered
        size="xl"
        show={showPrice}
        onHide={() => setShowPrice(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Compare Price
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="table-bordered primary-table-head">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Reference</th>
                <th>Status</th>

                <th>Expected Date</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit of Measure</th>
                <th>Unit Price</th>
                <th>Price (Incl tax)</th>
                <th>Total</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ProductCompare.map((productPriceCompare) => (

                <tr className={productPriceCompare.status >= 5 ? 'confirmorder-tr' : ''}>
                  <td>{productPriceCompare.vendor.vendor_name} </td>
                  <td>{productPriceCompare.reference_number}</td>
                  <td>{getStatus(productPriceCompare.status)} </td>
                  <td>
                    {new Date(productPriceCompare.expected_arrival)
                      .toJSON()
                      .slice(0, 10)}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.ProductsItem.product_name}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.qty}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.ProductsItem.unit}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.unit_price}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.taxIncl}</div>
                      </div>
                    ))}
                  </td>
                  <td>{productPriceCompare.total_amount}</td>
                  <td>
                    <div className="d-flex">
                      {productPriceCompare.status >= 4 ? (

                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Choose</Tooltip>}
                        >
                          {productPriceCompare.status >= 5 ? (
                            <button type='button' className="icon-btn me-2">
                              <i class="bi bi-heart-fill 2x text-danger"></i>
                            </button>
                          ) : (
                            <button type='button' className="icon-btn me-2" style={{ cursor: 'pointer' }} onClick={() => handleStatusChange(productPriceCompare.id, 5)}>
                              <i class="bi bi-heart-fill 2x "> </i></button>
                          )}


                        </OverlayTrigger>
                      ) : (
                        <p></p>
                      )
                      }
                      {/* <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Clear</Tooltip>}
                      >
                        <button type='button' className="icon-btn me-2">
                          <i class="bi bi-x-circle-fill"></i>
                        </button>
                      </OverlayTrigger> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

export default EditMyPurchase;
