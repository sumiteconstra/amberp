import React, { useState, useEffect } from "react";
import {
  Alert,
  Dropdown,
  Modal,
  OverlayTrigger,
  Popover,
  Tooltip
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { Table, Input, Button, Checkbox, Form } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import Select from "react-select";
import { width } from "@mui/system";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import InventoryMasterBarcodeHeader from "./inventoryHeader";
import { UserAuth } from "../auth/Auth";
import { DropDownList } from '@progress/kendo-react-dropdowns';
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import ItemMasterStatusBar from "./itemMaster/ItemMasterStatusBar";
import InventoryMasterPageTopBar from "./itemMaster/InventoryMasterPageTopBar";
import AddMultipleItemsModal from "../CommonComponent/AddMultipleItemsModal";
import DeleteMultipleItemsModal from "../CommonComponent/DeleteMultipleItemsModal";
import TallyIntegrationModal from "../CommonComponent/TallyIntegrationModal";
import ExploreAllFeaturesModal from "../CommonComponent/ExploreAllFeaturesModal";
const { Option } = Select;
function InventoryMaster() {
  //modal transfer qty only
  const [showqty, setShowqty] = useState(false);
  const handleCloseqty = () => setShowqty(false);
  const handleShowqty = () => setShowqty(true);

  //modal transfer qty details
  const [show, setShow] = useState(false);
  const StockTransferClose = () => setShow(false);
  const StockTransfer = () => setShow(true);

  const [showupdate, setShowupdate] = useState(false);
  const StockUpdateClose = () => setShowupdate(false);
  const StockUpdate = () => setShowupdate(true);
  const [fromStore, setFromStore] = useState(null);
  const [toStore, setToStore] = useState(null);
  const [getitemId, setitemId] = useState(null);
  const [stores, setStores] = useState([]);

  const [productData, setProductData] = useState(null);
  const [selectedStore, setSelectedStore] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [changeQuantity, setChangeQuantity] = useState(0);
  const [finalQuantity, setFinalQuantity] = useState(0);
  const [getActualQuantity, setActualQuantity] = useState(0);
  const [finalUoM, setFinalUoM] = useState(0);
  const [totalStoreWiseStock, setTotalStoreWiseStock] = useState(0);
  const [storeWiseStock, setStoreWiseStock] = useState({});
  const [itemId, setItemId] = useState(null);
  const [getButtonClassNamePlus, setButtonClassNamePlus] = useState('');
  const [getButtonClassNameNeg, setButtonClassNameNeg] = useState('');
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [rowErrors, setRowErrors] = useState([]);


  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };


  //end bulk upload


  // Fetch stores

  useEffect(() => {
    // Fetch stores
    const fetchStores = async () => {
      const result = await PrivateAxios.get("/warehousesselect");
      // const filteredStores = result.data.data.filter(
      //   (store) => store.store_type === "In-Stock Stores"
      // );
      setStores(result.data.data);
    };
    fetchStores();
  }, []);


  // Function to fetch product data and calculate store-wise stock
  const getQTY = async (val, itemId) => {
    try {
      const response = await PrivateAxios.get(`product/select_product/${val}`);
      const data = response.data.data;
      setProductData(data);
      setitemId(itemId);
      setFinalUoM(data.unit);
      setButtonClassNamePlus('active')
      setButtonClassNameNeg('')
      const storeWiseStockTemp = {};

      // Iterate through the TrackProductStock array and calculate stock for each store
      data.TrackProductStock.forEach((stock) => {
        if (!storeWiseStockTemp[stock.store_id]) {
          storeWiseStockTemp[stock.store_id] = 0;
        }

        // Add stock if status_in_out === 1 (stock added)
        if (stock.status_in_out == 1) {
          storeWiseStockTemp[stock.store_id] += stock.quantity_changed;
        }

        // Subtract stock if status_in_out === 0 (stock removed)
        if (stock.status_in_out == 0) {
          storeWiseStockTemp[stock.store_id] -= stock.quantity_changed;
        }
      });

      // Set initial stock data and selected store
      if (Object.keys(storeWiseStockTemp).length > 0) {
        const firstStoreId = Object.keys(storeWiseStockTemp)[0];
        setSelectedStore(firstStoreId);
        setCurrentStock(storeWiseStockTemp[firstStoreId]);
        setFinalQuantity(storeWiseStockTemp[firstStoreId]);
      }

      setStoreWiseStock(storeWiseStockTemp);

      // Calculate total quantity across all stores
      const totalQuantity = Object.values(storeWiseStockTemp).reduce(
        (acc, quantity) => acc + quantity,
        0
      );
      console.log("Total quantity across all stores:", totalQuantity);
    } catch (err) {
      console.error("Error fetching product data:", err);
    }
  };

  // Handle store change
  const handleStoreChange = (selectedOption) => {
    if (selectedOption) {
      const selectedStoreId = selectedOption.id;
      setSelectedStore(selectedStoreId);

      // Find the corresponding store's stock
      const selectedStoreStock = productData.TrackProductStock.find(
        (stock) => stock.store_id === selectedStoreId
      );

      // Calculate total stock in (status_in_out === "1") and stock out (status_in_out === "0")
      const totalStoreStockIn = productData.TrackProductStock.filter(
        (stock) =>
          stock.store_id === selectedStoreId && stock.status_in_out == "1"
      ).reduce((total, stock) => total + stock.quantity_changed, 0);

      const totalStoreStockOut = productData.TrackProductStock.filter(
        (stock) =>
          stock.store_id === selectedStoreId && stock.status_in_out == "0"
      ).reduce((total, stock) => total + stock.quantity_changed, 0);

      // Final total stock is stock in minus stock out
      const finalTotalStock = totalStoreStockIn - totalStoreStockOut;

      // Update the changeQuantity field with the calculated final stock
      setChangeQuantity(0);
      setCurrentStock(finalTotalStock);
      setFinalQuantity(finalTotalStock);
    } else {
      setCurrentStock(0);
      setFinalQuantity(0);
      setChangeQuantity(0);
    }
  };

  // Handle change quantity input
  const handleChangeQuantity = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setChangeQuantity(value);

    // const value = e.target.value;
    // // Allow only valid decimal numbers
    // if (/^\d*\.?\d*$/.test(value)) {
    //   setChangeQuantity(value);
    // }

    let updatedFinalQuantity;

    if (getButtonClassNamePlus === 'active') {
      updatedFinalQuantity = parseInt(currentStock) + value;
    } else if (getButtonClassNameNeg === 'active') {
      updatedFinalQuantity = parseInt(currentStock) - value;
    }

    // Prevent negative final quantity
    if (updatedFinalQuantity < 0) {
      ErrorMessage("Final quantity cannot be negative.");
      setFinalQuantity(0);
      setActualQuantity(updatedFinalQuantity);
    } else {
      setFinalQuantity(updatedFinalQuantity);
      setActualQuantity(updatedFinalQuantity);
    }
  };

  const incrementQuantity = () => {
    setButtonClassNamePlus('active');
    setButtonClassNameNeg('');

    const updatedFinalQuantity = parseInt(currentStock) + parseInt(changeQuantity || 0);

    if (updatedFinalQuantity < 0) {
      ErrorMessage("Final quantity cannot be negative.");
      setFinalQuantity(0);
      setActualQuantity(updatedFinalQuantity);
    } else {
      setFinalQuantity(updatedFinalQuantity);
      setActualQuantity(updatedFinalQuantity);
    }
  };

  const decrementQuantity = () => {
    setButtonClassNamePlus('');
    setButtonClassNameNeg('active');

    const updatedFinalQuantity = parseInt(currentStock) - parseInt(changeQuantity || 0);

    if (updatedFinalQuantity < 0) {
      ErrorMessage("Final quantity cannot be negative.");
      setFinalQuantity(0);
      setActualQuantity(updatedFinalQuantity);
    } else {
      setFinalQuantity(updatedFinalQuantity);
      setActualQuantity(updatedFinalQuantity);
    }
  };

  //====================== end QTY Update =====================
  const [dataSource, setDataSource] = useState([
    {
      key: 1,
      itemId: null,
      itemName: null,
      changeQuantity: 0,
      finalQuantity: "",
      uom: "",
      defaultPrice: 0,
      comment: "",
    },
  ]);
  //stock transfer only
  const handleSubmitStockUpdate = async (e) => {
    e.preventDefault();

    const data = {
      from_store: fromStore.id, // Store the stock is coming from
      to_store: toStore.id, // Store the stock is going to
      transferItems: transferItems.map((item) => ({
        itemID: item.itemID,
        itemName: item.itemName,
        changeQuantity: item.transferQuantity,
        currentQuantity: item.currentQuantity, // Current quantity in the "From Store"
        finalQuantity: item.finalQuantity, // Final quantity in the "To Store"
        defaultPrice: item.defaultPrice,
        comment: item.comment || "",
        itemUnit: item.itemUnit,
        AdjustmentType: "StockTransfer",
      })),
    };
    try {
      const response = await PrivateAxios.post(
        "/product/update-stocktransfer",
        data
      );
      if (response.status === 200) {
        SuccessMessage("Stock transfer recorded successfully.");
        //setChangeQuantity(0);
        StockTransferClose();
        fetchData();
      } else {
        ErrorMessage("Error !! Please check again.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // stock update
  const handleSubmitStore = async (e) => {
    e.preventDefault();

    const data = {
      from_store: selectedStore, // Make sure this contains the store information
      transferItems: [
        {
          itemID: productData.id, // Product ID
          itemName: productData.product_name, // Product name
          changeQuantity, // Quantity change from the form
          finalQuantity, // Final quantity in the store
          defaultPrice: productData.product_price, // Default price
          comment, // Any comment from the user (if available)
          itemUnit: finalUoM, // Unit of Measurement
          AdjustmentType: getButtonClassNameNeg === 'active' ? "Out" : "adjustment", // Corrected AdjustmentType logic

        },
      ],
      use_fifo_price: useFIFOPrice, // FIFO price flag if needed
      comment, // Add any additional comments
    };
    try {
      const response = await PrivateAxios.post(
        "/product/update-stockonly",
        data
      );
      if (response.status === 200) {
        SuccessMessage("Store updated successfully.");
        setChangeQuantity(0);
        handleCloseqty();
        fetchData();
      } else {
        console.log(response.status);
        ErrorMessage("Error !! Please check again.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // end stock update

  const [useFIFOPrice, setUseFIFOPrice] = useState(false);
  const [comment, setComment] = useState("");

  const [rows, setRows] = useState([
    { key: 1, itemId: null, itemName: null, productPrice: 0 },
  ]);

  const handleAddItem = () => {
    const newKey = Date.now(); // Generate a unique key
    const newItem = {
      key: newKey,
      itemId: null,
      itemName: "",
      defaultPrice: 0,
      currentQuantity: "",
      finalQuantity: "",
      changeQuantity: 1,
      comment: "",
    };
    setTransferItems([...transferItems, newItem]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      from_store: fromStore,
      to_store: toStore,
      transferItems,
      use_fifo_price: useFIFOPrice,
      comment,
    };
    try {
      const response = await PrivateAxios.post("/product/update-stock", data);
      console.log(response);
      if (response.status === 200) {
        SuccessMessage("Store updated successfully.");
        StockUpdateClose();
        fetchData();
      } else {
        console.log(response.status);
        ErrorMessage("Error !! Please check again.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [products, setProducts] = useState([]);
  const [transferItems, setTransferItems] = useState([
    {
      key: 1,
      itemId: null,
      itemName: "",
      defaultPrice: 0,
      currentQuantity: "", // Sample value
      finalQuantity: "", // Sample initial value
      changeQuantity: 1, // Initialize with 0
      comment: "",
      itemID: "",
    },
  ]);

  // Fetch products from API
  const FetchProduct = () => {
    PrivateAxios.get(`/product/all-products/`)
      .then((response) => {
        setProducts(response.data.data);
        const resetItems = transferItems.map((item) => ({
          ...item,
          itemId: null,
          itemName: "",
          currentQuantity: 0, // Reset current quantity
          changeQuantity: "1", // Reset input for change quantity
          finalQuantity: 0, // Reset final quantity
          defaultPrice: 0, // Reset price (optional)
        }));

        setTransferItems(resetItems);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }

  useEffect(() => {
    if (fromStore) {
      FetchProduct()
    } else {
      setProducts([]); // Clear products if no store is selected
    }
  }, [fromStore]);

  // store wise stock selection
  const handleProductChange = (selectedOption, key) => {
    const updatedItems = transferItems.map((item) => {
      if (item.key === key) {
        const selectedProduct = products.find(
          (product) => product.id === selectedOption.value
        );
        const storeSpecificStock = selectedProduct.TrackProductStock.filter(
          (stock) => stock.store_id === fromStore.id
        ) // Filter by store ID
          .reduce((total, stock) => total + stock.quantity_changed, 0); // Sum up quantities

        if (selectedProduct) {
          // Aggregate the total stock for the specific 'fromStore'
          const totalStoreStock = selectedProduct.TrackProductStock.filter(
            (stock) =>
              stock.store_id === fromStore.value && stock.status_in_out == "1"
          ).reduce((total, stock) => total + stock.quantity_changed, 0);

          const totalStoreStockOut = selectedProduct.TrackProductStock.filter(
            (stock) =>
              stock.store_id === fromStore.value && stock.status_in_out == "0"
          ).reduce((total, stock) => total + stock.quantity_changed, 0);

          const finalTotalStock = totalStoreStock - totalStoreStockOut;

          return {
            ...item,
            itemId: selectedProduct.product_code,
            itemName: selectedProduct.product_name,
            currentQuantity: finalTotalStock,
            finalQuantity: finalTotalStock + 1,
            itemUnit: selectedProduct.Masteruom
              ? selectedProduct.Masteruom.unit_name
              : "",
            defaultPrice: selectedProduct.product_price,
            storeId: fromStore.value,
            itemID: selectedProduct.id,
          };
        }
      }
      return item;
    });

    setTransferItems(updatedItems);
  };

  // Handle input change for other fields like Comment
  const handleInputChange = (index, field, value) => {
    const updatedItems = [...transferItems];
    const itemToUpdate = updatedItems[index];
    itemToUpdate[field] = value;
    if (field === "changeQuantity") {
      const currentQuantity = parseFloat(itemToUpdate.currentQuantity) || 0;
      const changeQuantity = parseFloat(value) || 0;
      itemToUpdate.finalQuantity = currentQuantity + changeQuantity;
    }
    const updatedRowErrors = [...rowErrors];

    if (field === "transferQuantity") {
      const transferQuantity = parseInt(value, 10);
      const currentStock = updatedItems[index].currentQuantity;

      if (transferQuantity > currentStock) {
        updatedRowErrors[index] = true; // Mark this row as having an error
        setErrorMessage(
          `Transfer quantity exceeds available stock for item ${updatedItems[index].itemName}`
        );
      } else {
        updatedRowErrors[index] = false; // Clear the error for this row
        setErrorMessage(""); // Clear the error message when valid
      }
    }

    setTransferItems(updatedItems);
    setRowErrors(updatedRowErrors);
    setTransferItems(updatedItems);
  };

  const handleProductChangeUpdate = (selectedOption, key) => {
    const updatedItems = transferItems.map((item) => {
      if (item.key === key) {
        const selectedProduct = products.find(
          (product) => product.id === selectedOption.value
        );

        if (selectedProduct) {
          // Calculate store-specific total stock for the selected store
          const totalStoreStock = selectedProduct.TrackProductStock.filter(
            (stock) =>
              stock.store_id === fromStore.id && stock.status_in_out === 1
          ).reduce((total, stock) => total + stock.quantity_changed, 0);

          const totalStoreStockOut = selectedProduct.TrackProductStock.filter(
            (stock) =>
              stock.store_id === fromStore.id && stock.status_in_out === 0
          ).reduce((total, stock) => total + stock.quantity_changed, 0);
          const finalTotalStockUpdate = totalStoreStock - totalStoreStockOut;
          console.log(finalTotalStockUpdate, 'xxxxxxxxxxxx');

          return {
            ...item,
            itemId: selectedProduct.product_code,
            itemName: selectedProduct.product_name,
            currentQuantity: finalTotalStockUpdate, // Store-specific stock
            finalQuantity: finalTotalStockUpdate, // Set to store-specific stock initially
            itemUnit: selectedProduct.Masteruom
              ? selectedProduct.Masteruom.unit_name
              : "",
            defaultPrice: selectedProduct.product_price,
            storeId: selectedProduct.store_id,
            itemID: selectedProduct.id,
            disableTransferQuantity: totalStoreStock <= item.transferQuantity, // Disable if stock condition is met
          };
        }
      }
      return item;
    });

    setTransferItems(updatedItems);
  };

  // Remove item row (if more than one row)
  const handleRemoveItem = (index) => {
    const updatedItems = transferItems.filter((_, i) => i !== index);
    setTransferItems(
      updatedItems.length
        ? updatedItems
        : [
          {
            key: 1,
            itemId: null,
            itemName: "",
            defaultPrice: 0,
            transferQuantity: 1,
            comment: "",
          },
        ]
    );
  };

  const columnspop = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Item ID",
      dataIndex: "itemId",
      key: "itemId",
      render: (_, record) => (
        <div>
          <div className="custom-select-wrap" style={{ width: 150 }}>
            <DropDownList
              className="custom_keno_dropdown"
              value={record.itemId ? { value: record.itemId, label: record.itemId } : null}
              onChange={(e) => handleProductChangeUpdate(e.value, record.key)} // Adjusting the handler
              data={products.map((product) => ({
                value: product.id,
                label: product.product_code,
              }))}
              textField="label"    // Field to display in the dropdown
              valueField="value"   // Field to bind the value
            />
            {/* <select
              className="form-select"
              value={record.itemId || ""}
              onChange={(e) =>
                handleProductChangeUpdate(
                  { value: e.target.value, label: e.target.options[e.target.selectedIndex].text },
                  record.key
                )
              }
            > 
              <option value="" disabled>
                Select...
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_code}
                </option>
              ))}
            </select>*/}

          </div>
        </div>
      ),
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      render: (_, record) => (
        <Input value={record.itemName} disabled className="form-control" style={{ width: 100 }} />
      ),
    },
    {
      title: "Transfer Quantity",
      dataIndex: "transferQuantity",
      key: "transferQuantity",
      render: (_, record, index) => (
        <div style={{ width: 150 }}>
          <Input
            type="number"
            value={record.transferQuantity}
            onChange={(e) =>
              handleInputChange(index, "transferQuantity", e.target.value)
            }
            style={{ width: "100px", marginRight: "2px", whiteSpace: "nowrap" }}
            disabled={record.disableTransferQuantity}
          />
          <span>{record.itemUnit}</span> <br></br>
          <span className="f-s-12">Current Stock: {record.currentQuantity}</span>
          {/* Show error message if transfer quantity exceeds current stock */}
          {rowErrors[index] && (
            <div style={{ color: "red", marginTop: "5px" }}>
              Transfer quantity exceeds available stock
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Default Price",
      dataIndex: "defaultPrice",
      key: "defaultPrice",
      render: (_, record) => (
        <Input value={record.defaultPrice} disabled className="form-control" style={{ width: 150 }} />
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (_, record, index) => (
        <Input
          type="text"
          value={record.comment}
          onChange={(e) => handleInputChange(index, "comment", e.target.value)}
          style={{ width: 150 }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, __, index) => (
        <Button
          icon={<MinusCircleOutlined />}
          onClick={() => handleRemoveItem(index)}
          disabled={transferItems.length === 1}
        />
      ),
    },
  ];

  //update product model
  const columnspopUpdate = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Item ID",
      dataIndex: "itemId",
      key: "itemId",
      render: (_, record) => (
        <div className="custom-select-wrap" style={{ width: 150 }}>
          <DropDownList
            className="custom_keno_dropdown"
            value={record.itemId ? { value: record.itemId, label: record.itemId } : null}
            onChange={(e) => handleProductChange(e.value, record.key, 'itemId')}
            data={products.map((product) => ({
              value: product.id,
              label: product.product_code,
            }))}
            textField="label"    // Specifies the field to display
            valueField="value"   // Specifies the field to bind the value
          />

        </div>
      ),
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      render: (_, record) => <Input value={record.itemName} disabled style={{ width: 150 }} />,
    },
    {
      title: "Current Quantity",
      dataIndex: "currentQuantity",
      key: "currentQuantity",
      render: (_, record, index) => (
        <div>
          <Input
            disabled
            type="number"
            value={record.currentQuantity}
            onChange={(e) =>
              handleInputChange(index, "currentQuantity", e.target.value)
            }
            style={{ width: 100 }}
          />
        </div>
      ),
    },
    {
      title: "Change Quantity",
      dataIndex: "changeQuantity",
      key: "changeQuantity",
      render: (_, record, index) => (
        <div>
          <Input
            type="number"
            value={record.changeQuantity}
            onChange={(e) =>
              handleInputChange(index, "changeQuantity", e.target.value)
            }
            style={{ width: 100 }}
          />
          <span>{record.itemUnit}</span> {/* Add unit text if needed */}
        </div>
      ),
    },
    {
      title: "Final Quantity",
      dataIndex: "finalQuantity",
      key: "finalQuantity",
      render: (_, record, index) => (
        <Input
          disabled
          type="number"
          value={record.finalQuantity}
          onChange={(e) =>
            handleInputChange(index, "finalQuantity", e.target.value)
          }
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: "Default Price",
      dataIndex: "defaultPrice",
      key: "defaultPrice",
      render: (_, record) => <Input value={record.defaultPrice} style={{ width: 150 }} />,
    },
    {
      title: "Adjustment Type",
      dataIndex: "AdjustmentType",
      key: "AdjustmentType",
      render: (_, record, index) => (
        <select
          className="form-select"
          onChange={(e) =>
            handleInputChange(index, "AdjustmentType", e.target.value)
          }
          value={record.AdjustmentType} // Ensure this matches the value in the record
          style={{ width: 150 }}
        >
          <option value="">Select...</option>
          <option value="Other">Other</option>
          <option value="Stock Return">Stock Return</option>
          <option value="Production">Production</option>
          <option value="Reconciliation">Reconciliation</option>
          <option value="Transfer">Transfer</option>
        </select>
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (_, record, index) => (
        <Input
          type="text"
          value={record.comment}
          onChange={(e) => handleInputChange(index, "comment", e.target.value)}
          style={{ width: 150 }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, __, index) => (
        <Button
          color="danger"
          variant="solid"
          icon={<MinusCircleOutlined />}
          onClick={() => handleRemoveItem(index)}
          disabled={transferItems.length === 1}
        />
      ),
    },
  ];

  // end transfer qty

  const { category, getUomData, getGeneralSettingssymbol } = UserAuth();
  const [sku, setSku] = useState("");
  const [tableData, setTableData] = useState([]);
  const { isLoading, setIsLoading, Logout } = UserAuth();


  const [filteredData, setFilteredData] = useState([]);
  const generateRandomSKU = () => {
    const randomSKU =
       Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setSku(randomSKU);
  };
  const [formData, setFormData] = useState({
    product_name: "",
    product_type: "",
    product_category: "",
  });
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [catProduct, setcategory] = useState([
    { value: "select", label: "-Select-" },
  ]);
  const getTaskData = async (e, data) => {
    if (e.target) {
      var name = e.target.name;
      setFormData({ ...formData, [name]: e.target.value });
    } else {
      setFormData({ ...formData, [data.name]: e.id });
    }
  };
  const [showAddSingleItemModal, setShowAddSingleItemModal] = useState(false);
  const handleCloseAddSingleItemModal = () => setShowAddSingleItemModal(false);
  // add item==================================
  const SubmitData = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      product_code: sku,
      product_name: formData.get("item_name"),
      product_type: formData.get("product_service"),
      batch_number: formData.get("batch_number"),
      sku_product: formData.get("sku_product"),
      type: formData.get("buy_sell_both"),
      unit: formData.get("product_uom"),
      product_category: formData.get("product_category"),
      total_stock: formData.get("current_stock"),
      product_price: formData.get("default_price"),
      hsn_code: formData.get("hsn_code"),
      tax: formData.get("tax"),
      batch_number: formData.get("batch_number"),
      sku_product: formData.get("sku_product"),
      minimum_stock_level: formData.get("minimum_stock_level"),
      maximum_stock_level: formData.get("maximum_stock_level"),
    };
    PrivateAxios.post("product/add", data)
      .then((res) => {
        if (res.status === 200) {
          SuccessMessage("Product added successfully!");
          handleCloseAddSingleItemModal(true);
          fetchData();
        }
      })
      .catch((err) => {
        ErrorMessage(
          "Error: Product can only contain alphanumeric characters and spaces."
        );
      });
  };
  // end add item==================================
  // select Items ===================
  // Fetch products data

  // Fetch products data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await PrivateAxios.get("product/all-products");
      console.log(res);

      const mappedData = res.data.data.map((item, index) => {
        // Safely check if TrackProductStock exists and is an array
        // const filteredStock = Array.isArray(item.TrackProductStock)
        //   ? item.TrackProductStock.filter((stock) => stock.status_in_out == "1" || (stock.status_in_out == "0" && stock.adjustmentType == "Out")) // Keep status_in_out 1 or status_in_out 0 with adjustmentType 'Out'
        //   : [];
        const filteredStock = Array.isArray(item.TrackProductStock)
          ? item.TrackProductStock.filter((stock) => stock.status_in_out == "1" || (stock.status_in_out == "0")) // Keep status_in_out 1 or status_in_out 0 with adjustmentType 'Out'
          : [];
        // Calculate total stock
        const totalStock = filteredStock.reduce((acc, stock) => {
          if (stock.adjustmentType === "StockTransfer") {
            return acc; // Don't add to total if adjustmentType is StockTransfer
          }

          // Subtract quantity_changed if status_in_out is 0 and adjustmentType is 'Out'
          if (stock.status_in_out == "0") {
            return acc - (stock.quantity_changed || 0);
          }

          // Otherwise, add the quantity_changed to totalStock
          return acc + (stock.quantity_changed || 0);
        }, 0);

        return {
          key: index + 1,
          id: item.id || "",
          itemId: item.product_code || "",
          itemName: item.product_name || "",
          product_category: item.product_category,
          sku_product: item.sku_product || "",
          batch_number: item.batch_number || "",
          itemCategory: item.Categories?.title || "",
          currentStock: totalStock || "0", // Total stock calculated from TrackProductStock
          stockChange:
            filteredStock.length > 0
              ? filteredStock[filteredStock.length - 1].quantity_changed
              : 0,
          stockin_out_Status:
            filteredStock.length > 0
              ? filteredStock[filteredStock.length - 1].status_in_out
              : "",
          unit: item.Masteruom?.unit_name || "",
          unitvalue: item.unit || "",
          defaultPrice: item.product_price || "0.00",
          regularBuyingPrice: item.regular_buying_price || "0.00",
          wholesaleBuyingPrice: item.wholesale_buying_price || "0.00",
          regularSellingPrice: item.regular_selling_price || "0.00",
          mrp: item.mrp || "0.00",
          dealerPrice: item.dealer_price || "0.00",
          distributorPrice: item.distributor_price || "0.00",
          stockStatus:
            totalStock > item.minimum_stock_level ? "Optimum Stock" : "Low Stock", // Use totalStock for status
          type: item.type || "",
          hsnCode: item.hsn_code || "",
          tax: item.tax || "",
          reject_stock: item.reject_stock || "0",
          minimumStockLevel: item.minimum_stock_level || "0",
          maximumStockLevel: item.maximum_stock_level || "0",
          safety_stock: item.safety_stock || "0",
          sku_description: item.sku_description || "",
          replenishment_time: item.replenishment_time || "0",
          replenishment_multiplications:
            item.replenishment_multiplications || "0",
          minimum_replenishment: item.minimum_replenishment || "0",
          buffer_size: item.buffer_size || "0",
          attachments: item.attachments || [],
        };
      });

      setTableData(mappedData);
      setFilteredData(mappedData);
    } catch (err) {
      if (err.response?.status === 401) {
        Logout(); // Ensure Logout function is correctly imported and used
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    let filtered = tableData.filter((item) =>
      item.itemName.toLowerCase().includes(searchText.toLowerCase())
    );

    if (filterCategory === "lowStock") {
      filtered = filtered.filter(
        (item) => item.currentStock < item.minimumStockLevel
      );
    } else if (filterCategory === "excessStock") {
      filtered = filtered.filter(
        (item) => item.currentStock > item.maximumStockLevel
      );
    }

    setFilteredData(filtered);
  }, [searchText, filterCategory, tableData]);

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
  };

  const handleClearFilter = () => {
    setFilterCategory(null);
  };
  // Calculate counts for Low Stock and Excess Stock
  const lowStockCount = filteredData.reduce((count, item) => {
    const minimumStockLevel = parseFloat(item.minimumStockLevel);
    const currentStock = parseFloat(item.currentStock);
    return currentStock < minimumStockLevel ? count + 1 : count;
  }, 0);

  const excessStockCount = filteredData.reduce((count, item) => {
    const maximumStockLevel = parseFloat(item.maximumStockLevel);
    const currentStock = parseFloat(item.currentStock);
    return currentStock > maximumStockLevel ? count + 1 : count;
  }, 0);
  // Calculate total default amount
  const totalDefaultPrice = filteredData
    .reduce((total, item) => total + parseFloat(item.defaultPrice), 0)
    .toFixed(2);

  // Table columns configuration
  const columns = [
    {
      title: "Item ID",
      dataIndex: "itemId",
      key: "itemId",
      width: 140,
      sorter: (a, b) => a.itemId.localeCompare(b.itemId),
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      fixed: "left",
      width: 240,
      render: (text, record) => (
        <Link
          to={`/inventory/inventory-master-edit/${record.id}/item-details`}
          state={{ data: record }}
          className="bg-light px-2 py-1 rounded d-inline-block"
        >
          {record.itemName}
          <i className="fas fa-external-link-alt ms-3"></i>

        </Link>
      ),
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: "Item Category",
      dataIndex: "itemCategory",
      key: "itemCategory",
      width: 240,
      sorter: (a, b) => a.itemCategory.localeCompare(b.itemCategory),
    },
    {
      title: "SKU",
      dataIndex: "sku_product",
      key: "sku_product",
      width: 240,
      sorter: (a, b) => a.sku_product.localeCompare(b.sku_product),
    },
    {
      title: "Batch Number",
      dataIndex: "batch_number",
      key: "batch_number",
      width: 240,
      sorter: (a, b) => a.batch_number.localeCompare(b.batch_number),
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      width: 240,
      render: (currentStock, record) => {
        const stockChange = record.stockChange;

        return (
          <div className="d-flex align-items-center justify-content-between">
            <div className="f-s-16 fw-medium w-75 d-flex">
              <div className="text-break">{currentStock}</div>
              {stockChange != 0 && (
                <div
                  className={
                    record.stockin_out_Status > 0
                      ? "text-success f-s-12 ms-2 text-break"
                      : "text-danger f-s-12 ms-2 text-break"
                  }
                >
                  {/* Updated arrow logic */}
                  <i
                    className={`fas fa-arrow-${record.stockin_out_Status > 0 ? "up" : "down"
                      } me-1`}
                  ></i>
                  {stockChange}
                </div>
              )}
            </div>

            <button
              className="icon-btn ms-3"
              onClick={() => {
                handleShowqty(true);
                getQTY(record.id, record.itemId);
              }}
            >
              <i className="fas fa-pen"></i>
            </button>
          </div>
        );
      },
      sorter: (a, b) => a.currentStock - b.currentStock,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      width: 180,
      sorter: (a, b) => a.unit.localeCompare(b.unit),
    },
    {
      title: "Default Price",
      dataIndex: "defaultPrice",
      key: "defaultPrice",
      render: (defaultPrice) => (
        <div>
          {getGeneralSettingssymbol}
          {defaultPrice}
        </div>
      ),
      width: 140,
      sorter: (a, b) => parseFloat(a.defaultPrice) - parseFloat(b.defaultPrice),
    },
    {
      title: "Regular Buying Price",
      dataIndex: "regularBuyingPrice",
      key: "regularBuyingPrice",
      render: (regularBuyingPrice) => (
        <div>
          {getGeneralSettingssymbol}
          {regularBuyingPrice}
        </div>
      ),
      width: 140,
      sorter: (a, b) =>
        parseFloat(a.regularBuyingPrice) - parseFloat(b.regularBuyingPrice),
    },
    {
      title: "Wholesale Buying Price",
      dataIndex: "wholesaleBuyingPrice",
      key: "wholesaleBuyingPrice",
      render: (wholesaleBuyingPrice) => (
        <div>
          {getGeneralSettingssymbol}
          {wholesaleBuyingPrice}
        </div>
      ),
      width: 140,
      sorter: (a, b) =>
        parseFloat(a.wholesaleBuyingPrice) - parseFloat(b.wholesaleBuyingPrice),
    },
    {
      title: "Regular Selling Price",
      dataIndex: "regularSellingPrice",
      key: "regularSellingPrice",
      render: (regularSellingPrice) => (
        <div>
          {getGeneralSettingssymbol}
          {regularSellingPrice}
        </div>
      ),
      width: 140,
      sorter: (a, b) =>
        parseFloat(a.regularSellingPrice) - parseFloat(b.regularSellingPrice),
    },
    {
      title: "MRP",
      dataIndex: "mrp",
      key: "mrp",
      render: (mrp) => (
        <div>
          {getGeneralSettingssymbol}
          {mrp}
        </div>
      ),
      width: 140,
      sorter: (a, b) => parseFloat(a.mrp) - parseFloat(b.mrp),
    },
    {
      title: "Dealer Price",
      dataIndex: "dealerPrice",
      key: "dealerPrice",
      render: (dealerPrice) => (
        <div>
          {getGeneralSettingssymbol}
          {dealerPrice}
        </div>
      ),
      width: 140,
      sorter: (a, b) => parseFloat(a.dealerPrice) - parseFloat(b.dealerPrice),
    },
    {
      title: "Distributor Price",
      dataIndex: "distributorPrice",
      key: "distributorPrice",
      render: (distributorPrice) => (
        <div>
          {getGeneralSettingssymbol}
          {distributorPrice}
        </div>
      ),
      width: 140,
      sorter: (a, b) =>
        parseFloat(a.distributorPrice) - parseFloat(b.distributorPrice),
    },
    {
      title: "Stock Status",
      dataIndex: "stockStatus",
      key: "stockStatus",
      width: 140,
      sorter: (a, b) => a.stockStatus.localeCompare(b.stockStatus),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 140,
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: "HSN Code",
      dataIndex: "hsnCode",
      key: "hsnCode",
      width: 140,
      sorter: (a, b) => a.hsnCode.localeCompare(b.hsnCode),
    },
    {
      title: "Tax",
      dataIndex: "tax",
      key: "tax",
      width: 80,
      sorter: (a, b) => a.tax.localeCompare(b.tax),
      render: (text) => `${text}%`,
    },
    {
      title: "Minimum Stock Level",
      dataIndex: "minimumStockLevel",
      key: "minimumStockLevel",
      width: 180,
      sorter: (a, b) => a.minimumStockLevel - b.minimumStockLevel,
    },
    {
      title: "Maximum Stock Level",
      dataIndex: "maximumStockLevel",
      key: "maximumStockLevel",
      width: 180,
      sorter: (a, b) => a.maximumStockLevel - b.maximumStockLevel,
    },
  ];

  // Update KPI-Driven Priorities Modal start

  const handleShowAddSingleItemModal = () => {
    generateRandomSKU();
    setShowAddSingleItemModal(true);
  };

  const [alternate, setAlternate] = useState(false);
  const alternateModalClose = () => setAlternate(false);
  const alternateModalShow = () => setAlternate(true);

  // remove item
  const [removeItem, setRemoveItem] = useState(false);
  const removeItemModalClose = () => setRemoveItem(false);
  const removeItemModalShow = () => setRemoveItem(true);

  // edit item
  const [editItem, setEditItem] = useState(false);
  const editItemModalClose = () => setEditItem(false);
  const editItemItemModalShow = () => setEditItem(true);
  // edit item
  const [multipleItems, setMultipleItems] = useState(false);
  const multipleItemsModalClose = () => setMultipleItems(false);
  const multipleItemsModalShow = () => setMultipleItems(true);


  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  }

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
  const [orderDeadline, setOrderDeadline] = useState(getCurrentDateTime());
  const [vendorReference, setVendorReference] = useState("");


  const ItemType = [
    { value: 'All', label: 'All' },
    { value: ' Buy', label: ' Buy' },
    { value: ' Sell', label: 'Sell' },
    { value: ' Both', label: 'Both' },

  ]
  const CategoryItem = [
    { value: 'Finished Goods', label: 'Finished Goods' },
    { value: ' Raw Materials', label: ' Raw Materials' },
    { value: ' Semi-finished Goods', label: 'Semi-finished Goods' },
    { value: ' Consumables', label: 'Consumables' },
    { value: ' Bought-out Parts', label: 'Bought-out Parts' },
    { value: ' Trading Goods', label: 'Trading Goods' },
    { value: ' Service', label: 'Service' },
  ]

  // Tally Integration Extension Modal start
  const [showTallyIntegrationExtensionModal, setShowTallyIntegrationExtensionModal] = useState(false);
  const handleCloseTallyIntegrationExtensionModal = () => setShowTallyIntegrationExtensionModal(false);
  const handleShowTallyIntegrationExtensionModal = () => setShowTallyIntegrationExtensionModal(true);

  const faqItems = [
    {
      question: "Will my data be safe?",
      answer: "Absolutely. This chrome extension is created and owned by automybizz. automybizz maintains best-in-industry standards for data protection and privacy."
    },
    {
      question: "What all will I be able to download from Tally?",
      answer: "You'll be able to download your item and counter-party master data from Tally in an excel file. You can then directly upload the excel file on automybizz."
    },
    {
      question: "I'm not an expert on Tally, can I still download the master data?",
      answer: "Yes, absolutely! You just need to ensure Tally is opened in your system. If you still face issues, you can reach out to our chat support and we'd love to help you out!"
    }
  ];
  // Tally Integration Extension Modal end

  // Explore All Features Modal start
  const [showExploreAllFeaturesModal, setShowExploreAllFeaturesModal] = useState(false);
  const handleCloseExploreAllFeaturesModal = () => setShowExploreAllFeaturesModal(false);
  const handleShowExploreAllFeaturesModal = () => setShowExploreAllFeaturesModal(true);

  return (
    <>
      <InventoryMasterPageTopBar />
      <ItemMasterStatusBar />

      <div className="p-4">
        <div className="row">

          <div className="col-12">
            <div className="card mb-2">
              <div className="card-body">
                {/* <div className="d-flex justify-content-between align-items-center flex-wrap"> */}
                {/* <div> */}
                {/* <InventoryMasterBarcodeHeader /> */}
                {/* <div className="d-flex flex-wrap align-items-center">
                  <p className="my-1 me-3 f-s-15 fw-medium text-muted">Showing results for :
                  </p>
                  <label className="badge exp-badge-secondary-light mb-0">Status: Published</label>
                </div> */}
                {/* </div> */}


                {/* <button type='button' onClick={handleShowAddSingleItemModal} className="btn btn-exp-purple">
                <i className="fas fa-plus"></i><span className="ms-2"></span>
              </button> */}
                {/* </div> */}
                {/* <hr /> */}
                <div className="d-flex justify-content-between align-items-center flex-wrap ">
                  {/* <p className="my-1 me-3 fw-medium text-muted">Item Master</p> */}
                  <div className="d-flex gap-2 ms-auto">

                    <Dropdown align="end">
                      <Dropdown.Toggle
                        className="btn btn-outline-primary btn-sm"
                        variant="unset"
                      >
                        <i className="fas fa-cog me-2"></i> Actions
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="dropdown-min-width320">
                        <button type='button' className="dropdown-item" onClick={StockUpdate}>
                          <div className="d-flex align-items-start">
                            <i className="fas fa-exchange-alt me-2 text-primary mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">
                                Update Product Stock
                              </div>
                              <span className="text-muted f-s-12">
                                Add or reduce item quantity in bulk
                              </span>
                            </div>
                          </div>
                        </button>
                        <button type='button' className="dropdown-item" onClick={StockTransfer}>
                          <div className="d-flex align-items-start">
                            <i className="fas fa-arrows-alt-h me-2 text-primary mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">Stock Transfer</div>
                              <span className="text-muted f-s-12">
                                Transfer your items between stores
                              </span>
                            </div>
                          </div>
                        </button>
                        <Dropdown.Item as={Link} to="/category">
                          <div className="d-flex align-items-start">
                            <i className="fas fa-shapes me-2 text-primary mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">
                                Item Category (Add/Edit)
                              </div>
                              <span className="text-muted f-s-12">
                                Create multiple categories for your items
                              </span>
                            </div>
                          </div>
                        </Dropdown.Item>
                        <div className="dropdown-item d-flex align-items-center">
                          <span className="pe-2 text-nowrap text-muted f-s-12">
                            Master Actions
                          </span>
                          <div className="w-100">
                            <Dropdown.Divider />
                          </div>
                        </div>
                        <button type='button' className="dropdown-item" onClick={multipleItemsModalShow}>
                          <div className="d-flex align-items-start">
                            <i className="fas fa-plus me-2 text-primary mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">Add Multiple Items</div>
                              <span className="text-muted f-s-12">
                                Upload hundreds of items at once through excel
                              </span>
                            </div>
                          </div>
                        </button>
                        {/* <button type='button' className="dropdown-item" onClick={editItemItemModalShow}>
                          <div className="d-flex align-items-start">
                            <i className="fas fa-pen me-2 text-primary mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">Edit Items</div>
                              <span className="text-muted f-s-12">
                                Modify items in bulk
                              </span>
                            </div>
                          </div>
                        </button> */}

                        <button type='button' className="dropdown-item" onClick={removeItemModalShow}>
                          <div className="d-flex align-items-start">
                            <i className="fas fa-trash-alt me-2 text-danger mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">Delete Items</div>
                              <span className="text-muted f-s-12">
                                Delete items in bulk
                              </span>
                            </div>
                          </div>
                        </button>
                        <div className="dropdown-item d-flex align-items-center">
                          <span className="pe-2 text-nowrap text-muted f-s-12">
                            Advanced Actions
                          </span>
                          <div className="w-100">
                            <Dropdown.Divider />
                          </div>
                        </div>
                        <button type='button' className="dropdown-item" onClick={alternateModalShow}>
                          <div className="d-flex align-items-start">
                            <i className="fas fa-sync-alt me-2  text-primary mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">Add Alternate UOM</div>
                              <span className="text-muted f-s-12">
                                Bulk Upload Alternate UOM
                              </span>
                            </div>
                          </div>
                        </button>
                        <button type='button' className="dropdown-item" onClick={handleShowTallyIntegrationExtensionModal}>
                          <div className="d-flex align-items-start">
                            <i className="fas fa-file-import me-2  text-primary mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">Import From Tally</div>
                              <span className="text-muted f-s-12">
                                Import master data from Tally
                              </span>
                            </div>
                          </div>
                        </button>
                        <button type='button' className="dropdown-item" onClick={handleShowExploreAllFeaturesModal}>
                          <div className="d-flex align-items-start">
                            <i class="fas fa-compass me-2  text-primary mt-1"></i>
                            <div>
                              <div className="fw-medium f-s-14">Explore All Inventory Features</div>
                              <span className="text-muted f-s-12">
                                Inventory History, Bulk Upload etc.
                              </span>
                            </div>
                          </div>
                        </button>
                      </Dropdown.Menu>
                    </Dropdown>
                    <button type='button' className="btn btn-exp-purple-outline btn-sm" onClick={handleShowAddSingleItemModal}>
                      <i className="fas fa-plus"></i><span className="ms-2">Add Single Item</span>
                    </button>
                  </div>
                </div>


                <div className="inventory-body pt-2">

                  <div className="inventory-body-wrap-body">
                    <div className="inventory-master-filter pt-3 pb-1 ">
                      <div className="row">
                        <div className="col-xl-3 col-sm-6 item" onClick={handleClearFilter}>
                          <div className="card shadow-md cursor-pointer item_card">
                            <div className="card-body d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="my-1 text-white">Stock Value</h6>
                                <span className="ms-auto fs-5 fw-bold text-white">
                                  {getGeneralSettingssymbol}
                                  {totalDefaultPrice}
                                </span>
                              </div>
                              <div className="stockImg">
                                <img src={process.env.PUBLIC_URL + '/assets/images/item-white1.png'} alt="item" className="img" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="col-xl-3 col-sm-6 item"
                          onClick={() => handleCategoryFilter("lowStock")}
                        >
                          <div className="card shadow-md cursor-pointer item_card">
                            <div className="card-body d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="my-1 text-white">Low Stock</h6>
                                <span className="ms-auto fs-5 fw-bold text-white">
                                  {" "}
                                  {lowStockCount}
                                </span>
                              </div>
                              <div className="stockImg">
                                <img src={process.env.PUBLIC_URL + '/assets/images/low-stock.png'} alt="item" className="img" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="col-xl-3 col-sm-6 item"
                          onClick={() => handleCategoryFilter("excessStock")}
                        >
                          <div className="card shadow-md cursor-pointer item_card">
                            <div className="card-body d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="my-1 text-white">Excess Stock</h6>
                                <span className="ms-auto fs-5 fw-bold text-white">
                                  {excessStockCount}
                                </span>
                              </div>
                              <div className="stockImg">
                                <img src={process.env.PUBLIC_URL + '/assets/images/excess.png'} alt="item" className="img" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-3 col-sm-6 item">
                          <Link to="/inventory/dashboard" className="text-decoration-none">
                            <div className="card shadow-md cursor-pointer item_card gth-bg-success">
                              <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="my-1 text-white">Inventory Dashboard</h6>
                                  <span className="ms-auto fs-5 fw-bold text-white d-flex align-items-center">
                                    View <i className="fi fi-rr-arrow-small-right ms-2 d-flex"></i>
                                  </span>
                                </div>
                                <div className="stockImg">
                                  <img src={process.env.PUBLIC_URL + '/assets/images/dashboard.png'} alt="item" className="img" />
                                </div>
                              </div>
                            </div>
                            {/* <div className="card shadow-md gth-bg-success-light cursor-pointer">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <h6 className="my-1">
                        <i className="fi fi-br-objects-column me-2"></i> 
                      </h6>
                      <span className="ms-auto fs-5 fw-bold"></span>
                      
                    </div>
                  </div> */}
                          </Link>
                        </div>

                      </div>
                    </div>
                    <div className="table-wrap">
                      <div className="border rounded-10 bg-white">
                        <div className="d-flex justify-content-end p-3">
                          <div className="col-md-3">
                            <input
                              type="text"
                              placeholder="Search..."
                              className="form-control"
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="p-0">
                          <div className="table-responsive mb-0">
                            <Table
                              columns={columns}
                              dataSource={filteredData}
                              pagination={{ pageSize: 5 }}
                              scroll={{ x: 1500 }}
                              onChange={(pagination, filters, sorter) => {
                                console.log("Table changed:", pagination, filters, sorter);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Single Item Modal start*/}

      <Modal
        id="addPriority"
        show={showAddSingleItemModal}
        onHide={handleCloseAddSingleItemModal}
        backdrop="static"
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title className="gth-modal-title">Add Item</Modal.Title>
        </Modal.Header>
        <form action="" onSubmit={SubmitData} method="post">
          <Modal.Body className="pb-1 moday-body-overflow-none">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>Item ID</span>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Unique code for your item</Tooltip>}
                    >
                      <span className="cursor-pointer ms-2 text-primary">
                        <i className="fas fa-info-circle line-height-1"></i>
                      </span>
                    </OverlayTrigger>
                  </label>
                  <input
                    type="text"
                    name="item_id"
                    value={sku || ""}
                    className="form-control"
                    readOnly
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Item Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    placeholder="Enter Item Name"
                    className="form-control"
                  />
                </div>
              </div>
               <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                   SKU <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku_product"
                    placeholder="SKU"
                    className="form-control"
                  />
                </div>
              </div>
               <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Batch Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="batch_number"
                    placeholder="Enter Batch Number"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Product/Service <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="product_service"
                    onChange={getTaskData}
                  >
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>
                      Buy/Sell/Both <span className="text-danger">*</span>
                    </span>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          Do you frequently Buy, Sell, or Both (buy & sell) this
                          material?
                        </Tooltip>
                      }
                    >
                      <span className="cursor-pointer ms-2 text-primary">
                        <i className="fas fa-info-circle line-height-1"></i>
                      </span>
                    </OverlayTrigger>
                  </label>
                  <select
                    className="form-select"
                    name="buy_sell_both"
                    onChange={getTaskData}
                  >
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>
                      Unit of Measurement (UoM){" "}
                      <span className="text-danger">*</span>
                    </span>
                  </label>
                  <div className="d-flex">
                    <div className="custom-select-wrap w-100">
                      <Select
                        name="product_uom"
                        options={getUomData}
                        getOptionLabel={(option) => option.unit_name}
                        getOptionValue={(option) => option.id}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                        onChange={getTaskData}
                      />
                    </div>
                    <Link
                      to="/settings/inventory/master-uom"
                      className="btn btn-outline-primary w-fit-content ms-2"
                    >
                      <i className="fas fa-plus"></i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>Item Category</span>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          What type of item is it? e.g. Raw Material, Finished
                          Goods
                        </Tooltip>
                      }
                    >
                      <span className="cursor-pointer ms-2 text-primary">
                        <i className="fas fa-info-circle line-height-1"></i>
                      </span>
                    </OverlayTrigger>
                  </label>
                  <div className="d-flex">
                    <div className="custom-select-wrap w-100">
                      <Select
                        name="product_category"
                        options={category}
                        getOptionLabel={(option) => option.title}
                        getOptionValue={(option) => option.id}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                        onChange={getTaskData}
                      />
                    </div>
                    <Link
                      to="/add-new-category"
                      className="btn btn-outline-primary w-fit-content ms-2"
                    >
                      <i className="fas fa-plus"></i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>Current Stock</span>
                  </label>
                  <input
                    type="number"
                    name="current_stock"
                    placeholder="Enter Current Stock"
                    className="form-control"
                    onChange={getTaskData}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>Default Price</span>
                  </label>
                  <input
                    type="number"
                    name="default_price"
                    placeholder="Enter Default Price"
                    className="form-control"
                    onChange={getTaskData}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>HSN Code</span>
                  </label>
                  <input
                    type="text"
                    name="hsn_code"
                    placeholder="Enter HSN Code"
                    className="form-control"
                    onChange={getTaskData}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>Tax (%)</span>
                  </label>
                  <input
                    type="text"
                    name="tax"
                    placeholder="Tax"
                    className="form-control"
                    onChange={getTaskData}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>Minimum Stock Level</span>
                  </label>
                  <input
                    type="number"
                    name="minimum_stock_level"
                    placeholder="Enter Minimum Stock Level"
                    className="form-control"
                    onChange={getTaskData}
                    min="0"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>Maximum Stock Level</span>
                  </label>
                  <input
                    type="number"
                    name="maximum_stock_level"
                    placeholder="Enter Maximum Stock Level"
                    className="form-control"
                    onChange={getTaskData}
                    min="0"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <div className="alert gth-alert-info-light border-0 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      version="1.1"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      width={16}
                      height={16}
                      x={0}
                      y={0}
                      viewBox="0 0 64 64"
                      style={{ enableBackground: "new 0 0 512 512" }}
                      xmlSpace="preserve"
                      className="hovered-paths"
                    >
                      <g>
                        <g data-name="Data Encryption">
                          <path
                            fill="#f5f7ff"
                            d="M47 39v4a1 1 0 0 0 1 1h5v19H16a5 5 0 0 1-5-5V6a5 5 0 0 0-5-5h42a5 5 0 0 1 5 5v32h-5a1 1 0 0 0-1 1z"
                            opacity={1}
                            data-original="#f5f7ff"
                            className="hovered-path"
                          />
                          <path
                            fill="#ccd3eb"
                            d="M1 21h10V6A5 5 0 0 0 1 6z"
                            opacity={1}
                            data-original="#ccd3eb"
                          />
                          <path
                            fill="#96a1c3"
                            d="M4.5 1.25A5 5 0 0 1 8 6v15h3V6a5 5 0 0 0-6.5-4.75z"
                            opacity={1}
                            data-original="#96a1c3"
                          />
                          <path
                            fill="#ccd3eb"
                            d="M63 51v7a5 5 0 0 1-5 5H16a5 5 0 0 0 5-5v-7h14v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5z"
                            opacity={1}
                            data-original="#ccd3eb"
                          />
                          <path
                            fill="#96a1c3"
                            d="M58 60H20.58A5 5 0 0 1 16 63h42a5 5 0 0 0 5-5v-3a5 5 0 0 1-5 5z"
                            opacity={1}
                            data-original="#96a1c3"
                          />
                          <g fill="#0074ff">
                            <path
                              d="M16 7v5a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1h-1a1 1 0 0 0 0 2zM25 16h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zM30 5h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1zM48 5h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1zM43 5h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1zM43 16h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zM48 16h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zM30 16h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zM25 5h-4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm-1 6h-2V7h2zM16 24h4a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm1-6h2v4h-2zM38 5h-4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm-1 6h-2V7h2zM17 27h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zM30 27h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zM48 27h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zM43 27h-1a1 1 0 0 0 0 2v5a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1zM25 27h-4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-2v-4h2zM38 27h-4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-2v-4h2zM38 16h-4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-2v-4h2zM14.71 40a7 7 0 1 0 0 4H23v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z"
                              fill="#0074ff"
                              opacity={1}
                              data-original="#0074ff"
                              className=""
                            />
                          </g>
                          <circle
                            cx={8}
                            cy={42}
                            r={3}
                            fill="#f5f7ff"
                            opacity={1}
                            data-original="#f5f7ff"
                            className="hovered-path"
                          />
                          <path
                            fill="#96a1c3"
                            d="M3 31H1a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2zM1 29h2a1 1 0 0 0 0-2H1a1 1 0 0 0 0 2z"
                            opacity={1}
                            data-original="#96a1c3"
                          />
                          <rect
                            width={6}
                            height={6}
                            x={52}
                            y={33}
                            fill="#0074ff"
                            rx={1}
                            opacity={1}
                            data-original="#0074ff"
                            className=""
                          />
                          <rect
                            width={6}
                            height={6}
                            x={39}
                            y={47}
                            fill="#0074ff"
                            rx={1}
                            opacity={1}
                            data-original="#0074ff"
                            className=""
                          />
                          <rect
                            width={4}
                            height={4}
                            x={58}
                            y={26}
                            fill="#0074ff"
                            rx={1}
                            opacity={1}
                            data-original="#0074ff"
                            className=""
                          />
                          <rect
                            width={4}
                            height={4}
                            x={58}
                            y={43}
                            fill="#0074ff"
                            rx={1}
                            opacity={1}
                            data-original="#0074ff"
                            className=""
                          />
                          <path
                            fill="#033c59"
                            d="M53 23a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1zM63 50h-9v-6a1 1 0 0 0-1-1h-5v-4h3.28A2 2 0 0 0 53 40h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3v-2a1 1 0 0 0-2 0v2.28A2 2 0 0 0 51 34v3h-3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v5h-6v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2v2h-4v-5a1 1 0 0 0-1-1H21a1 1 0 0 0-1 1v7a4 4 0 0 1-8 0v-5a1 1 0 0 0-2 0v5a6 6 0 0 0 6 6h42a6 6 0 0 0 6-6v-7a1 1 0 0 0-1-1zm-6-12h-4v-4h4zM40 48h4v4h-4zm22 10a4 4 0 0 1-4 4H20.47A6 6 0 0 0 22 58v-6h12v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2h2a2 2 0 0 0 2-2h16z"
                            opacity={1}
                            data-original="#033c59"
                          />
                          <path
                            fill="#033c59"
                            d="M15.41 45H22a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3H15.41A7.92 7.92 0 0 0 12 35.09V6a6 6 0 0 0-1.53-4H48a4 4 0 0 1 4 4v14a1 1 0 0 0 2 0V6a6 6 0 0 0-6-6H6a6 6 0 0 0-6 6v15a1 1 0 0 0 1 1h9v12.26a8.2 8.2 0 0 0-3.53-.12A8 8 0 1 0 15.41 45zM2 20V6a4 4 0 0 1 8 0v14zm6 28a6 6 0 1 1 5.75-7.71 1 1 0 0 0 1 .71H29a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a1 1 0 0 0-2 0v1h-1a1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1h-8.29a1 1 0 0 0-1 .71A6 6 0 0 1 8 48z"
                            opacity={1}
                            data-original="#033c59"
                          />
                          <path
                            fill="#033c59"
                            d="M8 38a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2zM59 31h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2zm0-4h2v2h-2zM61 42h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2zm0 4h-2v-2h2z"
                            opacity={1}
                            data-original="#033c59"
                          />
                        </g>
                      </g>
                    </svg>

                    <span className="ms-2">Encrypted Action</span>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-success">
              Save
            </button>
          </Modal.Footer>
        </form>
      </Modal>
      {/* Add Single Item Modal end*/}

      {/* Stock Transfer Modal */}
      <Modal
        show={show}
        onHide={StockTransferClose}
        backdrop="static"
        keyboard={false}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Stock Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <Form layout="vertical">
              {/* Store Selection */}
              <div className="row ">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="form-label">From Store</label>
                    <div className="custom-select-wrap">
                      <Select
                        options={stores}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onChange={setFromStore}
                      ></Select>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="form-label">To Store</label>
                    <div className="custom-select-wrap">
                      <Select
                        options={stores}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onChange={setToStore}
                      ></Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Details Table */}
              <div className="table-responsive">
                <Table
                  columns={columnspop}
                  dataSource={transferItems}
                  rowKey={(record, index) => index}
                  pagination={false}
                />
              </div>


              {/* Add Item Button */}
              <button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                className="btn btn-sm btn-outline-primary"
              >
                <i className="fas fa-plus me-2"></i>Add Item
              </button>

              {/* Comment Input */}
              <Form.Item label="Add a Comment Here" className="mt-3">
                <Input.TextArea
                  placeholder="Add a comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Form.Item>

              {/* Submit Button */}
              <button
                type="primary"
                onClick={handleSubmitStockUpdate}
                className="btn btn-success"
                disabled={rowErrors.some((error) => error)}
              >
                <i className="fas fa-save me-2"></i>Save
              </button>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
      {/* Stock Transfer Modal end */}





      {/* Update Product Stock Modal */}
      <Modal
        show={showupdate}
        onHide={StockUpdateClose}
        backdrop="static"
        keyboard={false}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Product Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form layout="vertical">
            {/* Store Selection */}
            <div className="row mb-3">
              <div className="col">
                <div className="form-group">
                  <label className="form-label">To/From Store</label>
                  <div className="custom-select-wrap">
                    <Select
                      options={stores.map((store) => ({
                        value: store.id,
                        label: store.name,
                      }))}
                      onChange={setFromStore}
                      placeholder="Select Store"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <Table
                columns={columnspopUpdate}
                dataSource={transferItems}
                rowKey={(record, index) => index}
                pagination={false}
              />
            </div>

            {/* Add Item Button */}
            <button
              type="dashed"
              onClick={handleAddItem}
              icon={<PlusOutlined />}
              className="btn btn-sm btn-outline-primary"
            >
              <i className="fas fa-plus me-2"></i>Add Item
            </button>

            {/* Comment Input */}
            <Form.Item label="Add a Comment Here" className="mt-3">
              <Input.TextArea
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Item>

            {/* Submit Button */}
            <button type="submit" onClick={handleSubmit} className="btn btn-success">
              <i className="fas fa-save me-2"></i>Save
            </button>
          </Form>

        </Modal.Body>
      </Modal>
      {/* Update Product Stock Modal */}






      {/* Update Product Stock qyt only Modal */}
      <Modal
        show={showqty}
        onHide={handleCloseqty}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Product Stock - {getitemId}</Modal.Title>
        </Modal.Header>
        {/* <Modal.Body> */}
        <form action="" onSubmit={handleSubmitStore} method="post">
          <Modal.Body className="pb-1 moday-body-overflow-none">
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="form-label">
                    Item Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    placeholder="Enter Item Name"
                    className="form-control"
                    value={productData ? productData.product_name : ""}
                    disabled
                  />
                </div>
              </div>

              <div className="col-md-12">
                <div className="form-group">
                  <label className="form-label">
                    Select Store <span className="text-danger">*</span>
                  </label>
                  <div className="custom-select-wrap">
                    <Select
                      options={stores}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      value={stores.find((data) => data.id == selectedStore)}
                      onChange={handleStoreChange}
                      placeholder="Select Store"
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Quantity changed in Store
                  </label>
                  <input
                    type="number"
                    name="current_stock"
                    className="form-control"
                    value={currentStock}
                    disabled
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Final Quantity in Store
                  </label>
                  <input
                    type="number"
                    name="final_quantity"
                    className="form-control"
                    value={finalQuantity}
                    disabled
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Change Quantity</label>
                  <div className="d-flex">
                    <input
                      type="text"
                      name="change_quantity"
                      className="form-control w-100"
                      value={changeQuantity}
                      onChange={handleChangeQuantity}
                    />
                    {/* <input
                      type="text"
                      name="change_quantity"
                      className="form-control w-100"
                      value={changeQuantity}  
                      onChange={handleChangeQuantity}
                      onKeyDown={(e) => {
                        // Prevent increment/decrement with arrow keys
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      inputMode="decimal" // Allows decimal inputs on mobile keyboards
                      pattern="[0-9]*\.?[0-9]*" // Validates decimal numbers
                    /> */}
                    <div className="d-flex align-items-center ms-2 gap-2 w-25">
                      <button type="button" className={` btn-outline-success ${getButtonClassNamePlus} modalAdd_btn`} onClick={incrementQuantity}>
                        <i className="fas fa-plus"></i>
                      </button>

                      <button type="button" className={` btn-outline-danger border-dashed ${getButtonClassNameNeg} modalAdd_btn`} onClick={decrementQuantity}>
                        <i className="fas fa-minus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">UoM</label>
                  <Select
                    name="product_uom"
                    options={getUomData}
                    getOptionLabel={(option) => option.unit_name}
                    getOptionValue={(option) => option.id}
                    value={getUomData.find((data) => data.id == finalUoM)}
                    isDisabled
                  />
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-success" disabled={getActualQuantity < 0}>
              Save
            </button>
          </Modal.Footer>
        </form>
        {/* </Modal.Body> */}
      </Modal>
      {/* Update Product Stock qyt only Modal */}


      {/* Update Product Stock Modal */}
      <Modal
        show={alternate}
        onHide={alternateModalClose}
        backdrop="static"
        // keyboard={false}
        centered
        size="md"
      // className="model_80"
      >
        <Modal.Header closeButton>
          <Modal.Title>Bulk Upload Alternate UOM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-group '>
            <label className='form-label'>Upload UOM</label>
            <div className='custom-select-wrap'>
              <input type="file" required className='form-control' accept=".xlsx, .csv"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 uploadView ">
            <div className="file"><i className="far fa-file-excel e_file"></i></div>
            <div className="d-flex align-items-center gap-3 w-100 ">
              <p className="mb-0 f-s-16 fw-bold ">Export (22).xlsx</p>
              <button type='button' className="btn ms-auto fit-btn p-1"><i className="fas fa-times  f-s-16"></i></button>
            </div>
          </div>


          <div className="border-top mt-5 d-flex justify-content-end gap-2 pt-3">
            <button type='button' className="btn btn-success"   >Submit</button>
            <button type='button' className="btn btn btn-warning" >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="currentColor"
                className='me-1'
              >
                <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
              </svg>
              Download Template</button>
          </div>
        </Modal.Body>
      </Modal>
      {/* Bulk Upload Alternate UOM */}


      {/* edit Item Multiple Modal*/}
      <Modal
        show={editItem}
        onHide={editItemModalClose}
        backdrop="static"
        keyboard={false}
        centered
        size="xxxl"
        id="editItemMultipleModal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Items (Multiple)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="moday-body-overflow-none">
          <p>You can bulk delete multiple items using an <strong>Excel(.xlsx)</strong> file. [Note: 1. a maximum of 500 items is allowed at a time; 2. Unit of Measurement can NOT be changed]</p>
          <h6>Required Data Format</h6>
          <div className="w-100 mt-3 position-relative">
            <div className="sample_data_badge">
              Sample Data
            </div>
            <div className="table-responsive">
              <table className="table-bordered primary-table-head">
                <thead>
                  <tr>
                    <th>
                      Item ID *
                    </th>
                    <th>
                      Item Name
                    </th>
                    <th>
                      Product/Service
                    </th>
                    <th>
                      Item Type (Buy/Sell/Both)
                    </th>
                    <th >
                      Unit of Measurement
                    </th>
                    <th >
                      HSN Code
                    </th>
                    <th>
                      Item Category
                    </th>
                    <th>
                      Default Price
                    </th>
                    <th >
                      Regular Buying Price
                    </th>
                    <th>
                      Wholesale Buying Price
                    </th>
                    <th >
                      Regular Selling Price
                    </th>
                    <th>
                      MRP
                    </th>
                    <th >
                      Dealer Price
                    </th>
                    <th >
                      Distributor Price
                    </th>
                    <th >
                      Min Stock Level
                    </th>
                    <th >
                      Max Stock Level
                    </th>
                    <th >
                      Tax
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ width: '120px' }}>RM001</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>Raw Material 1</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>Product</div>
                    </td>
                    <td>
                      <div style={{ width: '180px' }}>Buy</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>Kg</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>4040</div>
                    </td>
                    <td>
                      <div style={{ width: '120px' }}></div>
                    </td>
                    <td>
                      <div style={{ width: '120px' }}>100</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '170px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>1000</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>3000</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>12</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="pt-2 mb-3">
              <div className="dropdown">
                <button type='button' className="btn btn-warning dropdown-toggle" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    id="Layer_1"
                    data-name="Layer 1"
                    viewBox="0 0 24 24"
                    width={14}
                    height={14}
                    fill="currentColor"
                    className='me-1'
                  >
                    <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
                  </svg>
                  Download Template
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li><button type='button' className="dropdown-item">Download Blank Template</button></li>
                  <li><button type='button' className="dropdown-item" onClick={handleToggle}>Download Template With Items</button></li>
                </ul>
              </div>
              {isVisible && (
                <div className="p-3 border rounded-4 my-3 pb-0" >
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Creation Date (From)</label>
                        <input
                          type="datetime-local"
                          value={orderDeadline}
                          onChange={(e) => setOrderDeadline(e.target.value)}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Creation Date (To)</label>
                        <input
                          type="datetime-local"
                          value={orderDeadline}
                          onChange={(e) => setOrderDeadline(e.target.value)}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Item Type</label>
                        <div className="custom-select-wrap">
                          <Select
                            name="vendor_name"
                            options={ItemType}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary25: "#ddddff",
                                primary: "#6161ff",
                              },
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Item Category</label>
                        <div className="custom-select-wrap">
                          <Select
                            name="vendor_name"
                            options={CategoryItem}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary25: "#ddddff",
                                primary: "#6161ff",
                              },
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group d-flex justify-content-end ">
                        <button className="btn btn-exp-green" type='button'>
                          Download Template With Items
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className='form-group mb-0'>
                  <label className='form-label'>Upload File</label>
                  <div className='custom-select-wrap'>
                    <input type="file" required className='form-control' accept=".xlsx, .csv"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type='button' className="btn btn-secondary">Cancel</button>
          <button type='submit' className="btn btn-success">Submit</button>
        </Modal.Footer>
      </Modal>
      {/* edit Item Multiple Modal */}
      {/* Delete multiple item*/}
      <DeleteMultipleItemsModal
        show={removeItem}
        onClose={removeItemModalClose}
      />
      {/* Delete multiple item */}

      {/* Add Multiple Items Modal */}
      <AddMultipleItemsModal
        show={multipleItems}
        onClose={multipleItemsModalClose}
        FetchProduct={fetchData}
      />
      {/* Add Multiple Items Modal End*/}
      {/* Tally Integration Extension Modal Start*/}
      <TallyIntegrationModal
        show={showTallyIntegrationExtensionModal}
        handleClose={handleCloseTallyIntegrationExtensionModal}
        faqItems={faqItems}
      />
      {/* Tally Integration Extension Modal end*/}
      {/* Explore All Features Modal Start*/}
      <ExploreAllFeaturesModal
        show={showExploreAllFeaturesModal}
        handleClose={handleCloseExploreAllFeaturesModal}
      />
      {/* Explore All Features Modal end*/}

    </>
  );
}

export default InventoryMaster;
