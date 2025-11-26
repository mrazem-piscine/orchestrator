// routes.js
const express = require("express");
const amqp = require("amqplib");
const logger = require("./logger");

const router = express.Router();

router.post("/api/billing", async (req, res) => {
  const message = JSON.stringify(req.body);

  try {
    // From inside a VM, 10.0.2.2 reaches the host's forwarded ports
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://crud:crudpass@10.0.2.2:5672');
    const channel = await connection.createChannel();

    const queue = process.env.QUEUE_NAME || "billing_queue";
    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

    logger.info(`Sent message to ${queue}: ${message}`);

    res
      .status(200)
      .json({ success: true, message: "Order sent to billing queue." });

    // optional cleanup
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (error) {
    logger.error(`Error sending message to RabbitMQ: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
