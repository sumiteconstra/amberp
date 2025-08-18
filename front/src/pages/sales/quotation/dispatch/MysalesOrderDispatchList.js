import React, { useEffect, useState } from "react";

import "react-datepicker/dist/react-datepicker.css";

import "jspdf-autotable";

import { Link } from "react-router-dom";
import { Dropdown, Modal, OverlayTrigger } from "react-bootstrap";
import "./mysalesorderdispatch.css";
import "handsontable/dist/handsontable.full.min.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
  url,
} from "../../../../environment/AxiosInstance";
import { UserAuth } from "../../../auth/Auth";
import { Button, Table } from "react-bootstrap";

import moment from "moment";
import {
  ErrorMessage,
  SuccessMessage,
} from "../../../../environment/ToastMessage";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";
import SalesQuotationPageTopBar from "../SalesQuotationPageTopBar";
import PoUpdateStatusBar from "../poUpdate/PoUpdateStatusBar";
import CustomerDispatchModal from "./CustomerDispatchModal";
import Loader from "../../../../environment/Loader";

function MysalesOrderDispatchList() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } =
    UserAuth();
  //for-data table
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDispatchItem, setSelectedDispatchItem] = useState(null);
  const [dispatchType, setDispatchType] = useState(""); // "stock" or "customer"
  const [lgShow, setLgShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState([]);

  const handleOpenConfirmModal = (item, type) => {
    setSelectedDispatchItem(item);
    setDispatchType(type);
    setShowConfirmModal(true);
  };


  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedDispatchItem(null);
    setDispatchType("");
  };



  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });

  const fetchWorkOrders = async () => {
    try {
      const response = await PrivateAxios.get("sales/production/allworkorderdispatch");

      console.log("Response from work orders:", response.data);

      const filteredData = response.data.filter(
        (order) => order.is_deleted !== 1 &&
          (order.production_status === 5 || order.production_status === 0) &&
          (order.is_dispatched === false || order.is_dispatched === 0) && (order.is_invoice === false || order.is_invoice === 0)

      );

      const transformedData = filteredData.map((item, index) => ({
        id: item.id,
        slNo: index + 1,

        production_number: item.production_number || "N/A",
        reference: item.purchase?.reference_number || "-",
        customer: item.purchase?.customer?.name || "N/A",
        createdBy: item.purchase?.createdByUser?.name || "N/A",
        product_name: item.ProductsItem?.product_name || "N/A",
        product_code: item.ProductsItem?.product_code || "-",
        product_id: item?.product_id || "N/A",
        qty: item.qty,
        unit_price: getGeneralSettingssymbol + Number(item.unit_price).toFixed(2),
        total_tax_incl: getGeneralSettingssymbol + Number(item.taxIncl).toFixed(2),
        unit: item.ProductsItem?.Masteruom?.unit_name || "-",
        created_at: moment(item.created_at).format("DD-MM-YYYY"),
        has_mixed_status: item.has_mixed_status || false,
      }));


      setData(transformedData);
    } catch (error) {
      console.error("Error fetching work orders:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWorkOrders();
  }, []);




  const pdfExportRef = React.createRef();
  const excelExportRef = React.createRef();

  const handleExportPDF = () => {
    if (pdfExportRef.current) {
      pdfExportRef.current.save();
    }
  };

  const handleExportExcel = () => {
    if (excelExportRef.current) {
      excelExportRef.current.save();
    }
  };

  const ActionCell = (props) => {
    const { dataItem } = props;



    const handleOpenStatusModal = async (salesId) => {
      try {
        const res = await PrivateAxios.get(`/sales/getproductsbypurchase/${salesId}`);
        console.log(salesId, "salesId");

        if (res.status === 200) {
          setStatusModalData(res.data); // Set the product list
          setShowStatusModal(true);     // Show the modal
        }
      } catch (error) {
        console.error("Failed to fetch product status list", error);
      }
    };


    return (
      <td>

        <div className="d-flex gap-2">
          <Tooltip title="Dispatch to Stock">
            <button
              onClick={() => handleOpenConfirmModal(dataItem, "stock")}
              className="me-1 icon-btn"

            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={18}
                height={18}
                fill="currentColor"
              >
                <path d="m1,2.5C1,1.119,2.119,0,3.5,0s2.5,1.119,2.5,2.5-1.119,2.5-2.5,2.5S1,3.881,1,2.5Zm.5,16c-.829,0-1.5.672-1.5,1.5v2.5c0,.828.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-2.5c0-.828-.671-1.5-1.5-1.5Zm22.461-.457c-.187-.808-.992-1.311-1.8-1.122l-6.813,1.579-2.86-12.339c-.187-.808-.993-1.311-1.8-1.122-.807.187-1.31.993-1.123,1.8l.733,3.161h-1.966l-1.325-2.121c-.736-1.177-2.004-1.879-3.392-1.879h-.614c-1.654,0-3,1.346-3,3v4.085c0,1.396.744,2.71,1.942,3.43l3.058,1.835v4.15c0,.828.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-4.434c0-.873-.465-1.695-1.213-2.144l-1.787-1.072v-4.52l.935,1.497c.461.734,1.253,1.173,2.119,1.173h2.939l1.446,6.236c-.85.399-1.439,1.262-1.439,2.264,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.024-.001-.048-.002-.072l6.841-1.586c.807-.187,1.31-.992,1.123-1.8Zm-7.531-3.408c.201.859,1.062,1.391,1.92,1.187l2.907-.691c.854-.203,1.383-1.059,1.183-1.914l-.7-2.986c-.201-.859-1.062-1.391-1.92-1.187l-2.907.691c-.854.203-1.383,1.059-1.183,1.914l.7,2.986Z" />
              </svg>
            </button>
          </Tooltip>

          <Tooltip title="Dispatch to Customer">
            <button
              onClick={() => handleOpenConfirmModal(dataItem, "customer")}
              className="me-1 icon-btn"

            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={18}
                height={18}
                fill="currentColor"
              >
                <path d="m8,0H2C.895,0,0,.895,0,2v8h10V2c0-1.105-.895-2-2-2Zm-1.5,5h-3v-2h3v2Zm-3.442,16c-.034.162-.058.328-.058.5,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.172-.024-.338-.058-.5H3.058ZM12,2v10H0v7h15V5c0-1.654-1.346-3-3-3Zm5.058,19c-.034.162-.058.328-.058.5,0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5c0-.172-.024-.338-.058-.5h-4.885Zm-.058-2h7v-5h-7v5Zm2-13h-2v6h7v-1c0-2.757-2.243-5-5-5Z" />
              </svg>
            </button>
          </Tooltip>
          {dataItem.has_mixed_status && (
            <Tooltip title="Multiple product statuses">
              <button className="me-1 icon-btn" onClick={() => handleOpenStatusModal(dataItem.reference)}>
                <i
                  className="fas fa-exclamation-circle text-danger blink-icon"
                  title=""
                ></i>
              </button>
            </Tooltip>
          )}
        </div>
      </td>
    );
  };


  const handleConfirmDispatch = async (item, type) => {
    try {
      console.log(type);

      if (type !== 'customer') {
        setIsLoading(true);
        const res = await PrivateAxios.post("sales/production/dispatch", {
          id: item.id,
          dispatch_type: type,
          production_id: item.production_number,
        });

        SuccessMessage(`Product dispatched to ${type}`);
        handleCloseConfirmModal();
        fetchWorkOrders(); // Refresh the data
      } else {
        handleCloseConfirmModal();
        setLgShow(true)

      }
    } catch (error) {
      ErrorMessage("Dispatch failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <React.Fragment>
      {isLoading && <Loader />}

      <SalesQuotationPageTopBar />
      <PoUpdateStatusBar />


      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                <div className="table-button-group mb-2 ms-auto">

                  <GridToolbar className="border-0 gap-0">
                    <Tooltip title="Export to PDF">
                      <button type='button' className=" table-export-btn" onClick={handleExportPDF}>
                        <i class="far fa-file-pdf d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                    <Tooltip title=" Export to Excel">
                      <button type='button' className=" table-export-btn" onClick={handleExportExcel}>
                        <i class="far fa-file-excel d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                  </GridToolbar>
                </div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <PDFExport data={data} ref={pdfExportRef}>
                  <ExcelExport data={data} ref={excelExportRef} >
                    <Grid
                      data={process(data, dataState)} // Add fallback for undefined data
                      filterable={false}
                      sortable
                      scrollable="scrollable"
                      reorderable
                      resizable
                      {...dataState}
                      onDataStateChange={(e) => setDataState(e.dataState)}
                      loading={loading}
                      pageable={{ buttonCount: 3, pageSizes: true }}
                    >
                      {/* Column Definitions */}
                      <GridColumn field="production_number" title="Production Number" width="150px" />
                      <GridColumn field="reference" title="Reference" width="150px" />
                      <GridColumn field="customer" title="Customer" width="200px" />
                      <GridColumn field="product_code" title="Product Code" width="150px" />
                      <GridColumn field="product_name" title="Product Name" width="200px" />
                      <GridColumn field="qty" title="Qty" width="80px" />
                      <GridColumn field="unit_price" title="Unit Price" width="120px" />
                      <GridColumn field="total_tax_incl" title="Total (Tax Incl.)" width="130px" />
                      <GridColumn field="unit" title="Unit" width="100px" />
                      <GridColumn field="createdBy" title="Created By" width="150px" />
                      <GridColumn field="created_at" title="Created Date" width="130px" />
                      <GridColumn
                        title="action"
                        filter="text"
                        cell={ActionCell}
                        filterable={false}
                        width="250px"
                      />
                    </Grid>
                  </ExcelExport>
                </PDFExport>



              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Dispatch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {dispatchType === "stock" ? "dispatch" : "create an invoice"} {" "}
          <strong>{selectedDispatchItem?.product_name}</strong> to{" "}
          <strong>{dispatchType === "stock" ? "Stock" : "Customer"}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleConfirmDispatch(selectedDispatchItem, dispatchType)}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Product Status List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered responsive className="primary-table-head">
            <thead>
              <tr>
                <th>Product Name</th>
                 <th>SKU</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {statusModalData.map((item, index) => (
                <tr key={index}>
                  <td>{item.ProductsItem?.product_name || "N/A"}</td>
                  <td>{item.ProductsItem?.product_code || "N/A"}</td>
                  <td>{item.qty}</td>
                  <td>{item.ProductsItem?.Masteruom?.unit_name || "-"}</td>
                  <td>
                    {item.status === 10
                      ? "Dispatch"
                      : item.status === 11
                      ? "Production"
                      : item.status === 12
                      ? "Completed"
                      : "Other"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      <CustomerDispatchModal
        show={lgShow}
        onHide={() => setLgShow(false)}
        lgShow={lgShow}
        setLgShow={setLgShow}
        data={data}
        type="customer"
      />

    </React.Fragment >
  );
}

export default MysalesOrderDispatchList;
