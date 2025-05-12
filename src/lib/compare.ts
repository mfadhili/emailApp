"use server"

import { getDb, ObjectId } from "@/lib/db"
import type { Contact, EmailTemplate, Broadcast, Tag } from "@/lib/models"
import { revalidatePath } from "next/cache"
import * as XLSX from "xlsx"

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

// Import/Export contacts
export async function importContacts(formData: FormData) {
    try {
        const file = formData.get("file") as File
        const country = formData.get("country") as string
        const tagsJson = formData.get("tags") as string
        const tags = JSON.parse(tagsJson) as string[]

        if (!file) {
            throw new Error("No file provided")
        }

        // Read the file as an array buffer
        const fileBuffer = await file.arrayBuffer()

        // Parse the Excel file
        const workbook = XLSX.read(fileBuffer, { type: "array" })

        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        // Convert the worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        if (jsonData.length === 0) {
            throw new Error("No data found in the file")
        }

        // Validate and transform the data
        const contacts: Omit<Contact, "_id" | "createdAt" | "updatedAt">[] = []
        const errors: { row: number; message: string }[] = []

        jsonData.forEach((row, index) => {
            // Check required fields
            if (!row.Name || !row.Email) {
                errors.push({ row: index + 2, message: "Missing required fields (Name or Email)" })
                return
            }

            // Create contact object
            const contact: Omit<Contact, "_id" | "createdAt" | "updatedAt"> = {
                name: row.Name,
                email: row.Email,
                phone: row.Phone || "",
                website: row.Website || "",
                country: row.Country || country || "",
                tags: tags || [],
            }

            contacts.push(contact)
        })

        // Insert valid contacts into the database
        const db = await getDb()
        const now = new Date()

        if (contacts.length > 0) {
            const result = await db.collection("contacts").insertMany(
                contacts.map((contact) => ({
                    ...contact,
                    createdAt: now,
                    updatedAt: now,
                })),
            )

            revalidatePath("/contacts")

            return {
                imported: result.insertedCount,
                errors: errors.length,
                errorDetails: errors,
            }
        }

        return { imported: 0, errors: errors.length, errorDetails: errors }
    } catch (error) {
        console.error("Error importing contacts:", error)
        throw new Error(`Failed to import contacts: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}

export async function exportContacts(contacts: Contact[]) {
    try {
        // Create worksheet from contacts
        const worksheet = XLSX.utils.json_to_sheet(
            contacts.map((contact) => ({
                Name: contact.name,
                Email: contact.email,
                Phone: contact.phone || "",
                Website: contact.website || "",
                Country: contact.country || "",
                Tags: (contact.tags || []).join(", "),
            })),
        )

        // Create workbook and add the worksheet
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts")

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

        // Convert to blob
        return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    } catch (error) {
        console.error("Error exporting contacts:", error)
        throw new Error("Failed to export contacts")
    }
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
    const db = await getDb()
    const now = new Date()
    const result = await db.collection("templates").insertOne({
        ...template,
        createdAt: now,
        updatedAt: now,
    })

    revalidatePath("/templates")
    return result.insertedId.toString()
}

export async function updateTemplate(
    id: string,
    template: Partial<Omit<EmailTemplate, "_id" | "createdAt" | "updatedAt">>,
) {
    const db = await getDb()
    const result = await db.collection("templates").updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...template,
                updatedAt: new Date(),
            },
        },
    )

    revalidatePath("/templates")
    return result.modifiedCount > 0
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
    revalidatePath("/tags")
    return result.insertedId.toString()
}

export async function deleteTag(id: string) {
    const db = await getDb()
    const result = await db.collection("tags").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/contacts")
    revalidatePath("/tags")
    return result.deletedCount > 0
}

// Helper function to replace personalization variables
function replacePersonalizationVars(content: string, contactData: Record<string, any>): string {
    if (!content) return content

    // Define mapping of variable names to contact data properties
    const variableMap: Record<string, string> = {
        "{{businessName}}": contactData.name || "",
        "{{email}}": contactData.email || "",
        "{{website}}": contactData.website || "",
        "{{country}}": contactData.country || "",
    }

    // Replace all variables in the content
    let result = content
    for (const [variable, value] of Object.entries(variableMap)) {
        result = result.replace(new RegExp(variable, "g"), value)
    }

    return result
}

// Email sending action with personalization support
export async function sendEmail({
                                    to,
                                    subject,
                                    text,
                                    html,
                                    from,
                                    contactData = {},
                                }: {
    to: string | string[]
    subject: string
    text: string
    html: string
    from: string
    contactData?: Record<string, any>
}) {
    try {
        // Replace personalization variables in subject, text, and HTML
        const personalizedSubject = replacePersonalizationVars(subject, contactData)
        const personalizedText = replacePersonalizationVars(text, contactData)
        let personalizedHtml = replacePersonalizationVars(html, contactData)

        // If HTML is empty or not provided, convert text to HTML with proper line breaks
        if (!personalizedHtml) {
            personalizedHtml = personalizedText
                .replace(/\n/g, "<br />")
                .replace(/\r/g, "")
                .split("<br />")
                .map((line) => `<p>${line || "&nbsp;"}</p>`)
                .join("")
        }

        // Wrap the HTML content with proper styling if it's not already wrapped
        if (!personalizedHtml.includes('<div style="font-family:')) {
            personalizedHtml = `<div style="font-family: Arial, sans-serif; padding: 10px; line-height: 1.6;">${personalizedHtml}</div>`
        }

        // Properly escape single quotes for JSON
        const escapedHtml = personalizedHtml.replace(/'/g, "\\'")

        const response = await fetch("http://localhost:5056/email/email/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to,
                subject: personalizedSubject,
                text: personalizedText,
                html: escapedHtml,
                from,
            }),
        })

        if (!response.ok) {
            throw new Error(`Failed to send email: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Error sending email:", error)
        throw error
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
