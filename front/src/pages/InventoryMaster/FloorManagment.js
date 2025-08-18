import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DataTable, { createTheme } from "react-data-table-component";
import { Link } from "react-router-dom";
import { Dropdown, Modal, Table } from "react-bootstrap";
import Handsontable from "handsontable/base";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";

import moment from "moment";

import { useTable, useExpanded } from "react-table";

import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Tooltip } from "antd";

import { PrivateAxios } from "../../environment/AxiosInstance";
import { SuccessMessage } from "../../environment/ToastMessage";
import InventoryMasterPageTopBar from "./itemMaster/InventoryMasterPageTopBar";
import ItemMasterStatusBar from "./itemMaster/ItemMasterStatusBar";
import { UserAuth } from "../auth/Auth";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../../environment/Loader";

function MypurchaseList() {
  const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } =
    UserAuth();
  //for-data table

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 10,
    sort: [],
    filter: null,
  });
  const [showPrice, setShowPrice] = useState(false);
  const [show, setShow] = useState(false);
  const [getReff, setReff] = useState("");
  const [datavalue, setDatavalue] = useState([]);
  const [expandedRows, setExpandedRows] = React.useState([]);
  const [ProductCompare, setProductCompare] = useState([]);
  const hasMultipleProductsInAny = ProductCompare.some(
    (purchase) => purchase.products.length > 1
  );
  const [getPid, setPid] = useState(false);

  const [getshowRemarks, setShowremark] = useState(false);
  const [getRemarksdata, getremarkdata] = useState("");
  const [getRemarksRef, getremarksRef] = useState("");
  const [grandTotal, setGrandTotal] = useState(0);

  const RemarksClose = () => setShowremark(false);
  const RemarksShow = () => setShowremark(true);
  //pdf
  const getRemarks = (rmks, refid) => {
    getremarkdata(rmks);
    getremarksRef(refid);
  };

  const ReferenceCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div>
          <span>
            <a
              className="k_table_link"
              onClick={() => {
                setShowPrice(true);
                PriceCompare(dataItem.id);
                console.log(dataItem.id);

              }}
            >
              {dataItem.reference}
              {dataItem.is_parent === 1 && "   "} {/* Add a space */}
              {dataItem.is_parent == 1 && (
                <i
                  className="fas fa-info-circle"
                  style={{
                    fontSize: "15px",
                    color: "#007bff",
                    cursor: "pointer",
                  }}
                ></i>
              )}
            </a>
          </span>
        </div>
      </td>
    );
  };
  const PriceCompare = async (id) => {
    try {
      const response = await PrivateAxios.get(
        `/sales/getPurchasecompareManagment/${id}`
      );
      if (response.status === 200) {
        const productsWithTotals = response.data.map((purchase) => ({
          ...purchase,
          products: purchase.products.map((product) => {
            const taxAmount = (product.unit_price * product.tax) / 100;
            const totalWithTax = product.qty * (product.unit_price + taxAmount);
            return { ...product, taxAmount, totalWithTax };
          }),
        }));

        setProductCompare(productsWithTotals);
        calculateGrandTotal(productsWithTotals);
      }
    } catch (error) {
      console.error("Error fetching product comparison data:", error);
    }
  };
  const calculateGrandTotal = (products) => {
    const total = products.reduce(
      (acc, item) =>
        acc +
        item.products.reduce(
          (prodAcc, product) => prodAcc + product.totalWithTax,
          0
        ),
      0
    );
    setGrandTotal(total.toFixed(2));
  };

  const handleStatusChangeproductwise = async (salesid, sid, spid) => {
  const response = await PrivateAxios.put(`/sales/statuschangeproductwise/${salesid}/${sid}/${spid}`);
  if (response.status === 200) {
    SuccessMessage("Record Updated Successfully.!");

    // ✅ Update local ProductCompare state
    setProductCompare((prev) =>
      prev.map((purchase) => {
        if (purchase.id !== salesid) return purchase;

        return {
          ...purchase,
          products: purchase.products.map((product) =>
            product.id === spid ? { ...product, localStatus: sid } : product
          ),
        };
      })
    );
  }
};




  //end pdf
  const handleStatusChange = async (id, sid) => {
    const response = await PrivateAxios.put(`sales/statuschange/${id}/${sid}`);
    const jsonData = response.data;
    if (response.status == 200) {
      SuccessMessage("Status Changed Successfully.!");
      TaskData();
    }
  };
  const columns = React.useMemo(
    () => [
      { Header: "Bill Number", accessor: "bill_number" },
      { Header: "Bill Date", accessor: "bill_date" },
      { Header: "Buyer", accessor: "buyer" },
      { Header: "Untaxed Amount", accessor: "untaxed_amount" },
      { Header: "Total Amount", accessor: "total_amount" },
      {
        Header: "Details",
        id: "details",
        Cell: ({ row }) => (
          <button type="button" onClick={() => handleToggle(row.original.id)}>
            {expandedRows[row.original.id] ? "Hide Details" : "Show Details"}
          </button>
        ),
      },
    ],
    [expandedRows]
  );

  const handleToggle = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const tableInstance = useTable(
    { columns, data: datavalue },
    useExpanded // Use the useExpanded plugin hook
  );

  const TaskData = async () => {
    setIsLoading(true);
    PrivateAxios.get("sales/getallpurchaseorderforfloor")
      .then((res) => {
        const transformedData = res.data.map((item, index) => ({
          id: item.id,
          slNo: index + 1,
          reference: item.reference_number,
          creation: moment(item.created_at).format("DD-MM-YYYY H:mm"),
          expiration: moment(item.expiration).format("DD-MM-YYYY H:mm"),
          customer: item.customer && item.customer.name,
          buyer: item.buyer,
          total: `${getGeneralSettingssymbol}${item.total_amount}`,
          status: item.status,
          is_parent: item.is_parent,
          product_count: item.products?.length || 0,
          is_parent_id: item.is_parent_id,
          mailsend_status: item.mailsend_status,
          parent_recd_id: item.parent_recd_id,
          payment_terms: item.payment_terms,
          products: item.products,
          productsreprodut: item.productsreprodut,
          source_document: item.productsreprodut,
          untaxed_amount: item.untaxed_amount,
          uploadpo: item.uploadpo,
          user_id: item.user_id,
          status_return:
            item.status === 1
              ? "Active"
              : item.status === 2
                ? "RFQ"
                : item.status === 3
                  ? "Send to management"
                  : item.status === 4
                    ? "Sales Order"
                    : item.status === 5
                      ? "Nothing to Bill"
                      : item.status === 6
                        ? "Fully Billed"
                        : item.status === 7
                          ? "Done"
                          : item.status === 8
                            ? "Rejected from Admin"
                            : item.status === 9
                              ? "Send Floor Manager"
                              : item.status === 10
                                ? "Items Received Done"
                                : "Unknown",
        }));
        //console.log(transformedData, "sumit");

        setData(transformedData);

        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        if (err.response.data == 401) {
          Logout();
        }
      });
  };

  useEffect(() => {
    TaskData();
  }, []);

  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div className="d-flex gap-2">
          <Tooltip title="Dispatched">
            <button
              className="me-1 icon-btn"
              onClick={() => handleStatusChange(dataItem.id, 10)}
            >
              <i class="fa fa-truck"></i>
            </button>
          </Tooltip>

          <Tooltip title="Production">
            <button
              className="me-1 icon-btn"
              onClick={() => handleStatusChange(dataItem.id, 11)}
            >
              <i className="fas fa-industry"></i>
            </button>
          </Tooltip>
          {dataItem.product_count > 1 && (
            <Tooltip title="Production">
              <button
                className="me-1 icon-btn"
                onClick={() => {
                  setShowPrice(true);
                  PriceCompare(dataItem.id); // ✅ fetch + open modal
                  // setModalSource("production"); // optional
                }}
              >
                <i
                  className="fas fa-boxes"
                  style={{ color: "#28a745", fontSize: "16px" }}
                ></i>
              </button>
            </Tooltip>
          )}
        </div>
      </td>
    );
  };

  const CustomCell = (props) => {
    const { dataItem, field } = props;

    // Access the field value directly
    const value = dataItem[field];

    return (
      <td>
        <label className="badge status-quotationBg  mb-0">
          <i className="fas  f-s-8 d-flex me-1"></i>Reviewing
        </label>

        {/* {value} */}
      </td>
    );
  };
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
const statusLabelMap = {
  10: "Dispatched",
  11: "Production",
};
  return (
    <React.Fragment>
      {isLoading && <Loader />}
      <InventoryMasterPageTopBar />
      <ItemMasterStatusBar />

      <div className="row p-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
                <div className="table-button-group mb-2 ms-auto">
                  <GridToolbar className="border-0 gap-0">
                    <Tooltip title="Export to PDF">
                      <button
                        type="button"
                        className=" table-export-btn"
                        onClick={handleExportPDF}
                      >
                        <i class="far fa-file-pdf d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                    <Tooltip title=" Export to Excel">
                      <button
                        type="button"
                        className=" table-export-btn"
                        onClick={handleExportExcel}
                      >
                        <i class="far fa-file-excel d-flex f-s-20"></i>
                      </button>
                    </Tooltip>
                  </GridToolbar>
                </div>
              </div>
              <div className="bg_succes_table_head rounded_table">
                <PDFExport data={data} ref={pdfExportRef}>
                  <ExcelExport data={data} ref={excelExportRef}>
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

                      {/* <GridColumn field="slNo" title="sl No." filterable={false} width="100px" locked={true} /> */}
                      <GridColumn
                        field="reference"
                        title="reference"
                        filterable={false}
                        filter="text"
                        cell={ReferenceCell}
                        width="150px"
                      />
                      {/* <GridColumn field="vendor" title="vendor" filter="text" filterable={false} width="250px" /> */}
                      <GridColumn
                        field="creation"
                        title="Creation"
                        filterable={false}
                        filter="numeric"
                        width="200px"
                      />
                      <GridColumn
                        field="customer"
                        title="Customer"
                        filterable={false}
                        filter="text"
                        width="200px"
                      />
                      <GridColumn
                        field="buyer"
                        title="buyer"
                        filter="text"
                        filterable={false}
                        width="200"
                      />
                      {/* <GridColumn field="total" title="total" filter="numeric" filterable={false} width="200px" /> */}
                      {/* <GridColumn field="sourceDocument" title="source DocumentT" filterable={false} filter="text" width="200px" /> */}
                      <GridColumn
                        field="total"
                        title="total"
                        filter="text"
                        filterable={false}
                        width="200px"
                      />
                      {/* <GridColumn field="status" title="STATUS" filter="text" filterable={false} width="200" /> */}
                      <GridColumn
                        field="status_return"
                        title="Status"
                        filter="dropdown"
                        width="250px"
                        filterable={false}
                        // filterCell={CustomDropDownFilter}
                        cells={{
                          data: CustomCell,
                        }}
                      />
                      <GridColumn
                        field="expiration"
                        title="Expiration"
                        filterable={false}
                        filter="numeric"
                        width="200px"
                      />
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

      <Modal
        backdrop="static"
        centered
        size="xl"
        show={showPrice}
        onHide={() => setShowPrice(false)}
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>Products View</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive bordered className="primary-table-head">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Reference</th>
                <th>Product Name</th>
                <th>Total Stock</th>
                <th>Quantity</th>

                <th>Unit Price</th>
                <th>Tax (%)</th>
                <th>Tax Amount</th>
                <th>Total (Incl. Tax)</th>
                {hasMultipleProductsInAny && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {ProductCompare.flatMap((purchase, index) =>
                purchase.products.map((product, productIndex) => {
                  const unitPrice = Number(product.unit_price || 0);
                  const taxRate = Number(product.tax || 0);
                  const quantity = Number(product.qty || 1);
                  const taxAmount = (unitPrice * taxRate * quantity) / 100;
                  const totalWithTax = unitPrice * quantity + taxAmount;


                  return (
                    <tr key={product.id}>
                      {/* Merge Customer Name & Reference Number: Show only for the first product in each purchase */}
                      {productIndex === 0 && (
                        <>
                          <td rowSpan={purchase.products.length}>
                            {purchase.customer.name}
                          </td>
                          <td rowSpan={purchase.products.length}>
                            {purchase.reference_number}
                          </td>
                        </>
                      )}

                      <td>{product.ProductsItem?.product_name}</td>
                      <td>{product.currentStock}</td>
                      <td>{quantity}</td>
                      <td>
                        {getGeneralSettingssymbol} {unitPrice.toFixed(2)}
                      </td>
                      <td>{taxRate.toFixed(2)}%</td>
                      <td>
                        {getGeneralSettingssymbol} {taxAmount.toFixed(2)}
                      </td>
                      <td>
                        {getGeneralSettingssymbol} {totalWithTax.toFixed(2)}
                      </td>

  {hasMultipleProductsInAny && (
  <td>
    {purchase.products.length > 1 && (
      <>
        {product.localStatus ? (
          // ✅ After status update, show status text only
          <span className={`badge ${statusLabelMap[product.localStatus] === 'Dispatched' ? 'bg-success' : 'bg-info'} text-white`}>
            {statusLabelMap[product.localStatus]}
          </span>
        ) : (
          // ❌ No status yet, show buttons
          <div className="d-flex gap-2">
            <Tooltip title="Dispatched">
              <button
                className="me-1 icon-btn"
                onClick={() =>
                  handleStatusChangeproductwise(purchase.id, 10, product?.id)
                }
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

            <Tooltip title="Production">
              <button
                className="me-1 icon-btn"
                onClick={() =>
                  handleStatusChangeproductwise(purchase.id, 11, product?.id)
                }
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
          </div>
        )}
      </>
    )}
  </td>
)}


                    </tr>
                  );
                })
              )}

              {/* Grand Total Row */}
              <tr>
                <td colSpan={7} className="text-end fw-bold">
                  Grand Total:
                </td>
                <td className="fw-bold">
                  {getGeneralSettingssymbol}{" "}
                  {ProductCompare.reduce(
                    (acc, purchase) =>
                      acc +
                      purchase.products.reduce((sum, product) => {
                        const unitPrice = Number(product.unit_price || 0);
                        const taxRate = Number(product.tax || 0);
                        const quantity = Number(product.qty || 1);
                        const taxAmount =
                          (unitPrice * taxRate * quantity) / 100;
                        return sum + unitPrice * quantity + taxAmount;
                      }, 0),
                    0
                  ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>

      </Modal>
    </React.Fragment>
  );
}

export default MypurchaseList;
