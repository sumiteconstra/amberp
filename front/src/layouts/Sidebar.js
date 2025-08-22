import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { UserAuth } from "../pages/auth/Auth";
import "./profile-info.min.css"

function Sidebar() {
  const { Logout, userDetails, MatchPermission } = UserAuth();
  const location = useLocation();
  const sessionLogout = () => {
    Logout();
  }

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-1 exp-main-nav header-3">
      <a href className="brand-link d-flex justify-content-center">
        <img
          src={process.env.PUBLIC_URL + "/assets/images/favicon.png"}
          alt="Logo"
          className="brand-image img-fluid"
        />
        <span className="brand-text">
          <img
            src={process.env.PUBLIC_URL + "/assets/images/AMB-LOGO.png"}
            alt="Logo"
            className="img-fluid brand-name"
          />
        </span>
      </a>

      <div className="sidebar">
        <div className='side_menu'>
          <nav className="nav-customSidebar">
            <div className="accordion menu-accordian" id="menuAccordian">
              {/* new add */}
              {MatchPermission(["Purchase"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/my-workflow-task" ||
                        location.pathname.split("/")[1] === "my-task-done2" ||
                        location.pathname === "/my-workflow-task-details" ||
                        location.pathname === "/my-checklist-task" ||
                        location.pathname === "/my-task-tracker" ||
                        location.pathname === "/dashboard" ||
                        location.pathname === "/management" ||
                        location.pathname === "/pending-approval/final-approval-pending" ||
                        location.pathname === "/pending-approval/active" ||
                        location.pathname === "/pending-approval/request-for-quotation" ||
                        location.pathname === "/pending-approval/send-to-management" ||
                        location.pathname === "/pending-approval/sales-order" ||
                        location.pathname === "/pending-approval/rejected-from-admin" ||
                        location.pathname === "/pending-approval/fully-billed" ||
                        location.pathname === "/pending-approval/done" ||
                        location.pathname === "/pending-approval/nothing-to-bill" ||
                        location.pathname === "/pending-approval/items-received-done" ||
                        location.pathname === "/approve-po/final-approval-pending" ||
                        location.pathname === "/approve-po/approval-Active" ||
                        location.pathname === "/operation/create-rfq-active" ||
                        location.pathname === "/operation/create-rfq-pending" ||
                        location.pathname === "/operation/create-rfq-billed" ||
                        location.pathname === "/operation/create-rfq-quotation" ||
                        location.pathname === "/operation/create-rfq-management" ||
                        location.pathname === "/operation/purchase-orders/received-done" ||
                        location.pathname === "/operation/purchase-orders/sales-orders" ||
                        location.pathname === "/operation/purchase-orders/done" ||
                        location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
                        location.pathname === "/operation/complete-orders/received-done" ||
                        location.pathname === "/operation/complete-orders/nothing-to-bill" ||
                        location.pathname === "/operation/rejected-orders/rejected" ||
                        location.pathname === "/followup/order-followup/nothing-bill" ||
                        location.pathname === "/bill/purchase-orders-recved/items-received-done" ||

                        // location.pathname === "/pending-approval" ||
                        location.pathname === "/purchase" ||
                        location.pathname === "/rejected-purchase" ||
                        location.pathname === "/purchase-orders" ||
                        location.pathname === "/purchase-orders-done" ||
                        location.pathname === "/followup" ||
                        location.pathname === "/store/recv_update/request-quotation" ||
                        location.pathname === "/purchase-orders-recved" ||
                        location.pathname === "/purchase/new" ||
                        location.pathname === "/operation/purchase_ledger"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#purchase"
                      aria-expanded="false"
                      aria-controls="purchase"
                    >
                      {/* <i className="sidebar-nav-icon fas fa-cart-plus" /> */}
                      <span className="sidebar-nav-icon">🛒</span>
                      <p>Purchase</p>
                    </button>
                  </div>
                  <div
                    id="purchase"
                    className={`accordion-collapse collapse ${location.pathname === "/my-workflow-task" ||
                      location.pathname.split("/")[1] === "my-task-done" ||
                      location.pathname === "/my-workflow-task-details" ||
                      location.pathname === "/my-checklist-task" ||
                      location.pathname === "/my-task-tracker" ||
                      location.pathname === "/dashboard" ||
                      location.pathname === "/management" ||
                      location.pathname === "/pending-approval/final-approval-pending" ||
                      location.pathname === "/pending-approval/active" ||
                      location.pathname === "/pending-approval/request-for-quotation" ||
                      location.pathname === "/pending-approval/send-to-management" ||
                      location.pathname === "/pending-approval/sales-order" ||
                      location.pathname === "/pending-approval/rejected-from-admin" ||
                      location.pathname === "/pending-approval/fully-billed" ||
                      location.pathname === "/pending-approval/done" ||
                      location.pathname === "/pending-approval/nothing-to-bill" ||
                      location.pathname === "/pending-approval/items-received-done" ||

                      location.pathname === "/approve-po/final-approval-pending" ||
                      location.pathname === "/approve-po/approval-Active" ||
                      location.pathname === "/operation/create-rfq-active" ||
                      location.pathname === "/operation/create-rfq-pending" ||
                      location.pathname === "/operation/create-rfq-billed" ||
                      location.pathname === "/operation/create-rfq-quotation" ||
                      location.pathname === "/operation/create-rfq-management" ||
                      location.pathname === "/operation/purchase-orders/received-done" ||
                      location.pathname === "/operation/purchase-orders/sales-orders" ||
                      location.pathname === "/operation/purchase-orders/done" ||
                      location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
                      location.pathname === "/operation/complete-orders/received-done" ||
                      location.pathname === "/operation/complete-orders/nothing-to-bill" ||
                      location.pathname === "/operation/rejected-orders/rejected" ||
                      location.pathname === "/followup/order-followup/nothing-bill" ||
                      location.pathname === "/bill/purchase-orders-recved/items-received-done" ||
                      // location.pathname === "/pending-approval" ||
                      location.pathname === "/purchase" ||
                      location.pathname === "/rejected-purchase" ||
                      location.pathname === "/purchase-orders" ||
                      location.pathname === "/purchase-orders-done" ||
                      location.pathname === "/followup" ||
                      location.pathname === "/store/recv_update/request-quotation" ||
                      location.pathname === "/purchase-orders-recved" ||
                      location.pathname === "/purchase/new" ||
                      location.pathname === "/operation/purchase_ledger"
                      ? "show"
                      : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <div className="sidebar-item">
                        <Link
                          to="/dashboard"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/dashboard" ? "active" : ""
                            } `}
                        >
                          {/* <i className="sidebar-nav-icon fi fi-br-category-alt" /> */}
                          <p>Dashboard</p>
                        </Link>
                      </div>
                      {/* <div className="sidebar-item">
                    <Link
                      to="/pending-approval/final-approval-pending"
                      className={`sidebar-nav-link subMenu_item ${location.pathname === "/pending-approval/final-approval-pending" ||
                  location.pathname === "/pending-approval/active" ||
                  location.pathname === "/pending-approval/request-for-quotation" || 
                  location.pathname === "/pending-approval/send-to-management" || 
                  location.pathname === "/pending-approval/sales-order" || 
                  location.pathname === "/pending-approval/rejected-from-admin" || 
                  location.pathname === "/pending-approval/fully-billed" || 
                  location.pathname === "/pending-approval/done" || 
                  location.pathname === "/pending-approval/nothing-to-bill" || 
                  location.pathname === "/pending-approval/items-received-done" || 
                  location.pathname === "/pending-approval/final-approval-pending" ? "active" : ""
                        } `}
                    >
                      <p>Management</p>
                    </Link>
                  </div> */}


                      <div
                        className="accordion menu-accordian"
                        id="submenuAccordian"
                      >

                        {/* operation */}
                        <div className="accordion-header sidebar-item ">
                          <button
                            className={`accordion-button submenu ${location.pathname === "/operation/create-rfq-active" ||
                              location.pathname === "/operation/create-rfq-pending" ||
                              location.pathname === "/operation/create-rfq-billed" ||
                              location.pathname === "/operation/create-rfq-quotation" ||
                              location.pathname === "/operation/create-rfq-management" ||
                              location.pathname === "/operation/purchase-orders/received-done" ||
                              location.pathname === "/operation/purchase-orders/sales-orders" ||
                              location.pathname === "/operation/purchase-orders/done" ||
                              location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
                              location.pathname === "/operation/complete-orders/received-done" ||
                              location.pathname === "/operation/complete-orders/nothing-to-bill" ||
                              location.pathname === "/operation/rejected-orders/rejected" ||
                              location.pathname === "/purchase-orders" ||
                              location.pathname === "/purchase-orders-done" ||
                              location.pathname === "/purchase/new" ||
                              location.pathname === "/operation/purchase_ledger"
                              ? ""
                              : "collapsed"
                              } sidebar-nav-link`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#Operation"
                            aria-expanded="false"
                            aria-controls="Operation"
                          >
                            {/* <i className="sidebar-nav-icon bi bi-person-fill-gear" /> */}
                            <p>Operations</p>
                          </button>
                        </div>

                        <div
                          id="Operation"
                          className={`accordion-collapse collapse ${location.pathname === "/operation/create-rfq-active" ||
                            location.pathname === "/operation/create-rfq-pending" ||
                            location.pathname === "/operation/create-rfq-billed" ||
                            location.pathname === "/operation/create-rfq-quotation" ||
                            location.pathname === "/operation/create-rfq-management" ||
                            location.pathname === "/operation/purchase-orders/received-done" ||
                            location.pathname === "/operation/purchase-orders/sales-orders" ||
                            location.pathname === "/operation/purchase-orders/done" ||
                            location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
                            location.pathname === "/operation/complete-orders/received-done" ||
                            location.pathname === "/operation/complete-orders/nothing-to-bill" ||
                            location.pathname === "/operation/rejected-orders/rejected" ||
                            location.pathname === "/rejected-purchase" ||
                            location.pathname === "/purchase-orders" ||
                            location.pathname === "/purchase-orders-done" ||
                            location.pathname === "/purchase/new" ||
                            location.pathname === "/operation/purchase_ledger"
                            ? "show"
                            : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              <li className="sidebar-item">
                                <Link
                                  to="/operation/purchase_ledger"
                                  className={`sidebar-nav-link ${location.pathname === "/operation/create-rfq-active" ||
                                    location.pathname === "/operation/create-rfq-pending" ||
                                    location.pathname === "/operation/create-rfq-billed" ||
                                    location.pathname === "/operation/create-rfq-quotation" ||
                                    location.pathname === "/operation/create-rfq-management" ||
                                    location.pathname === "/operation/purchase_ledger"
                                    ? "active"
                                    : ""
                                    }`}
                                >
                                  {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                  <p>Purchase Ledger</p>
                                </Link>
                              </li>
                              {MatchPermission(["Create RFQ"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/create-rfq-active"
                                    className={`sidebar-nav-link ${location.pathname === "/operation/create-rfq-active" ||
                                      location.pathname === "/operation/create-rfq-pending" ||
                                      location.pathname === "/operation/create-rfq-billed" ||
                                      location.pathname === "/operation/create-rfq-quotation" ||
                                      location.pathname === "/operation/create-rfq-management"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Create RFQ</p>
                                  </Link>
                                </li>
                                : ""}
                              {MatchPermission(["Purchase Order"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/purchase-orders/received-done"
                                    className={`sidebar-nav-link ${location.pathname === "/operation/purchase-orders/received-done" ||
                                      location.pathname === "/operation/purchase-orders/done" ||
                                      location.pathname === "/operation/purchase-orders/nothing-to-bill" ||
                                      location.pathname === "/operation/purchase-orders/sales-orders"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Purchase Orders</p>
                                  </Link>
                                </li>
                                : ""}
                              {MatchPermission(["Completed Orders"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/complete-orders/received-done"
                                    className={`sidebar-nav-link ${location.pathname === "/operation/complete-orders/received-done" ||
                                      location.pathname === "/operation/complete-orders/nothing-to-bill"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Completed Orders</p>
                                  </Link>
                                </li>
                                : ""}
                              {MatchPermission(["Rejected Orders"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/rejected-orders/rejected"
                                    className={`sidebar-nav-link ${location.pathname === "/operation/rejected-orders/rejected"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Rejected Orders</p>
                                  </Link>
                                </li>
                                : ""}
                            </ul>
                          </div>
                        </div>
                        {/* operation end*/}
                        <div className="accordion-header sidebar-item">
                          <button
                            className={`accordion-button submenu ${
                              // location.pathname === "/pending-approval/rejected-from-admin" ||
                              // location.pathname === "/pending-approval/final-approval-pending" ||
                              location.pathname === "/pending-approval/active" ||
                                location.pathname === "/pending-approval/request-for-quotation" ||
                                location.pathname === "/pending-approval/send-to-management" ||
                                location.pathname === "/pending-approval/sales-order" ||
                                location.pathname === "/pending-approval/rejected-from-admin" ||
                                location.pathname === "/pending-approval/fully-billed" ||
                                location.pathname === "/pending-approval/done" ||
                                location.pathname === "/pending-approval/nothing-to-bill" ||
                                location.pathname === "/pending-approval/items-received-done" ||
                                location.pathname === "/pending-approval/final-approval-pending" ||

                                location.pathname === "/approve-po/final-approval-pending" ||
                                location.pathname === "/approve-po/approval-Active"
                                // location.pathname === "/final-approval"
                                ? ""
                                : "collapsed"
                              } sidebar-nav-link`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#menu5"
                            aria-expanded="false"
                            aria-controls="menu5"
                          >
                            <p>Management</p>
                          </button>
                        </div>

                        <div
                          id="menu5"
                          className={`accordion-collapse collapse ${

                            // location.pathname === "/pending-approval/final-approval-pending" ||
                            location.pathname === "/pending-approval/active" ||
                              location.pathname === "/pending-approval/request-for-quotation" ||
                              location.pathname === "/pending-approval/send-to-management" ||
                              location.pathname === "/pending-approval/sales-order" ||
                              // location.pathname === "/pending-approval/rejected-from-admin" || 
                              location.pathname === "/pending-approval/fully-billed" ||
                              location.pathname === "/pending-approval/done" ||
                              location.pathname === "/pending-approval/nothing-to-bill" ||
                              location.pathname === "/pending-approval/items-received-done" ||
                              location.pathname === "/pending-approval/final-approval-pending" ||
                              location.pathname === "/pending-approval/rejected-from-admin" ||
                              location.pathname === "/approve-po/final-approval-pending" ||
                              location.pathname === "/approve-po/approval-Active"
                              ? "show"
                              : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              {MatchPermission(["Approve Quotation"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/pending-approval/send-to-management"
                                    className={`sidebar-nav-link ${location.pathname === "/pending-approval/active" ||
                                      location.pathname === "/pending-approval/request-for-quotation" ||
                                      location.pathname === "/pending-approval/send-to-management" ||
                                      location.pathname === "/pending-approval/sales-order" ||
                                      // location.pathname === "/pending-approval/rejected-from-admin" || 
                                      location.pathname === "/pending-approval/fully-billed" ||
                                      location.pathname === "/pending-approval/done" ||
                                      location.pathname === "/pending-approval/nothing-to-bill" ||
                                      location.pathname === "/pending-approval/items-received-done" ||
                                      location.pathname === "/pending-approval/send-to-management"

                                      ? "active"
                                      : ""
                                      }`}
                                  >

                                    <p>Approve Quotation</p>
                                  </Link>
                                </li>
                                : ''}
                              {MatchPermission(["Approve P.O"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/approve-po/final-approval-pending"
                                    className={`sidebar-nav-link ${location.pathname === "/approve-po/final-approval-pending"
                                      ? "active"
                                      : ""
                                      }`}
                                  >

                                    <p>Approve P.O</p>
                                  </Link>
                                </li>
                                : ''}
                            </ul>
                          </div>
                        </div>
                        {/* management end*/}
                        {/* product */}
                        {/* <div className="accordion-header sidebar-item ">
                      <button
                        className={`accordion-button submenu ${location.pathname === "/products" ||
                            location.pathname === "/category"
                            ? ""
                            : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#Product"
                        aria-expanded="false"
                        aria-controls="Product"
                      >
                        <i className="sidebar-nav-icon bi bi-cart3" />
                        <p>Product</p>
                      </button>
                    </div>

                    <div
                      id="Product"
                      className={`accordion-collapse collapse ${location.pathname === "/purchase" ||
                          location.pathname === "/rejected-purchase" ||
                          location.pathname === "/purchase-orders" ||
                          location.pathname === "/purchase-orders-done"
                          ? "show"
                          : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">
                          <li className="sidebar-item">
                            <Link
                              to="/products"
                              className={`sidebar-nav-link ${location.pathname === "/products"
                                  ? "active"
                                  : ""
                                }`}
                            >
                              <i className="sidebar-nav-icon bi bi-box-seam" />
                              <p>Products</p>
                            </Link>
                          </li>

                          <li className="sidebar-item">
                            <Link
                              to="/category"
                              className={`sidebar-nav-link ${location.pathname === "/category"
                                  ? "active"
                                  : ""
                                }`}
                            >
                              <i className="sidebar-nav-icon bi bi-grid" />
                              <p>Category</p>
                            </Link>
                          </li>

                        </ul>
                      </div>
                    </div> */}
                        {/* product end*/}
                        {/* follow-up */}
                        <div className="accordion-header sidebar-item ">
                          <button
                            className={`accordion-button submenu ${location.pathname === "/followup/order-followup/nothing-bill" ? "" : "collapsed"
                              } sidebar-nav-link`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#Follow"
                            aria-expanded="false"
                            aria-controls="Follow"
                          >
                            {/* <i className="sidebar-nav-icon fi fi-ss-leader" /> */}
                            <p>Follow Up</p>
                          </button>
                        </div>

                        <div
                          id="Follow"
                          className={`accordion-collapse collapse ${location.pathname === "/followup/order-followup/nothing-bill" ? "show" : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              {MatchPermission(["Order Followup"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/followup/order-followup/nothing-bill"
                                    className={`sidebar-nav-link ${location.pathname === "/followup/order-followup/nothing-bill"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Order Followup</p>
                                  </Link>
                                </li>
                                : ''}
                            </ul>
                          </div>
                        </div>
                        {/* follow-up end*/}

                        {/* store */}
                        <div className="accordion-header sidebar-item ">
                          {MatchPermission(["Order Receive Update"]) ?
                            <button
                              className={`accordion-button submenu ${location.pathname === "/store/recv_update/request-quotation"
                                ? ""
                                : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#Store"
                              aria-expanded="false"
                              aria-controls="Store"
                            >
                              {/* <i className="sidebar-nav-icon fi fi-sr-shop" /> */}
                              <p>Store</p>
                            </button>
                            : ''}
                        </div>

                        <div
                          id="Store"
                          className={`accordion-collapse collapse ${location.pathname === "/store/recv_update/request-quotation" ? "show" : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              {MatchPermission(["Order Receive Update"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/store/recv_update/request-quotation"
                                    className={`sidebar-nav-link ${location.pathname === "/store/recv_update/request-quotation"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Order Receive Update</p>
                                  </Link>
                                </li>
                                : ''}
                            </ul>
                          </div>
                        </div>
                        {/* store end*/}
                        {/* PO recved */}
                        <div className="accordion-header sidebar-item ">
                          {MatchPermission(["Create Bill"]) ?
                            <button
                              className={`accordion-button submenu ${location.pathname === "/bill/purchase-orders-recved/items-received-done" ||
                                location.pathname === "/bill/purchase-orders-recved/nothing-to-bill"
                                ? ""
                                : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#bill"
                              aria-expanded="false"
                              aria-controls="bill"
                            >
                              {/* <i className="sidebar-nav-icon fi fi-ss-point-of-sale-bill" /> */}
                              <p>Bill</p>
                            </button>
                            : ''}
                        </div>

                        <div
                          id="bill"
                          className={`accordion-collapse collapse ${location.pathname === "/bill/purchase-orders-recved/items-received-done" ||
                            location.pathname === "/bill/purchase-orders-recved/items-received-done"
                            ? "show"
                            : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              <li className="sidebar-item">
                                <Link
                                  to="/bill/purchase-orders-recved/items-received-done"
                                  className={`sidebar-nav-link ${location.pathname === "/bill/purchase-orders-recved/items-received-done" ||
                                    location.pathname === "/bill/purchase-orders-recved/nothing-to-bill"
                                    ? "active"
                                    : ""
                                    }`}
                                >
                                  {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                  <p>Create Bill</p>
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        {/* PO recved  end*/}
                      </div>
                    </div>
                  </div>
                </div>
                : ""}
              {MatchPermission(["Sales"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname.split("/")[1] === "my-task-done2" ||
                        location.pathname === "/sales-orders" ||
                        location.pathname === "/sales-orders-done" ||
                        location.pathname === "/sales-orders/dispatch/order-dispatch" ||
                        location.pathname === "/sales-orders/received-product" ||
                        location.pathname === "/rejected-sales" ||
                        location.pathname === "/sales/quotation/reviewing" ||
                        location.pathname === "/sales/quotation/rejected" ||
                        location.pathname === "/sales/quotation" ||
                        location.pathname === "/sales/pending-approval/reviewing" ||
                        location.pathname === "/sales/new" ||
                        location.pathname === "/sales-dashboard" ||
                        location.pathname === "/operation/sales_ledger"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Sales"
                      aria-expanded="false"
                      aria-controls="Sales"
                    >
                      {/* <i className="sidebar-nav-icon fas fa-chart-line" /> */}
                      <span className="sidebar-nav-icon">🛍️</span>
                      <p>Sales</p>
                    </button>
                  </div>
                  <div
                    id="Sales"
                    className={`accordion-collapse collapse ${location.pathname.split("/")[1] === "my-task-done" ||
                      location.pathname === "/sales-orders" ||
                      location.pathname === "/sales-dashboard" ||
                      location.pathname === "/my-checklist-task" ||
                      location.pathname === "/sales-orders-done" ||
                      location.pathname === "/sales/quotation/reviewing" ||
                      location.pathname === "/sales/quotation/rejected" ||
                      location.pathname === "/sales/quotation" ||
                      location.pathname === "/sales/followup" ||
                      location.pathname === "/sales-orders/dispatch/order-dispatch" ||
                      location.pathname === "/sales-orders/received-product" ||
                      location.pathname === "/sales/pending-approval/reviewing" ||
                      location.pathname === "/sales/new" ||
                      location.pathname === "/operation/sales_ledger"
                      ? "show"
                      : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <div className="sidebar-item">
                        <Link
                          to="sales-dashboard"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/sales-dashboard" ? "active" : ""
                            } `}
                        >
                          {/* <i className="sidebar-nav-icon fi fi-ss-dashboard" /> */}
                          <p>Dashboard</p>
                        </Link>
                      </div>

                      <div
                        className="accordion menu-accordian"
                        id="submenuAccordian"
                      >
                        {/* operation */}
                        <div className="accordion-header sidebar-item ">
                          <button
                            className={`accordion-button submenu ${location.pathname === "/sales/quotation/reviewing" ||
                              location.pathname === "/sales/quotation/rejected" ||
                              location.pathname === "/sales/quotation" ||
                              location.pathname === "/rejected-sales" ||
                              location.pathname === "/sales-sales" ||
                              location.pathname === "/sales-orders-done" ||
                              location.pathname === "/sales-orders/received-product" ||
                              location.pathname === "/sales/new" ||
                              location.pathname === "/operation/sales_ledger"
                              ? ""
                              : "collapsed"
                              } sidebar-nav-link`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#Operation"
                            aria-expanded="false"
                            aria-controls="Operation"
                          >
                            {/* <i className="sidebar-nav-icon fi fi-rr-operation" /> */}
                            <p>Sales Operation</p>
                          </button>
                        </div>

                        <div
                          id="Operation"
                          className={`accordion-collapse collapse ${location.pathname === "/purchase" ||
                            location.pathname === "/rejected-sales" ||
                            location.pathname === "/sales-orders" ||
                            location.pathname === "/sales-orders-done" ||
                            location.pathname === "/sales/new" ||
                            location.pathname === "/sales/quotation/reviewing" ||
                            location.pathname === "/sales/quotation/rejected" ||
                            location.pathname === "/sales-orders/dispatch/order-dispatch" ||
                            location.pathname === "/sales-orders/received-product" ||
                            location.pathname === "/sales/quotation" ||
                            location.pathname === "/operation/sales_ledger"
                            ? "show"
                            : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              {MatchPermission(["Sales Ledger"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/operation/sales_ledger"
                                    className={`sidebar-nav-link ${location.pathname === "/operation/sales_ledger"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Sales Ledger</p>
                                  </Link>
                                </li>
                                : ""}
                              {/* <li className="sidebar-item">
                            <Link
                              to="/sales/new"
                              className={`sidebar-nav-link ${location.pathname === "/sales/new"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Request Quotation</p>
                            </Link>
                          </li> */}
                              {MatchPermission(["Quotations"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/sales/quotation"
                                    className={`sidebar-nav-link ${location.pathname === "/sales/quotation" ||
                                      location.pathname === "/sales/quotation/rejected" ||
                                      location.pathname === "/sales/quotation"
                                      ? "active" : ""

                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Quotations</p>
                                  </Link>
                                </li>
                                : ""}
                              {MatchPermission(["Sales Orders"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/sales-orders"
                                    className={`sidebar-nav-link ${location.pathname === "/sales-orders"
                                      ? "active"
                                      : ""
                                      }`}
                                  >

                                    {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                    <p>Sales Orders</p>
                                  </Link>
                                </li>
                                : ""}
                              {MatchPermission(["Dispatch"]) ?
                                <li className="sidebar-item">
                                  <Link
                                    to="/sales-orders/dispatch/order-dispatch"
                                    className={`sidebar-nav-link ${location.pathname === "/sales-orders/dispatch/order-dispatch" ||
                                      location.pathname === "/sales-orders/dispatch/order-dispatch"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    <p>Dispatch</p>
                                  </Link>
                                </li>
                                : ""}
                            </ul>
                          </div>
                        </div>
                        {/* operation end*/}
                        {/* management */}
                        {MatchPermission(["Approve Quotation Sales"]) ?
                          <div className="accordion-header sidebar-item">
                            <button
                              className={`accordion-button submenu ${location.pathname === "/sales/pending-approval/reviewing"
                                ? ""
                                : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#sManagement"
                              aria-expanded="false"
                              aria-controls="sManagement"
                            >
                              {/* <i className="sidebar-nav-icon fi fi-br-lead-management" /> */}
                              <p>Management</p>
                            </button>
                          </div>
                          : ""}
                        <div
                          id="sManagement"
                          className={`accordion-collapse collapse ${location.pathname === "/sales/pending-approval/reviewing"
                            ? "show"
                            : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          {MatchPermission(["Approve Quotation Sales"]) ?
                            <div className="accordion-body">
                              <ul className="sidebar-submenu">
                                <li className="sidebar-item">
                                  <Link
                                    to="/sales/pending-approval/reviewing"
                                    className={`sidebar-nav-link ${location.pathname === "/sales/pending-approval/reviewing"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>Approve Quotation</p>
                                  </Link>
                                </li>
                              </ul>
                            </div>
                            : ""}
                        </div>
                        {/* management end*/}
                        {/* follow-up */}
                        {/* <div className="accordion-header sidebar-item ">
                      <button
                        className={`accordion-button submenu ${location.pathname === "/sales/followup"
                          ? ""
                          : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#Followsales"
                        aria-expanded="false"
                        aria-controls="Followsales"
                      >
                        <p>Follow Up</p>
                      </button>
                    </div> */}

                        <div
                          id="Followsales"
                          className={`accordion-collapse collapse ${location.pathname === "/sales/followup" ? "show" : ""
                            } `}
                          data-bs-parent="#submenuAccordian"
                        >
                          <div className="accordion-body">
                            <ul className="sidebar-submenu">
                              <li className="sidebar-item">
                                <Link
                                  to="/sales/followup"
                                  className={`sidebar-nav-link ${location.pathname === "/sales/followup"
                                    ? "active"
                                    : ""
                                    }`}
                                >
                                  {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                  <p>Sales Followup</p>
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        {/* follow-up end*/}
                      </div>
                    </div>
                  </div>
                </div>

                : ""}
              {/* inventory start */}
              {MatchPermission(["Inventory"]) ?

                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname.split("/")[1] === "/inventory-master-editx" ||
                        // location.pathname === "/custome/rs" ||
                        location.pathname === "/inventory/inventory-master"
                        || location.pathname === "/products"
                        || location.pathname === "/category"
                        || location.pathname === "/inventory/barcode"
                        || location.pathname === "/inventory/stock_movement"
                        || location.pathname === "/inventory/inventory_approval"
                        || location.pathname === "/inventory-master-edit"
                        || location.pathname === "/products"
                        || location.pathname === "/category"
                        || location.pathname === "/add-new-product"
                        || location.pathname === "/add-new-category"
                        || location.pathname === "/edit-category/:id"
                        || location.pathname === "/inventory/inventory-master-edit/:id"
                        || location.pathname === "/inventory/inventory-master"
                        ? "" : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Inventory"
                      aria-expanded="false"
                      aria-controls="Inventory"
                    >
                      {/* <i className="sidebar-nav-icon fas fa-cubes" /> */}
                      <span className="sidebar-nav-icon">📦</span>
                      <p>Inventory</p>
                    </button>
                  </div>
                  <div
                    id="Inventory"
                    className={`accordion-collapse collapse ${location.pathname === "/inventory/dashboard"
                      || location.pathname === "/inventory-master-edit"
                      || location.pathname === "/inventory/inventory-master"
                      || location.pathname === "/inventory/barcode"
                      || location.pathname === "/inventory/stock_movement"
                      || location.pathname === "/inventory/inventory_approval"
                      || location.pathname === "/products"
                      || location.pathname === "/add-new-product"
                      || location.pathname === "/add-new-category"
                      || location.pathname === "/edit-category/:id"
                      || location.pathname === "/category"
                      || location.pathname === "/inventory/inventory-master-edit/:id"
                      || location.pathname === "/inventory/floor_manager"
                      ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body ">
                      <div className="sidebar-item">
                        <Link
                          to="/inventory/dashboard"
                          className={`sidebar-nav-link subMenu_item ${location.pathname === "/inventory/dashboard" ? "active" : ""
                            } `}
                        >
                          {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                          <p>Dashboard</p>
                        </Link>
                      </div>
                      {MatchPermission(["Inventory Item Master"]) ?
                        <div className="sidebar-item">
                          <Link to="/inventory/inventory-master"
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/inventory/inventory-master"
                              || location.pathname === "/inventory/barcode"
                              || location.pathname === "/inventory/stock_movement"
                              || location.pathname === "/inventory/inventory_approval"
                              || location.pathname === "/inventory/inventory-master-edit/:id"

                              ? "active" : ""
                              } `}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>Item Master</p>
                          </Link>
                        </div>
                        : ""}
                      {MatchPermission(["Floor Manager"]) ?
                        <div className="sidebar-item">
                          <Link
                            to="/inventory/floor_manager"
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/inventory/floor_manager"
                              ? "active" : ""
                              } `}
                          >

                            <p>Floor Manager</p>
                          </Link>
                        </div>
                        : ""}
                      {MatchPermission(["Inventory Category"]) ?
                        <div className="sidebar-item">
                          <Link to={'/category'}
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/add-new-category" ||
                              location.pathname === "/edit-category/:id" ||
                              location.pathname === "/category"
                              ? "active" : ""
                              } `}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>Category</p>
                          </Link>
                        </div>
                        : ""}
                    </div>
                  </div>
                </div>
                : ""}
              {/* inventory end */}

              {/* Production start */}
              {MatchPermission(["Production"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/production/bom" ||
                        location.pathname === "/production/bom/create-bom" ||
                        location.pathname === "/production/bom-draft" ||
                        location.pathname === "/production/bom-published" ||
                        location.pathname === "/production/bom-delete" ||
                        location.pathname === "/inventory-master-edit" ||
                        location.pathname === "/production/bom/view-bom" ||
                        location.pathname === "/production/all-production-process" ||
                        location.pathname === "/production/all-production-process/create-production" ||
                        location.pathname === "/production/all-production-process" ||
                        location.pathname === "/production/production-process-pending-list" ||
                        location.pathname === "/production/production-approved-list" ||
                        location.pathname === "/production/production-test-pending-list" ||
                        location.pathname === "/production/production-canceled-list" ||
                        location.pathname === "/production/production-repair-pending-list" ||
                        location.pathname === "/production/work-orders" ||
                        location.pathname === "/production/work-orders-open" ||
                        location.pathname === "/production/work-orders-planned" ||
                        location.pathname === "/production/work-orders-pending" ||
                        location.pathname === "/production/work-orders-wip" ||
                        location.pathname === "/production/work-orders-completed" ||
                        location.pathname === "/production/sub-contract" ||
                        location.pathname === "/production/sub-contract-approve-pending" ||
                        location.pathname === "/production/sub-contract-approve" ||
                        location.pathname === "/production/sub-contract-testing-pending" ||
                        location.pathname === "/production/sub-contract-canceled" ||
                        location.pathname === "/production/sub-contract-repair-pending" ||
                        location.pathname === "/production/all-production-process/view-production" ? "" : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Production"
                      aria-expanded="false"
                      aria-controls="Production"
                    >
                      {/* <i className="sidebar-nav-icon fas fa-sitemap" /> */}
                      <span className="sidebar-nav-icon">🏭</span>
                      <p>Production</p>
                    </button>
                  </div>
                  <div
                    id="Production"
                    className={`accordion-collapse collapse ${location.pathname === "/production/bom" ||
                      location.pathname === "/production/bom/create-bom" ||
                      location.pathname === "/production/bom-draft" ||
                      location.pathname === "/production/bom-published" ||
                      location.pathname === "/production/bom-delete" ||
                      location.pathname === "/inventory-master" ||
                      location.pathname === "/inventory-master-edit" ||
                      location.pathname === "/production/bom/view-bom" ||
                      location.pathname === "/production/all-production-process/create-production" ||
                      location.pathname === "/production/all-production-process" ||
                      location.pathname === "/production/production-process-pending-list" ||
                      location.pathname === "/production/production-approved-list" ||
                      location.pathname === "/production/production-test-pending-list" ||
                      location.pathname === "/production/production-canceled-list" ||
                      location.pathname === "/production/production-repair-pending-list" ||
                      location.pathname === "/production/work-orders" ||
                      location.pathname === "/production/work-orders-open" ||
                      location.pathname === "/production/work-orders-planned" ||
                      location.pathname === "/production/work-orders-pending" ||
                      location.pathname === "/production/work-orders-wip" ||
                      location.pathname === "/production/work-orders-completed" ||
                      location.pathname === "/production/sub-contract" ||
                      location.pathname === "/production/sub-contract-approve-pending" ||
                      location.pathname === "/production/sub-contract-approve" ||
                      location.pathname === "/production/sub-contract-testing-pending" ||
                      location.pathname === "/production/sub-contract-canceled" ||
                      location.pathname === "/production/sub-contract-repair-pending" ||
                      location.pathname === "/production/all-production-process/view-production" ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      {MatchPermission(["Bill of Materials"]) ?
                        <div className="sidebar-item">
                          <Link to="/production/bom"
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/production/bom" ||
                              location.pathname === "/production/bom/create-bom" ||
                              location.pathname === "/production/bom/view-bom" ||
                              location.pathname === "/production/bom-draft" ||
                              location.pathname === "/production/bom-published" ||
                              location.pathname === "/production/bom-delete"
                              ? "active" : ""
                              } `}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>Bill of Materials</p>
                          </Link>
                        </div>
                        : ""}
                      {MatchPermission(["All Production Process"]) ?
                        <div className="sidebar-item">
                          <Link to="/production/all-production-process"
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/production/all-production-process" ||
                              location.pathname === "/production/all-production-process/create-production" ||
                              location.pathname === "/production/all-production-process/view-production" ||
                              location.pathname === "/production/production-process-pending-list" ||
                              location.pathname === "/production/production-approved-list" ||
                              location.pathname === "/production/production-test-pending-list" ||
                              location.pathname === "/production/production-canceled-list" ||
                              location.pathname === "/production/production-repair-pending-list"
                              ? "active" : ""
                              } `}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>All Production Process</p>
                          </Link>
                        </div>
                        : ""}
                      {MatchPermission(["Work Orders"]) ?
                        <div className="sidebar-item">
                          <Link to="/production/work-orders"
                            className={`sidebar-nav-link subMenu_item ${location.pathname === "/production/work-orders" ||
                              location.pathname === "/production/work-orders-open" ||
                              location.pathname === "/production/work-orders-planned" ||
                              location.pathname === "/production/work-orders-pending" ||
                              location.pathname === "/production/work-orders-wip" ||
                              location.pathname === "/production/work-orders-completed"
                              ? "active" : ""
                              } `}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>Work Orders</p>
                          </Link>
                        </div>
                        : ""}
                      {/* <div className="sidebar-item">
                    <Link to="/production/sub-contract"
                      className={`sidebar-nav-link subMenu_item ${
                        location.pathname === "/production/sub-contract" || 
                        location.pathname === "/production/sub-contract-approve-pending" || 
                        location.pathname === "/production/sub-contract-approve" ||
                        location.pathname === "/production/sub-contract-testing-pending" ||
                        location.pathname === "/production/sub-contract-canceled" || 
                        location.pathname === "/production/sub-contract-repair-pending" 
                        ? "active" : ""
                        } `}
                    >
                     
                      <p>Sub Contract</p>
                    </Link>
                  </div> */}
                    </div>
                  </div>
                </div>
                : ""}
              {/* inventory end */}
              {/* Buyers & Suppliers start */}
              {MatchPermission(["Buyers & Suppliers"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/vendors" ||
                        location.pathname === "/add-new-vendor" ||
                        location.pathname === "/customers"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Buyers&Suppliers"
                      aria-expanded="false"
                      aria-controls="Buyers&Suppliers"
                    >
                      {/* <i className="sidebar-nav-icon fas fa-hands-helping" /> */}
                       <span className="sidebar-nav-icon">🤝</span>
                      <p>Buyers & Suppliers</p>
                    </button>
                  </div>
                  <div
                    id="Buyers&Suppliers"
                    className={`accordion-collapse collapse ${location.pathname === "/customers" ||
                      location.pathname === "/add-new-vendor" ||
                      location.pathname === "/vendors"
                      ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        <li className="sidebar-item">
                          <Link
                            to="/vendors"
                            className={`sidebar-nav-link ${location.pathname === "/vendors" ? "active" : ""
                              }`}
                          >
                            {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                            <p>Suppliers</p>
                          </Link>
                        </li>
                        <li className="sidebar-item">
                          <Link
                            to="/customers"
                            className={`sidebar-nav-link ${location.pathname === "/customers"
                              ? "active"
                              : ""
                              }`}
                          >
                            <p>Buyers</p>
                          </Link>
                        </li>
                        {/* <li className="sidebar-item">
                      <Link
                        to="/add-new-vendor"
                        className={`sidebar-nav-link ${location.pathname === "/add-new-vendor"
                          ? "active"
                          : ""
                          }`}
                      >
                        <p>Add Single Buyers</p>
                      </Link>
                    </li> */}
                        {/* <li className="sidebar-item">
                      <Link
                        to="/add-new-customer"
                        className={`sidebar-nav-link ${location.pathname === "/add-new-customer"
                          ? "active"
                          : ""
                          }`}
                      >
                        <p>Add Single Supplier</p>
                      </Link>
                    </li> */}
                      </ul>


                    </div>
                  </div>
                </div>
                : ""}
              {/*  Buyers & Suppliers end  */}

              {/* Payments start */}
              {/* <div className="accordion-item">
              <div className="accordion-header sidebar-item">
                <button
                  className={`accordion-button ${
                    location.pathname === "/payment/document/receivable" ||
                    location.pathname === "/payment/document/payable" ||
                    location.pathname === "/payment/document/receive" ||
                    location.pathname === "/payment/document/paid" ||
                    location.pathname === "/payment/document/overdue-receivable" ||
                    location.pathname === "/payment/document/overdue-payable" ||
                    location.pathname === "/payment/company-ledger/all" ||
                    location.pathname === "/payment/receipts/received" ||
                    location.pathname === "/payment/payments/paid" ||
                    location.pathname === "/payment/document/tax-invoice/id" ||
                    location.pathname === "/document/grn/create/id" ||
                    location.pathname === "/document/inward-document/create/id" ||
                    location.pathname === "/document/tax-invoice-document/create/id" ||
                    location.pathname === "/document/proforma-invoice-document/create/id" ||
                    location.pathname === "/document/receipt-voucher-document/create/id" ||
                    location.pathname === "/document/purchase-return-challan-document/create/id" ||
                    location.pathname === "/transaction/transaction-details/id" ||
                    location.pathname === "/payment/document/purchase-order/id" ||
                    location.pathname === "/opening-balance" ||
                    location.pathname === "/payment/document/log-details" ||
                    location.pathname === "/document/cn/create" ||
                    location.pathname === "/document/dn/create" ||
                    location.pathname === "/payment/document/inward-document/id"
                    ? ""
                    : "collapsed"
                    } sidebar-nav-link`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#Payments"
                  aria-expanded="false"
                  aria-controls="Payments"
                >
                  <i className="sidebar-nav-icon fas fa-wallet" />
                  <p>Payments</p>
                </button>
              </div>
              <div
                id="Payments"
                className={`accordion-collapse collapse ${                
                location.pathname === "/payment/document/receivable" ||
                location.pathname === "/payment/document/payable" ||
                location.pathname === "/payment/document/receive" ||
                location.pathname === "/payment/document/paid" ||
                location.pathname === "/payment/document/overdue-receivable" ||
                location.pathname === "/payment/document/overdue-payable" ||
                location.pathname === "/payment/company-ledger/all" ||
                location.pathname === "/payment/receipts/received" ||
                location.pathname === "/payment/payments/paid" ||
                location.pathname === "/payment/document/tax-invoice/id" ||
                location.pathname === "/document/grn/create/id" ||
                location.pathname === "/document/inward-document/create/id" ||
                location.pathname === "/document/tax-invoice-document/create/id" ||
                location.pathname === "/document/proforma-invoice-document/create/id" ||
                location.pathname === "/document/receipt-voucher-document/create/id" ||
                location.pathname === "/document/purchase-return-challan-document/create/id" ||
                location.pathname === "/transaction/transaction-details/id" ||
                location.pathname === "/payment/document/purchase-order/id" ||
                location.pathname === "/opening-balance" ||
                location.pathname === "/payment/document/log-details" ||
                location.pathname === "/document/cn/create" ||
                location.pathname === "/document/dn/create" ||
                location.pathname === "/payment/document/inward-document/id"
                 ? "show" : ""
                  } `}
                data-bs-parent="#menuAccordian"
              >
                <div className="accordion-body">

                  <div
                    className="accordion menu-accordian"
                    id="submenuAccordian"
                  >
                    
                    <div className="accordion-header sidebar-item">
                      <button
                        className={`accordion-button submenu ${
                        location.pathname === "/payment/document/receivable" ||
                        location.pathname === "/payment/document/payable" ||
                        location.pathname === "/payment/document/receive" ||
                        location.pathname === "/payment/document/paid" ||
                        location.pathname === "/payment/document/overdue-receivable" ||
                        location.pathname === "/payment/document/overdue-payable" ||
                        location.pathname === "/payment/document/tax-invoice/id" ||
                        location.pathname === "/document/grn/create/id" ||
                        location.pathname === "/document/inward-document/create/id" ||
                        location.pathname === "/document/tax-invoice-document/create/id" ||
                        location.pathname === "/document/proforma-invoice-document/create/id" ||
                        location.pathname === "/document/receipt-voucher-document/create/id" ||
                        location.pathname === "/document/purchase-return-challan-document/create/id" ||
                        location.pathname === "/transaction/transaction-details/id" ||
                        location.pathname === "/payment/document/purchase-order/id" ||
                        location.pathname === "/payment/document/log-details" ||
                        location.pathname === "/document/cn/create" ||
                        location.pathname === "/document/dn/create" ||
                        location.pathname === "/payment/document/inward-document/id"
                        ? "" : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#PaymentDocuments"
                        aria-expanded="false"
                        aria-controls="PaymentDocuments"
                      >                        
                        <p>Documents</p>
                      </button>
                    </div>
                    <div
                      id="PaymentDocuments"
                      className={`accordion-collapse collapse ${
                        location.pathname === "/payment/document/receivable" ||
                        location.pathname === "/payment/document/payable" ||
                        location.pathname === "/payment/document/receive" ||
                        location.pathname === "/payment/document/paid" ||
                        location.pathname === "/payment/document/overdue-receivable" ||
                        location.pathname === "/payment/document/overdue-payable" ||
                        location.pathname === "/payment/document/tax-invoice/id" ||
                        location.pathname === "/document/grn/create/id" ||
                        location.pathname === "/document/inward-document/create/id" ||
                        location.pathname === "/document/tax-invoice-document/create/id" ||
                        location.pathname === "/document/proforma-invoice-document/create/id" ||
                        location.pathname === "/document/receipt-voucher-document/create/id" ||
                        location.pathname === "/document/purchase-return-challan-document/create/id" ||
                        location.pathname === "/transaction/transaction-details/id" ||
                        location.pathname === "/payment/document/purchase-order/id" ||
                        location.pathname === "/payment/document/log-details" ||
                        location.pathname === "/document/cn/create" ||
                        location.pathname === "/document/dn/create" ||
                        location.pathname === "/payment/document/inward-document/id"

                      ? "show" : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/receivable"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/receivable"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Receivable</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/payable"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/payable"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Payable</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/receive"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/receive"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Received</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/paid"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/paid"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Paid</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/overdue-receivable"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/overdue-receivable"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Overdue Receivable</p>
                            </Link>
                          </li>
                          <li className="sidebar-item">
                            <Link
                              to="/payment/document/overdue-payable"
                              className={`sidebar-nav-link ${location.pathname === "/payment/document/overdue-payable"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Overdue Payable</p>
                            </Link>
                          </li>

                        </ul>
                      </div>
                    </div>
                   
                    <div className="accordion-header sidebar-item">
                      <button
                        className={`accordion-button submenu ${
                        location.pathname === "/payment/company-ledger/all" 
                        ? "" : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#CompanyLedger"
                        aria-expanded="false"
                        aria-controls="CompanyLedger"
                      >                        
                        <p>Company Ledger</p>
                      </button>
                    </div>
                    <div
                      id="CompanyLedger"
                      className={`accordion-collapse collapse ${
                        location.pathname === "/payment/company-ledger/all" 
                         ? "show" : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">
                          <li className="sidebar-item">
                            <Link
                              to="/payment/company-ledger/all"
                              className={`sidebar-nav-link ${location.pathname === "/payment/company-ledger/all"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>All</p>
                            </Link>
                          </li>

                        </ul>
                      </div>
                    </div>
                   
                    <div className="accordion-header sidebar-item">
                      <button
                        className={`accordion-button submenu ${
                        location.pathname === "/payment/payments/paid" 
                        ? "" : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#PaymentPayments"
                        aria-expanded="false"
                        aria-controls="PaymentPayments"
                      >                        
                        <p>Payments</p>
                      </button>
                    </div>
                    <div
                      id="PaymentPayments"
                      className={`accordion-collapse collapse ${
                        location.pathname === "/payment/payments/paid" 
                         ? "show" : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">                          
                          <li className="sidebar-item">
                            <Link
                              to="/payment/payments/paid"
                              className={`sidebar-nav-link ${location.pathname === "/payment/payments/paid"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Paid</p>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="accordion-header sidebar-item">
                      <button
                        className={`accordion-button submenu ${
                        location.pathname === "/payment/receipts/received"
                        ? "" : "collapsed"
                          } sidebar-nav-link`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#PaymentReceipt"
                        aria-expanded="false"
                        aria-controls="PaymentReceipt"
                      >                        
                        <p>Receipts</p>
                      </button>
                    </div>
                    <div
                      id="PaymentReceipt"
                      className={`accordion-collapse collapse ${
                        location.pathname === "/payment/receipts/received"
                         ? "show" : ""
                        } `}
                      data-bs-parent="#submenuAccordian"
                    >
                      <div className="accordion-body">
                        <ul className="sidebar-submenu">
                          <li className="sidebar-item">
                            <Link
                              to="/payment/receipts/received"
                              className={`sidebar-nav-link ${location.pathname === "/payment/receipts/received"
                                ? "active"
                                : ""
                                }`}
                            >                              
                              <p>Received</p>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div> */}
              {/* Payments end  */}

              {/* pos start */}
              {MatchPermission(["POS"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/pos" || location.pathname === "/pos/order-status"
                        || location.pathname === "/pos/view-details" || location.pathname === "/pos/sales-data" || location.pathname === "/pos/company-creation" ? "" : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#pos"
                      aria-expanded="false"
                      aria-controls="pos"
                    >
                      {/* <i className="sidebar-nav-icon fas fa-cart-arrow-down" /> */}
                      <span className="sidebar-nav-icon">📠</span>
                      <p>POS</p>
                    </button>
                  </div>
                  <div
                    id="pos"
                    className={`accordion-collapse collapse ${location.pathname === "/pos" || location.pathname === "/pos/order-status" || location.pathname === "/pos/view-details" || location.pathname === "/pos/sales-data" || location.pathname === "/pos/company-creation" ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        <li className="sidebar-item">
                          <Link
                            to="/reports/pos-dashboard"
                            className={`sidebar-nav-link ${location.pathname === "/reports/pos-dashboard" ? "active" : ""
                              }`}
                          >
                            <p>Dashboard</p>
                          </Link>
                        </li>
                        <li className="sidebar-item">
                          <Link
                            to="/pos"
                            className={`sidebar-nav-link ${location.pathname === "/pos" || location.pathname === "/pos/view-details" ? "active" : ""
                              }`}
                          >
                            <p>POS</p>
                          </Link>
                        </li>
                        <li className="sidebar-item">
                          <Link
                            to="/pos/order-status"
                            className={`sidebar-nav-link ${location.pathname === "/pos/order-status" ? "active" : ""
                              }`}
                          >
                            <p>Order Status</p>
                          </Link>
                        </li>
                        {/* <li className="sidebar-item">
                      <Link
                        to="/pos/sales-data"
                        className={`sidebar-nav-link ${location.pathname === "/pos/sales-data" ? "active" : ""
                          }`}
                      >
                        <p>Sales Data</p>
                      </Link>
                    </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
                : ""}
              {/* pos end  */}

              {/* Reports start */}
              {MatchPermission(["Report"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/reports" ||
                        location.pathname === "/add-new-vendor" ||
                        location.pathname === "/customers"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#reports"
                      aria-expanded="false"
                      aria-controls="reports"
                    >
                      {/* <i className="sidebar-nav-icon fas fa-chart-area" /> */}
                      <span className="sidebar-nav-icon">📊</span>
                      <p>Reports</p>
                    </button>
                  </div>
                  <div
                    id="reports"
                    className={`accordion-collapse collapse ${location.pathname === "/reports"
                      ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        {MatchPermission(["Inventory Master Reports"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/reports"
                              className={`sidebar-nav-link ${location.pathname === "/reports" ? "active" : ""
                                }`}
                            >
                              <p>Inventory Master Reports</p>
                            </Link>
                          </li>
                          : ""}
                        {MatchPermission(["Purchase Reports"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/reports"
                              className={`sidebar-nav-link ${location.pathname === "/reports"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Purchase Reports</p>
                            </Link>
                          </li>
                          : ""}
                        {MatchPermission(["Sales Reports"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/reports"
                              className={`sidebar-nav-link ${location.pathname === "/reports"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Sales Reports</p>
                            </Link>
                          </li>
                          : ""}
                        {MatchPermission(["Combined Reports"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/reports"
                              className={`sidebar-nav-link ${location.pathname === "/reports"
                                ? "active"
                                : ""
                                }`}
                            >
                              <p>Combined Reports</p>
                            </Link>
                          </li>
                          : ""}
                      </ul>


                    </div>
                  </div>
                </div>
                : ""}
              {/*  Reports end  */}
              {/* Settings start */}
              {MatchPermission(["Settings"]) ?
                <div className="accordion-item">
                  <div className="accordion-header sidebar-item">
                    <button
                      className={`accordion-button ${location.pathname === "/department" ||
                        location.pathname === "/notification-setting" ||
                        location.pathname === "/company-info" ||
                        location.pathname === "/office-timing" ||
                        location.pathname === "/whatsapp-setting" ||
                        location.pathname === "/settings/inventory/warehouses" ||
                        location.pathname === "/settings/inventory/barcode" ||
                        location.pathname === "/settings/gst/eway-bill-api-account" ||
                        location.pathname === "/settings/inventory/warehouses" ||
                        location.pathname === "/settings/inventory/barcode" ||
                        location.pathname === "/settings/inventory/master-uom" ||
                        location.pathname === "//settings/inventory/entry-into-store" ||
                        location.pathname === "/settings/inventory/default-approval" ||
                        location.pathname === "/settings/gst/eway-bill-api-account" ||
                        location.pathname === "/settings/gst/einvoice-api-account" ||
                        location.pathname === "settings/gst/einvoice-api-account"
                        ? ""
                        : "collapsed"
                        } sidebar-nav-link`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#Settings"
                      aria-expanded="false"
                      aria-controls="Settings"
                    >
                      {/* <i className="sidebar-nav-icon fas fa-cog" /> */}
                      <span className="sidebar-nav-icon">🛠️</span>
                      <p>Settings</p>
                    </button>
                  </div>
                  <div
                    id="Settings"
                    className={`accordion-collapse collapse ${
                      // location.pathname === "/customers" ||
                      location.pathname === "/whatsapp-setting" ||
                        location.pathname === "/notification-setting" ||
                        location.pathname === "/department" ||
                        location.pathname === "/office-timing" ||
                        location.pathname === "/modules" ||
                        location.pathname === "/role" ||
                        location.pathname === "/permission" ||
                        location.pathname === "/settings/inventory/warehouses" ||
                        location.pathname === "/settings/inventory/barcode" ||
                        location.pathname === "/settings/inventory/master-uom" ||
                        location.pathname === "/settings/inventory/default-approval" ||
                        location.pathname === "/settings/inventory/entry-into-store" ||
                        location.pathname === "/settings/gst/eway-bill-api-account" ||
                        location.pathname === "/settings/gst/einvoice-api-account" ||
                        location.pathname === "/company-info" ||
                        location.pathname === "/settings/user"

                        ? "show" : ""
                      } `}
                    data-bs-parent="#menuAccordian"
                  >
                    <div className="accordion-body">
                      <ul className="sidebar-submenu">
                        {MatchPermission(["General Settings"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/company-info"
                              className={`sidebar-nav-link ${location.pathname === "/company-info" ? "active" : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>General Settings</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["User List"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/settings/user"
                              className={`sidebar-nav-link ${location.pathname === "/settings/user"
                                ? "active"
                                : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>User List</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Whatsapp Setting"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/whatsapp-setting"
                              className={`sidebar-nav-link ${location.pathname === "/whatsapp-setting"
                                ? "active"
                                : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>Whatsapp Setting</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Notification Setting"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/notification-setting"
                              className={`sidebar-nav-link ${location.pathname === "/notification-setting"
                                ? "active"
                                : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>Notification Setting</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Department"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/department"
                              className={`sidebar-nav-link ${location.pathname === "/department" ? "active" : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>Department</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Office Timing"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/office-timing"
                              className={`sidebar-nav-link ${location.pathname === "/office-timing" ? "active" : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>Office Timing</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Modules"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/modules"
                              className={`sidebar-nav-link ${location.pathname === "/modules" ? "active" : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>Modules</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Role"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/role"
                              className={`sidebar-nav-link ${location.pathname === "/role" ? "active" : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>Role</p>
                            </Link>
                          </li>
                          : null}
                        {MatchPermission(["Permission"]) ?
                          <li className="sidebar-item">
                            <Link
                              to="/permission"
                              className={`sidebar-nav-link ${location.pathname === "/permission" ? "active" : ""
                                }`}
                            >
                              {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                              <p>Permission</p>
                            </Link>
                          </li>
                          : null}
                      </ul>

                      <div
                        className="accordion menu-accordian"
                        id="submenuAccordian"
                      >
                        {/* management */}
                        {MatchPermission(["Inventory Settings"]) ?
                          <div className="accordion-header sidebar-item">
                            <button
                              className={`accordion-button submenu ${location.pathname === "/settings/inventory/barcode" ||
                                location.pathname === "/settings/inventory/master-uom" ||
                                location.pathname === "/settings/inventory/entry-into-store" ||
                                location.pathname === "/settings/inventory/default-approval" ||
                                location.pathname === "/settings/inventory/warehouses"
                                ? "" : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#Inventorysettings"
                              aria-expanded="false"
                              aria-controls="Inventorysettings"
                            >
                              {/* <i className="sidebar-nav-icon fi fi-sr-inventory-alt" /> */}
                              <p>Inventory</p>
                            </button>
                          </div>
                          : ""}
                        {MatchPermission(["Inventory Settings"]) ?
                          <div
                            id="Inventorysettings"
                            className={`accordion-collapse collapse ${location.pathname === "/settings/inventory/barcode" ||
                              location.pathname === "/settings/inventory/master-uom" ||
                              location.pathname === "/settings/inventory/entry-into-store" ||
                              location.pathname === "/settings/inventory/default-approval" ||
                              location.pathname === "/settings/inventory/warehouses"
                              ? "show" : ""
                              } `}
                            data-bs-parent="#submenuAccordian"
                          >
                            <div className="accordion-body">
                              <ul className="sidebar-submenu">
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/warehouses"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/warehouses"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>Stores</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/barcode"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/barcode"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>Barcode</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/master-uom"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/master-uom"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>Unit of Measurement</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/entry-into-store"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/entry-into-store"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>Document Setting</p>
                                  </Link>
                                </li>

                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/inventory/default-approval"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/inventory/default-approval"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>Default Approval</p>
                                  </Link>
                                </li>

                              </ul>
                            </div>
                          </div>
                          : ""}
                        {/* management end*/}
                        {/* GST API */}
                        {MatchPermission(["GST API Settings"]) ?
                          <div className="accordion-header sidebar-item">
                            <button
                              className={`accordion-button submenu ${location.pathname === "/settings/gst/einvoice-api-account" ||
                                location.pathname === "/settings/gst/eway-bill-api-account" ||
                                location.pathname === "/gst"
                                ? "" : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#GST"
                              aria-expanded="false"
                              aria-controls="GST"
                            >
                              {/* <i className="sidebar-nav-icon fi fi-sr-system-cloud" /> */}
                              <p>GST API</p>
                            </button>
                          </div>
                          : ""}
                        {MatchPermission(["GST API Settings"]) ?
                          <div
                            id="GST"
                            className={`accordion-collapse collapse ${location.pathname === "/settings/gst/eway-bill-api-account" ||
                              location.pathname === "/settings/gst/eway-bill-api-account" ||
                              location.pathname === "/settings/gst/einvoice-api-account" ||
                              location.pathname === "/settings/gst/einvoice-api-account"
                              ? "show" : ""
                              } `}
                            data-bs-parent="#submenuAccordian"
                          >
                            <div className="accordion-body">
                              <ul className="sidebar-submenu">
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/gst/eway-bill-api-account"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/gst/eway-bill-api-account"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>E-Way Bill API</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/gst/einvoice-api-account"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/gst/einvoice-api-account"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>E Invoice API</p>
                                  </Link>
                                </li>


                              </ul>
                            </div>
                          </div>
                          : ""}
                        {/* GST API end*/}
                        {/* POS */}
                        {MatchPermission(["POS Settings"]) ?
                          <div className="accordion-header sidebar-item">
                            <button
                              className={`accordion-button submenu ${location.pathname === "/settings/pos/gateway" || location.pathname === "/settings/pos/order"
                                ? "" : "collapsed"
                                } sidebar-nav-link`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#POS"
                              aria-expanded="false"
                              aria-controls="POS"
                            >
                              {/* <i className="sidebar-nav-icon fi fi-sr-system-cloud" /> */}
                              <p>POS</p>
                            </button>
                          </div>
                          : ""}
                        {MatchPermission(["POS Settings"]) ?
                          <div
                            id="POS"
                            className={`accordion-collapse collapse ${location.pathname === "/settings/pos/gateway" || location.pathname === "/settings/pos/order"
                              ? "show" : ""
                              } `}
                            data-bs-parent="#submenuAccordian"
                          >
                            <div className="accordion-body">
                              <ul className="sidebar-submenu">

                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/pos/gateway"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/pos/gateway"
                                      ? "active"
                                      : ""
                                      }`}
                                  >
                                    {/* <i className="sidebar-nav-icon far fa-dot-circle"></i> */}
                                    <p>Payment Gateway</p>
                                  </Link>
                                </li>
                                <li className="sidebar-item">
                                  <Link
                                    to="/settings/pos/order"
                                    className={`sidebar-nav-link ${location.pathname === "/settings/pos/order"
                                      ? "active"
                                      : ""
                                      }`}
                                  >

                                    <p>Order Settings</p>
                                  </Link>
                                </li>


                              </ul>
                            </div>
                          </div>
                          : ""}


                        {userDetails.position === "Owner" ?
                          <ul className="sidebar-submenu">
                            <li className="sidebar-item">
                              <Link
                                to="/company-management"
                                className={`sidebar-nav-link ${location.pathname === "/company-management" ? "active" : ""}`}
                              >
                                {/* <i className="sidebar-nav-icon far fa-dot-circle" /> */}
                                <p>Company Management</p>
                              </Link>
                            </li>
                          </ul> : ""
                        }
                        {/* POS end*/}
                      </div>

                    </div>
                  </div>
                </div>
                : ""}
              {/* Settings end  */}
              {/* <div className="accordion-item">
              <div className="accordion-header sidebar-item">
                <button
                  className={`accordion-button ${location.pathname === "/users" ? "" : "collapsed"
                    } sidebar-nav-link`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#menuuser"
                  aria-expanded="false"
                  aria-controls="menuuser"
                >
                  <i className="sidebar-nav-icon fas fa-user" />
                  <p>User</p>
                </button>
              </div>
              <div
                id="menuuser"
                className={`accordion-collapse collapse ${location.pathname === "/users" ? "show" : ""
                  } `}
                data-bs-parent="#menuAccordian"
              >
                <div className="accordion-body">
                  <ul className="sidebar-submenu">
                    <li className="sidebar-item">
                      <Link
                        to="/users"
                        className={`sidebar-nav-link ${location.pathname === "/users" ? "active" : ""
                          }`}
                      >                        
                        <p>All Users</p>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div> */}
            </div>
          </nav>
        </div>
        {/* /.sidebar-menu */}
        
      </div>
      {/* /.sidebar */}
    </aside>
  );
}

export default Sidebar;
