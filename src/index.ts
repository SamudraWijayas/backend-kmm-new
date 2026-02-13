import express from "express";
import router from "./routes/api";
import { prisma, connect } from "./libs/prisma"; // Prisma client
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import errorMiddleware from "./middleware/error.middleware";
import maintenanceMiddleware from "./middleware/maintenance.middleware";
import { getMaintenance } from "./controllers/settingController";

async function init() {
  try {
    const PORT = 5000;
    await connect();

    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server is running",
        data: null,
      });
    });
    app.get("/api/maintenance", getMaintenance);
    app.use(maintenanceMiddleware);
    app.use("/api", router);

    app.use(errorMiddleware.serverRoute());
    app.use(errorMiddleware.serverError());

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();

// Routes

// Jalankan koneksi database dulu baru start server
(async () => {
  try {
    await connect(); // prisma.$connect()
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
