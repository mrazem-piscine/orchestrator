require("dotenv").config();
const amqp = require("amqplib");
const { Sequelize, DataTypes } = require("sequelize");
const dbConfig = require("./app/config/db.config");
const express = require("express");
const app = express();
app.use(express.json());

// Database connection
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

const Order = require("./app/models/order.model")(sequelize, DataTypes);

// Connect to DB
sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Unable to connect:", err));

sequelize
  .sync()
  .then(() => console.log("🗄️  Database synchronized"))
  .catch((err) => console.error("❌ Failed to sync database:", err));

// RabbitMQ consumer
async function startConsumer() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://crud:crudpass@10.0.2.2:5672');
    const channel = await connection.createChannel();

    const queue = process.env.QUEUE_NAME || 'billing_queue';
    await channel.assertQueue(queue, { durable: true });

    console.log(`📥 Waiting for messages in queue: ${queue}`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const messageContent = JSON.parse(msg.content.toString());
        console.log("💬 Received message:", messageContent);

        try {
          await Order.create({
            user_id: messageContent.user_id,
            number_of_items: messageContent.number_of_items,
            total_amount: messageContent.total_amount,
          });

          console.log("✅ Order saved to database.");
          channel.ack(msg);
        } catch (err) {
          console.error("❌ Failed to insert into DB:", err);
        }
      }
    });
  } catch (err) {
    console.error("🐇 RabbitMQ connection error:", err);
    setTimeout(startConsumer, 5000); // Retry connection every 5s
  }
}

app.get("/", (_req, res) => {
  res.json({ status: "ok", queue: process.env.QUEUE_NAME || "billing_queue" });
});

app.get("/orders", async (_req, res) => {
  try {
    const orders = await Order.findAll({ order: [["createdAt", "DESC"]], limit: 10 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
    res.status(500).json({ error: "Unable to load orders" });
  }
});

const PORT = process.env.BILLING_PORT || 8080;

app.listen(PORT, () => {
  console.log(`📦 Billing API listening on port ${PORT}`);
  startConsumer();
});
