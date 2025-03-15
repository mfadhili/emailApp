"use server"
// emailer/src/lib/actions.ts
import { getDb, ObjectId } from "@/lib/db"
import type { Contact, EmailTemplate, Broadcast, Tag } from "@/lib/models"
import he from "he"; // Install using: npm install he
import { revalidatePath } from "next/cache"
// Helper function to serialize MongoDB documents

function serialize<T>(data: any): T {
    return JSON.parse(JSON.stringify(data)) as T
}
// Contact actions

export async function getContacts() {
    const db = await getDb()
    const contacts = await db.collection("contacts").find({}).sort({ createdAt: -1 }).toArray()
    return serialize<Contact[]>(contacts)
}

export async function getContactById(id: string) {
    const db = await getDb()
    const contact = await db.collection("contacts").findOne({ _id: new ObjectId(id) })
    return contact ? serialize<Contact>(contact) : null
}

export async function createContact(contact: Omit<Contact, "_id" | "createdAt" | "updatedAt">) {
    const db = await getDb()
    const now = new Date()
    const result = await db.collection("contacts").insertOne({
        ...contact,
        createdAt: now,
        updatedAt: now,
    })

    revalidatePath("/contacts")
    // Return string ID instead of ObjectId
    return result.insertedId.toString()
}

export async function updateContact(id: string, contact: Partial<Omit<Contact, "_id" | "createdAt" | "updatedAt">>) {
    const db = await getDb()
    const result = await db.collection("contacts").updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...contact,
                updatedAt: new Date(),
            },
        },
    )

    revalidatePath("/contacts")
    return result.modifiedCount > 0
}

export async function deleteContact(id: string) {
    const db = await getDb()
    const result = await db.collection("contacts").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/contacts")
    return result.deletedCount > 0
}
// Template actions

export async function getTemplates() {
    const db = await getDb()
    const templates = await db.collection("templates").find({}).sort({ createdAt: -1 }).toArray()
    return serialize<EmailTemplate[]>(templates)
}

export async function getTemplateById(id: string) {
    const db = await getDb()
    const template = await db.collection("templates").findOne({ _id: new ObjectId(id) })
    return template ? serialize<EmailTemplate>(template) : null
}

export async function createTemplate(template: Omit<EmailTemplate, "_id" | "createdAt" | "updatedAt">) {
    const db = await getDb();
    const now = new Date();

    // Ensure stored HTML is decoded before inserting
    const result = await db.collection("templates").insertOne({
        ...template,
        html: he.decode(template.html), // Decode any escaped HTML before saving
        createdAt: now,
        updatedAt: now,
    });

    revalidatePath("/templates");
    return result.insertedId.toString();
}

export async function updateTemplate(
    id: string,
    template: Partial<Omit<EmailTemplate, "_id" | "createdAt" | "updatedAt">>,
) {
    const db = await getDb();

    const result = await db.collection("templates").updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...template,
                html: he.decode(template.html), // Decode before updating
                updatedAt: new Date(),
            },
        }
    );

    revalidatePath("/templates");
    return result.modifiedCount > 0;
}

export async function deleteTemplate(id: string) {
    const db = await getDb()
    const result = await db.collection("templates").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/templates")
    return result.deletedCount > 0
}

// Broadcast actions
export async function getBroadcasts() {
    const db = await getDb()
    const broadcasts = await db.collection("broadcasts").find({}).sort({ sentAt: -1 }).toArray()
    return serialize<Broadcast[]>(broadcasts)
}

export async function getBroadcastById(id: string) {
    const db = await getDb()
    const broadcast = await db.collection("broadcasts").findOne({ _id: new ObjectId(id) })
    return broadcast ? serialize<Broadcast>(broadcast) : null
}

export async function createBroadcast(broadcast: Omit<Broadcast, "_id">) {
    // Convert any ObjectId to string before inserting
    const serializedBroadcast = {
        ...broadcast,
        templateId: broadcast.templateId instanceof ObjectId ? broadcast.templateId.toString() : broadcast.templateId,
    }

    const db = await getDb()
    const result = await db.collection("broadcasts").insertOne(serializedBroadcast)

    revalidatePath("/broadcasts")
    return result.insertedId.toString()
}

// Tag actions
export async function getTags() {
    const db = await getDb()
    const tags = await db.collection("tags").find({}).sort({ name: 1 }).toArray()
    return serialize<Tag[]>(tags)
}

export async function createTag(tag: Omit<Tag, "_id">) {
    const db = await getDb()
    const result = await db.collection("tags").insertOne(tag)

    revalidatePath("/contacts")
    return result.insertedId.toString()
}

function replacePersonalizationVars(content: string, contactData: Record<string, any>): string {
    if (!content) return content;

    const variableMap: Record<string, string> = {
        "{{businessName}}": contactData.name || "",
        "{{email}}": contactData.email || "",
        "{{website}}": contactData.website || "",
        "{{country}}": contactData.country || "",
    };

    // Ensure no double escaping occurs
    let result = content;
    for (const [variable, value] of Object.entries(variableMap)) {
        result = result.replace(new RegExp(variable, "g"), value);
    }

    return result;
}




// Email sending action with personalization support
function cleanHtml(html: string): string {
    // Decode the HTML (in case it's stored as escaped HTML in the DB)
    let cleanedHtml = he.decode(html);

    // Remove extra `<br>` tags
    cleanedHtml = cleanedHtml.replace(/<br\s*\/?>\s*<br\s*\/?>/g, "<br>");

    // Remove `<pre>` wrapping if present
    cleanedHtml = cleanedHtml.replace(/<pre>(.*?)<\/pre>/gs, "$1");

    // Trim unnecessary whitespace
    cleanedHtml = cleanedHtml.trim();

    return cleanedHtml;
}

export async function sendEmail({
                                    to,
                                    subject,
                                    text,
                                    html,
                                    from,
                                    contactData = {},
                                }: {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    from: string;
    contactData?: Record<string, any>;
}) {
    try {
        console.log("Raw HTML before cleanup:", html);

        // Clean up the HTML to remove unnecessary <br> and <pre> tags
        let cleanedHtml = cleanHtml(html);

        console.log("Cleaned HTML before sending:", cleanedHtml);

        // Replace personalization variables
        const personalizedSubject = replacePersonalizationVars(subject, contactData);
        const personalizedText = replacePersonalizationVars(text, contactData);
        let personalizedHtml = replacePersonalizationVars(cleanedHtml, contactData);

        console.log("Final HTML before sending:", personalizedHtml);

        const emailPayload = {
            to,
            subject: personalizedSubject,
            text: personalizedText,
            html: personalizedHtml,
            from,
        };

        console.log("Final Payload Before Sending:", emailPayload);

        const response = await fetch("http://localhost:5056/email/email/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}


// Send broadcast to contacts with personalization
export async function sendBroadcast(templateId: string, recipients: { type: "all" | "tags"; tags?: string[] }) {
    const db = await getDb()

    // Get the template
    const template = await getTemplateById(templateId)
    if (!template) {
        throw new Error("Template not found")
    }

    // Get contacts based on recipient type
    let contactsQuery = {}
    if (recipients.type === "tags" && recipients.tags && recipients.tags.length > 0) {
        contactsQuery = { tags: { $in: recipients.tags } }
    }

    const contactsData = await db.collection("contacts").find(contactsQuery).toArray()
    const contacts = serialize<Contact[]>(contactsData)

    if (contacts.length === 0) {
        throw new Error("No contacts found for the selected criteria")
    }

    // Create the broadcast record with string ID instead of ObjectId
    const broadcast: Omit<Broadcast, "_id"> = {
        templateId: templateId, // Use string ID
        subject: template.subject,
        content: template.content,
        html: template.html,
        recipients,
        sentAt: new Date(),
        stats: {
            total: contacts.length,
            opens: 0,
            clicks: 0,
        },
    }

    const broadcastId = await createBroadcast(broadcast)

    // Send emails to all contacts with personalization
    const emailPromises = contacts.map((contact) => {
        return sendEmail({
            to: contact.email,
            subject: template.subject,
            text: template.content,
            html: template.html,
            from: "support@chattflow.com", // This should be configurable
            contactData: {
                name: contact.name,
                email: contact.email,
                website: contact.website || "",
                country: contact.country || "",
            },
        })
    })

    await Promise.all(emailPromises)

    revalidatePath("/broadcasts")
    return broadcastId
}

// Send email to specific contacts (for direct sending from contacts page)
export async function sendEmailToContacts(templateId: string, contactIds: string[]) {
    const db = await getDb()

    // Get the template
    const template = await getTemplateById(templateId)
    if (!template) {
        throw new Error("Template not found")
    }

    // Get the selected contacts
    const contactsData = await db
        .collection("contacts")
        .find({
            _id: { $in: contactIds.map((id) => new ObjectId(id)) },
        })
        .toArray()

    const contacts = serialize<Contact[]>(contactsData)

    if (contacts.length === 0) {
        throw new Error("No contacts found with the provided IDs")
    }

    // Create a temporary broadcast record
    const broadcast: Omit<Broadcast, "_id"> = {
        templateId: templateId,
        subject: template.subject,
        content: template.content,
        html: template.html,
        recipients: {
            type: "custom",
            tags: [], // Not using tags for direct selection
        },
        sentAt: new Date(),
        stats: {
            total: contacts.length,
            opens: 0,
            clicks: 0,
        },
    }

    const broadcastId = await createBroadcast(broadcast)

    // Send emails to selected contacts with personalization
    const emailPromises = contacts.map((contact) => {
        return sendEmail({
            to: contact.email,
            subject: template.subject,
            text: template.content,
            html: template.html,
            from: "support@chattflow.com", // This should be configurable
            contactData: {
                name: contact.name,
                email: contact.email,
                website: contact.website || "",
                country: contact.country || "",
            },
        })
    })

    await Promise.all(emailPromises)

    revalidatePath("/broadcasts")
    return broadcastId
}

