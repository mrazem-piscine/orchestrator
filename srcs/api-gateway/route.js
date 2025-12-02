// routes.js
const express = require("express");
const amqp = require("amqplib");
const axios = require("axios");
const logger = require("./logger");

const router = express.Router();

/* ============================================================
   BILLING ROUTE → send order to RabbitMQ
   ============================================================ */
router.post("/api/billing", async(req, res) => {
    const message = JSON.stringify(req.body);

    try {
        const rabbitUrl =
            process.env.RABBITMQ_URL ||
            "amqp://crud:crudpass@rabbitmq:5672"; // Kubernetes service name

        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();

        const queue = process.env.QUEUE_NAME || "billing_queue";
        await channel.assertQueue(queue, { durable: true });

        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

        logger.info(`Sent message to ${queue}: ${message}`);

        res.status(200).json({
            success: true,
            message: "Order sent to billing queue.",
        });

        // optional cleanup
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        logger.error(`RabbitMQ Error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   INVENTORY ROUTES → Forward to inventory-app service
   ============================================================ */

// internal service URL inside Kubernetes
const INVENTORY_URL = "http://inventory-app:8080";

/* ----- GET ALL MOVIES ----- */
router.get("/inventory/movies", async(_req, res) => {
    try {
        const response = await axios.get(`${INVENTORY_URL}/movies`);
        res.json(response.data);
    } catch (error) {
        logger.error("Inventory GET error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

/* ----- ADD A MOVIE ----- */
router.post("/inventory/movies", async(req, res) => {
    try {
        const response = await axios.post(`${INVENTORY_URL}/movies`, req.body);
        res.json(response.data);
    } catch (error) {
        logger.error("Inventory POST error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   OPTIONAL SHORT ROUTE → /movies also forwarded
   ============================================================ */
router.get("/movies", async(_req, res) => {
    try {
        const response = await axios.get(`${INVENTORY_URL}/movies`);
        res.json(response.data);
    } catch (error) {
        logger.error("Inventory GET /movies shortcut error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;