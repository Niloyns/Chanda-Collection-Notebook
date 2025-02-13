require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const db = require("./config/mongoose");
const Contact = require("./models/contact");
const Total = require("./models/total"); // Import the total sum model

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));
// app.use(express.static(path.join(__dirname, "public")));

// Get contacts and total sum
app.get("/", async (req, res) => {
    try {
        const contacts = await Contact.find();
        const total = await Total.findOne(); // Fetch the total sum from the database
        const totalSum = total ? total.sum : 0;

        res.render("indexCopy", { title: "Pujor_Chanda", list: contacts, totalSum });
    } catch (error) {
        console.error("Error fetching contacts", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/admin", async (req, res) => {
    try {
        const contacts = await Contact.find();
        const total = await Total.findOne(); // Fetch the total sum from the database
        const totalSum = total ? total.sum : 0;

        res.render("index", { title: "Pujor_chanda", list: contacts, totalSum });
    } catch (error) {
        console.error("Error fetching contacts", error);
        res.status(500).send("Internal Server Error");
    }
});

// Add a new contact and update the total sum
app.post("/create-contact", async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        // Check if phone contains only numbers
        const isNumber = /^\d+$/.test(phone);
        
        const contactData = new Contact({ name, phone });
        await contactData.save();

        // Update total sum only if it's a number
        if (isNumber) {
            let total = await Total.findOne();
            if (!total) {
                total = new Total({ sum: 0 });
            }
            total.sum += parseInt(phone, 10);
            await total.save();
        }

        res.redirect("back");
    } catch (error) {
        console.error("Error creating contact", error);
        res.status(500).send("Internal Server Error");
    }
});


// Delete a contact and subtract its number from total sum
app.get("/delete-contact/:id", async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).send("Contact not found");
        }

        // Check if the phone value is a number before subtracting from the total
        const contactNumber = parseInt(contact.phone, 10);
        const isNumber = !isNaN(contactNumber);

        // Delete contact from database
        await Contact.findByIdAndDelete(req.params.id);

        // Update total sum only if phone was a valid number
        if (isNumber) {
            let total = await Total.findOne();
            if (total) {
                total.sum -= contactNumber;
                await total.save();
            }
        }

        res.redirect("back");
    } catch (error) {
        console.error("Error deleting contact", error);
        res.status(500).send("Internal Server Error");
    }
});


app.listen(10000, () => {
    console.log("✅ Server running on port 10000");
});
