"use strict";
import constants from "../../lib/constants/index.js";
import crypto from "crypto";
import axios from "axios";
import { v4 as UUIDV4 } from "uuid";
const { INTERNAL_SERVER_ERROR, NOT_FOUND, BAD_REQUEST } = constants.http.status;
import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    const { details, delivery_date, slug } = req.body;
    const template = await table.TemplateModel.findBySlug(slug);

    if (!template) {
      return res.code(NOT_FOUND).send({ message: "template not found!" });
    }

    const transId = `T${UUIDV4().toString(36).slice(-6)}`;
    const merchUserId = `MUID${UUIDV4().toString(36).slice(-6)}`;

    const payload = {
      merchantId: "PGTESTPAYUAT",
      merchantTransactionId: transId,
      merchantUserId: merchUserId,
      name: "vishal",
      amount: 10000,
      redirectUrl: "http://localhost:3001/v1/payment/status/" + merchUserId,
      redirectMode: "POST",
      callbackUrl: "http://localhost:3001/v1/payment/status/" + merchUserId,
      mobileNumber: "7011691802",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payloadStringify = JSON.stringify(payload, null, 2);
    const payloadBase64 = btoa(payloadStringify);
    const string =
      payloadBase64 + "/pg/v1/pay" + process.env.PHONEPE_PAYMENT_SALT_KEY;

    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + process.env.PHONEPE_PAYMENT_SALT_INDEX;

    const options = {
      method: "post",
      url: `${process.env.PHONEPE_BASE_URL}/pg/v1/pay`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadBase64,
      },
    };

    const response = await axios
      .request(options)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });

    res.send(response.data.data.instrumentResponse.redirectInfo.url);

    await table.QueryModel.create({
      details,
      delivery_date,
      user_id: req.user_data.id,
      template_id: template?.id,
    });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const checkStatus = async (req, res) => {
  console.log(req.body);
  try {
    const string =
      `/pg/v1/status/${req.body.merchantId}/${req.body.transactionId}` +
      process.env.PHONEPE_PAYMENT_SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");

    const checksum = sha256 + "###" + process.env.PHONEPE_PAYMENT_SALT_INDEX;

    const options = {
      method: "GET",
      url: `${process.env.PHONEPE_BASE_URL}/pg/v1/status/${req.body.merchantId}/${req.body.transactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": req.body.merchantId,
      },
    };

    // CHECK PAYMENT STATUS
    const { data } = await axios.request(options);
    console.log(data);

    if (data.code == "PAYMENT_SUCCESS") {
      res.send(data);
    } else {
    }
  } catch (error) {
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  checkStatus: checkStatus,
};
