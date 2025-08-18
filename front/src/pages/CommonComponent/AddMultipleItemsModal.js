import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { PrivateAxiosFile } from "../../environment/AxiosInstance";
import { SuccessMessage } from "../../environment/ToastMessage";

const AddMultipleItemsModal = ({ show, onClose, FetchProduct }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setIsLoading(true);

    if (!file) {
      alert("Please select a file first!");
      setIsLoading(false);
      return;
    }

    const validFileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validFileTypes.includes(file.type)) {
      alert("Please upload a valid Excel file.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await PrivateAxiosFile.post(
        "/product/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      SuccessMessage("Products uploaded successfully.");
      FetchProduct();
      onClose();

      //navigate("/products"); // Redirect to products page
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Upload failed. Please try again.";
      alert(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
      size="xl"
      id="AddMultipleItemsModal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Items (Multiple)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-12">
            <div className="form-group pt-0">
              <p>The first row of your excel will be considered as headers</p>
              <div className="position-relative">
                <div className="sample_data_badge">Sample Data</div>
                <div className="table-responsive">

                  <table class="table table-bordered primary-table-head">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Product/Service</th>
                        <th>Item Type (Buy/Sell/Both)</th>
                        <th>Unit of Measurement</th>
                        <th>HSN Code</th>
                        <th>Category</th>
                        <th>Default Price, Regular</th>
                        <th>Buying Price Wholesale</th>
                        <th>Buying Price Regular</th>
                        <th>Selling Price</th>
                        <th>MRP</th>
                        <th>Dealer Price</th>
                        <th>Distributor Price</th>
                        <th>Current Stock</th>
                        <th>Min Stock Level</th>
                        <th>Max Stock Level</th>
                        <th>Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Raw Material 1</td>
                        <td>Product</td>
                        <td>Buy</td>
                        <td>Kg</td>
                        <td>4040</td>
                        <td>100</td>
                        <td>150</td>
                        <td>150</td>
                        <td>150</td>
                        <td>150</td>
                        <td>150</td>
                        <td>150</td>
                        <td>2000</td>
                        <td>1000</td>
                        <td>3000</td>
                        <td>4000</td>
                        <td>12</td>
                      </tr>
                      <tr>
                        <td>Finished Good 1</td>
                        <td>Product</td>
                        <td>Sell</td>
                        <td>Kg</td>
                        <td>8030</td>
                        <td>300</td>
                        <td>150</td>
                        <td>150</td>
                        <td>150</td>
                        <td>150</td>
                        <td>150</td>
                        <td>150</td>
                        <td>3000</td>
                        <td>2000</td>
                        <td>4000</td>
                        <td>4000</td>
                        <td>18</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p>
                Note: This is a sample table. automybizz item master has 11 columns
                and you can add more!
              </p>
            </div>
            <hr />
          </div>
          <div className="col-lg-6">
            <div className="form-group">
              <label className="form-label">Upload Excel</label>
              <div className="custom-select-wrap">
                <input
                  type="file"
                  required
                  className="form-control"
                  accept=".xlsx, .csv"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="form-group mb-0 pt-0">
              <div className="d-flex align-items-center gap-3 uploadView mb-3">
                <div className="file">
                  <i className="far fa-file-excel e_file"></i>
                </div>
                <div className="d-flex align-items-center gap-3 w-100">
                  <p className="mb-0 f-s-16 fw-bold">Export (22).xlsx</p>
                  <button className="btn ms-auto fit-btn p-1" type="button">
                    <i className="fas fa-times f-s-16"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <h5>
              Upload your own excel file in{" "}
              <span className="text-success">easy steps!</span>
            </h5>
            <p className="mb-0 f-s-15 text-muted">Points to remember:</p>
            <ol className="f-s-15 text-muted">
              <li>No merged cells or conditional formatting</li>
              <li>Maximum number of rows allowed: 500</li>
              <li>File format should be .xlsx (max size: 10 MB)</li>
            </ol>
            <div className="gth-bg-warning-light p-3 rounded f-s-15">
              <i className="fas fa-info-circle me-2"></i>Need a reference?{" "}
              <Link to="http://localhost:5000/api/Product_Add.xlsx">Download our excel template</Link> for a seamless
              experience.
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose} type="button">
          Cancel
        </button>

        <button
          className="btn btn-success"
          onClick={handleUpload}
          disabled={!file || isLoading}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddMultipleItemsModal;
