import { Contact } from "../models/Contact.js";

function formatContactResponse(c) {
  const lang = c.preferredLanguage || c.preferredListeningLanguage || "English";
  return {
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    preferredLanguage: lang,
    preferredListeningLanguage: lang,
    phone: c.phone || "",
    notes: c.notes || "",
    lastMeetingAt: c.lastMeetingAt ? c.lastMeetingAt.toISOString() : null,
    createdAt: c.createdAt ? c.createdAt.toISOString() : null,
    updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
  };
}

export async function getContacts(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const contacts = await Contact.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      contacts: contacts.map(formatContactResponse),
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Error fetching contacts." });
  }
}

export async function getContactById(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const contact = await Contact.findOne({ _id: id, ownerId: req.user._id });

    if (!contact) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }

    res.json({
      success: true,
      contact: formatContactResponse(contact),
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ success: false, message: "Error fetching contact." });
  }
}

export async function addContact(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name, email, preferredLanguage, preferredListeningLanguage, phone, notes } = req.body;
    const targetLanguage = preferredLanguage || preferredListeningLanguage;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: "Full name is required." });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ success: false, message: "Email address is required." });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ success: false, message: "Please enter a valid email address." });
      return;
    }

    if (!targetLanguage || !targetLanguage.trim()) {
      res.status(400).json({ success: false, message: "Preferred language is required." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate contact for this owner
    const existing = await Contact.findOne({
      ownerId: req.user._id,
      email: normalizedEmail,
    });

    if (existing) {
      res.status(409).json({ success: false, message: "Contact with this email already exists." });
      return;
    }

    const contact = await Contact.create({
      ownerId: req.user._id,
      name: name.trim(),
      email: normalizedEmail,
      preferredLanguage: targetLanguage.trim(),
      phone: phone ? phone.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Contact added successfully.",
      contact: formatContactResponse(contact),
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ success: false, message: "Unable to add contact." });
  }
}

export async function updateContact(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const contact = await Contact.findOne({ _id: id, ownerId: req.user._id });

    if (!contact) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }

    const { name, email, preferredLanguage, preferredListeningLanguage, phone, notes, lastMeetingAt } = req.body;
    const targetLanguage = preferredLanguage || preferredListeningLanguage;

    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({ success: false, message: "Full name is required." });
        return;
      }
      contact.name = name.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      const normalizedEmail = email.toLowerCase().trim();
      if (!emailRegex.test(normalizedEmail)) {
        res.status(400).json({ success: false, message: "Please enter a valid email address." });
        return;
      }

      if (normalizedEmail !== contact.email) {
        const existing = await Contact.findOne({
          ownerId: req.user._id,
          email: normalizedEmail,
          _id: { $ne: id },
        });

        if (existing) {
          res.status(409).json({ success: false, message: "Contact with this email already exists." });
          return;
        }
        contact.email = normalizedEmail;
      }
    }

    if (targetLanguage !== undefined) {
      if (!targetLanguage.trim()) {
        res.status(400).json({ success: false, message: "Preferred language is required." });
        return;
      }
      contact.preferredLanguage = targetLanguage.trim();
    }

    if (phone !== undefined) {
      contact.phone = phone.trim();
    }

    if (notes !== undefined) {
      contact.notes = notes.trim();
    }

    if (lastMeetingAt !== undefined) {
      contact.lastMeetingAt = lastMeetingAt ? new Date(lastMeetingAt) : null;
    }

    await contact.save();

    res.json({
      success: true,
      message: "Contact updated successfully.",
      contact: formatContactResponse(contact),
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ success: false, message: "Unable to update contact." });
  }
}

export async function deleteContact(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const result = await Contact.deleteOne({ _id: id, ownerId: req.user._id });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }

    res.json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ success: false, message: "Unable to delete contact." });
  }
}
