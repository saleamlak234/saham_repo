
const express = require("express");
const multer = require("multer");
const path = require("path");
const Deposit = require("../models/Deposit");
const MerchantAccount = require("../models/MerchantAccount");
const User = require("../models/User");
const Commission = require("../models/Commission");
const telegramService = require("../services/telegram");
const PackageUpgrade = require("../models/PackageUpgrade");

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "receipts"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get merchant accounts
router.get("/merchant-accounts", async (req, res) => {
  try {
    const merchantAccounts = await MerchantAccount.find({ isActive: true });
    res.json({ merchantAccounts });
  } catch (error) {
    console.error("Get merchant accounts error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching merchant accounts" });
  }
});

// Get user deposits
router.get("/", async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user._id })

      .populate('merchantAccount')
      .populate('upgradedTo')
      .populate('upgradedFrom')

      .sort({ createdAt: -1 });

    res.json({ deposits });
  } catch (error) {
    console.error("Get deposits error:", error);
    res.status(500).json({ message: "Server error fetching deposits" });
  }
});

// Create new deposit
router.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const {
      amount,
      package: packageName,
      paymentMethod,
      merchantAccountId,
      transactionReference,
    } = req.body;
    const userId = req.user._id;

    // Validate package and amount
    const packagePrices = {
      "7th Stock Package": 192000,
      "6th Stock Package": 96000,
      "5th Stock Package": 48000,
      "4th Stock Package": 24000,
      "3rd Stock Package": 12000,
      "2nd Stock Package": 6000,
      "1st Stock Package": 3000,

    };

    if (!packagePrices[packageName]) {
      return res.status(400).json({ message: "Invalid package selected" });
    }

    if (parseInt(amount) !== packagePrices[packageName]) {
      return res
        .status(400)
        .json({ message: "Amount does not match package price" });
    }

    // Validate merchant account
    const merchantAccount = await MerchantAccount.findById(merchantAccountId);
    if (!merchantAccount || !merchantAccount.isActive) {
      return res
        .status(400)
        .json({ message: "Invalid merchant account selected" });
    }

    // Create deposit record
    const deposit = new Deposit({
      user: userId,
      amount: parseInt(amount),
      package: packageName,
      paymentMethod,
      merchantAccount: merchantAccountId,
      receiptUrl: req.file ? `/uploads/receipts/${req.file.filename}` : null,
      transactionReference,
    });

    await deposit.save();

    // Send notification to admin via Telegram
    await telegramService.sendToAdmin(
      `💰 New deposit request:\n` +
        `User: ${req.user.fullName}\n` +
        `Package: ${packageName}\n` +
        `Amount: ${amount.toLocaleString()} ETB\n` +
        `Payment: ${paymentMethod}\n` +
        `Merchant: ${merchantAccount.name}\n` +
        `Reference: ${transactionReference || "N/A"}`
    );

    res.status(201).json({
      message: "Deposit request created successfully",
      deposit,
    });
  } catch (error) {
    console.error("Create deposit error:", error);
    res.status(500).json({ message: "Server error creating deposit" });
  }
});

// Upgrade existing deposit to higher package
router.post(
  "/upgrade/:depositId",
  upload.single("receipt"),
  async (req, res) => {
    try {
      const { depositId } = req.params;
      const {
        newPackage,
        newAmount,
        paymentMethod,
        merchantAccountId,
        transactionReference,
        multipleUpgrades
      } = req.body;
      const userId = req.user._id;

      console.log("Upgrade request - depositId:", depositId, "userId:", userId);
      // Find the original deposit
      // Validate depositId format
      if (!depositId || !depositId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid deposit ID format" });
      }
      const originalDeposit = await Deposit.findOne({
        _id: depositId,
        user: userId,
        status: "completed",
      }).populate("user");

      console.log("Original deposit found:", originalDeposit ? "Yes" : "No");
      if (!originalDeposit) {
        console.log(
          "Deposit not found with ID:",
          depositId,
          "for user:",
          userId
        );
        return res.status(404).json({
          message: "Original deposit not found or not completed",
          depositId,
          userId: userId.toString(),
        });
      }

      // Allow multiple upgrades if specified
      if (originalDeposit.isUpgraded && !multipleUpgrades) {
        return res
          .status(400)
          .json({ message: "This deposit has already been upgraded. Enable multiple upgrades to continue." });
      }

      // Validate new package and amount
      const packagePrices = {
        "7th Stock Package": 192000,
        "6th Stock Package": 96000,
        "5th Stock Package": 48000,
        "4th Stock Package": 24000,
        "3rd Stock Package": 12000,
        "2nd Stock Package": 6000,
        "1st Stock Package": 3000,
      };

      if (!packagePrices[newPackage]) {
        return res.status(400).json({ message: "Invalid package selected" });
      }

      // For multiple upgrades, allow direct package purchase
      let expectedUpgradeAmount;
      if (multipleUpgrades) {
        expectedUpgradeAmount = packagePrices[newPackage];
      } else {
        expectedUpgradeAmount = packagePrices[newPackage] - packagePrices[originalDeposit.package];
      }
      
      if (parseInt(newAmount) !== expectedUpgradeAmount) {
        return res
          .status(400)
          .json({ message: "Amount does not match upgrade cost" });
      }

      // Check if new package is higher value than original (unless multiple upgrades)
      if (!multipleUpgrades && packagePrices[newPackage] <= packagePrices[originalDeposit.package]) {
        return res
          .status(400)
          .json({ message: "You can only upgrade to a higher value package" });
      }

      const upgradeAmount = expectedUpgradeAmount;

      // Validate merchant account
      const merchantAccount = await MerchantAccount.findById(merchantAccountId);
      if (!merchantAccount || !merchantAccount.isActive) {
        return res
          .status(400)
          .json({ message: "Invalid merchant account selected" });
      }

      // Create new deposit for the upgrade amount
      const upgradeDeposit = new Deposit({
        user: userId,
        amount: upgradeAmount,
        package: multipleUpgrades ? newPackage : `${newPackage} (Upgrade from ${originalDeposit.package})`,
        paymentMethod,
        merchantAccount: merchantAccountId,
        receiptUrl: req.file ? `/uploads/receipts/${req.file.filename}` : null,
        transactionReference,
        upgradedFrom: originalDeposit._id,
      });

      await upgradeDeposit.save();

      // Create package upgrade record
      const packageUpgrade = new PackageUpgrade({
        user: userId,
        originalDeposit: originalDeposit._id,
        upgradeDeposit: upgradeDeposit._id,
        fromPackage: originalDeposit.package,
        toPackage: newPackage,
        upgradeAmount: upgradeAmount,
        status: 'pending'
      });
      
      await packageUpgrade.save();

      // Mark original deposit as upgraded (if not multiple upgrades)
      if (!multipleUpgrades) {
        originalDeposit.isUpgraded = true;
        originalDeposit.upgradedTo = upgradeDeposit._id;
        await originalDeposit.save();
      }

      console.log("Upgrade deposit created successfully:", upgradeDeposit._id);
      // Send notification to admin
      await telegramService.sendToAdmin(
        `📈 ${multipleUpgrades ? 'Multiple package' : 'Package upgrade'} request:\n` +
          `User: ${req.user.fullName}\n` +
          `Original: ${originalDeposit.package} (${originalDeposit.amount.toLocaleString()} ETB)\n` +
          `${multipleUpgrades ? 'New package' : 'Upgrade to'}: ${newPackage} (${packagePrices[newPackage].toLocaleString()} ETB)\n` +
          `Upgrade amount: ${upgradeAmount.toLocaleString()} ETB\n` +
          `Payment: ${paymentMethod}\n` +
          `Reference: ${transactionReference || "N/A"}`
      );

      res.status(201).json({
        message: multipleUpgrades ? "Additional package request submitted successfully" : "Package upgrade request submitted successfully",
        upgradeDeposit,
        originalDeposit,
        upgradeAmount,
        packageUpgrade
      });
    } catch (error) {
      console.error("Upgrade deposit error:", error);
      console.error("Error details:", error.message);
      res
        .status(500)
        .json({ message: "Server error processing upgrade request" });
    }
  }
);

// Get upgradeable deposits for user
router.get("/upgradeable", async (req, res) => {
  try {
    const upgradeableDeposits = await Deposit.find({
      user: req.user._id,
      status: "completed",
    })
      .populate("merchantAccount")
      .sort({ createdAt: -1 });

    console.log("Found upgradeable deposits:", upgradeableDeposits.length);

    res.json({ upgradeableDeposits });
  } catch (error) {
    console.error("Get upgradeable deposits error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching upgradeable deposits" });
  }
});

module.exports = router;
