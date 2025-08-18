
const express = require("express");
const { AddPurchase, GetAllPurchase, DeletePurchase, UpdatePurchase,getPurchase, AddPurchaseadditi, getPurchaseaddi, getPurchasecompare, StatusUpdate, GetAllPurchaseOrder, pendingApproval, getPurchasecompareManagment, insertRemarks, getManagmentReview, insertAdvancePayment, AddBill,getBill,PaymentRecords, StatusUpdateFromAdmin, finalApproval, SendMailByPO, SendMailUpdate, insertfollowup, AddRecv, getRecv, GetAllPurchaseOrderRecv, GetAllPurchaseOrderFolloup, GetAllPurchaseOrderDone, GetAllPurchaseReject, GetAllPurchaseRejectcount, GetAllPurchasedonecount, GetAllPurchaseRrfq, GetAllPurchaseapp, GetAllPurchasOconfir, GetAllBillcreated, GetDoneVendorwise, getPatmentData, GetAllPurchaseOrderRecvDone, generatePDFForvendor, GetAllPurchaseRfqStatus, GetAllPurchaseRfqReview, GetAllPurchasereviewdone, GetAllPurchaseBilled, GetVendorMonthlyPerformance, GetVendorYearlyPerformance, GetVendorPerformance, GetMonthlyRFQPurchaseReport, getPurchasesWithStatusNine, getPurchaseOrderSummary, purchaseLedger } = require("../controller/PurchaseController");
const { authToken } = require("../utils/Middleware");
const { upload } = require("../utils/ImageUpload");

const router = express.Router();

router.post('/add',authToken, AddPurchase);
router.post('/add_addi',authToken, AddPurchaseadditi);
router.get('/get_addi/:id/:venid',authToken, getPurchaseaddi);
router.get("/getPurchasecompare/:id",authToken,getPurchasecompare);
router.get("/getPurchasecompareManagment/:id",authToken,getPurchasecompareManagment);

router.get("/all-purchase",authToken,GetAllPurchase);
router.get("/all-purchase-rfq",authToken,GetAllPurchaseRfqStatus);
router.get("/all-purchase-revireing",authToken,GetAllPurchaseRfqReview);
router.get("/approved-from-admin",authToken,GetAllPurchasereviewdone);
router.get("/purchase-billed",authToken,GetAllPurchaseBilled);

router.get("/all-rejected-purchase",authToken,GetAllPurchaseReject);
router.get("/purchase/:id",authToken,getPurchase);
 router.put("/update/:id",authToken,  UpdatePurchase);
router.delete('/:id', DeletePurchase);
router.put("/statuschange/:id/:sid",authToken,StatusUpdate);
router.get("/getallpurchaseorder",authToken,GetAllPurchaseOrder);
router.get("/getallpurchaseorderrecvdone",authToken,GetAllPurchaseOrderRecvDone);
router.get("/generatePDFForvendor/:id",authToken,generatePDFForvendor);

router.get("/getallpurchaseorderdone",authToken,GetAllPurchaseOrderDone);

router.get("/getallpurchaseorderfollowup",authToken,GetAllPurchaseOrderFolloup);

router.get("/getallpurchaseorderforrecv",authToken,GetAllPurchaseOrderRecv);
router.get("/pending-approval",authToken,pendingApproval);
router.get("/final-approval",authToken,finalApproval);
router.post('/addremarks',authToken, insertRemarks);
router.get("/getremarks/:id",authToken, getManagmentReview);
router.post('/insertadvancepayment',authToken, insertAdvancePayment);
router.post('/bill/new/:id',authToken, AddBill);
router.get('/bill/:id',authToken, getBill);
router.post('/payment/:id',authToken, PaymentRecords);
router.post('/emailsend/:id',authToken, SendMailByPO);
router.post('/emailsendupdate/:id',authToken, SendMailUpdate);
router.post('/addfollowup',authToken, insertfollowup);
router.post('/recv/new/:id',authToken, AddRecv);
router.put("/statuschangefromadmin/:id/:sid",authToken,StatusUpdateFromAdmin);
router.get('/recv/:id',authToken, getRecv);
router.get("/reject_count",authToken,GetAllPurchaseRejectcount);
router.get("/done_count",authToken,GetAllPurchasedonecount);
router.get("/rfq_count",authToken,GetAllPurchaseRrfq);
router.get("/appro",authToken,GetAllPurchaseapp);
router.get("/approcon",authToken,GetAllPurchasOconfir);
router.get("/apprbillcre",authToken,GetAllBillcreated);
router.get("/vendordonecount",authToken,GetDoneVendorwise);
router.get("/getperyrwise",authToken,getPatmentData);
router.get("/vendorperformance",authToken,GetVendorPerformance);
router.get("/monthly-report",authToken,GetMonthlyRFQPurchaseReport);
router.get("/monthly-report",authToken,GetMonthlyRFQPurchaseReport);
router.get('/status-9',authToken, getPurchasesWithStatusNine);
router.get('/getPurchaseOrderSummary',authToken, getPurchaseOrderSummary);
router.post('/purchaseLedger',authToken, purchaseLedger);







module.exports = router;