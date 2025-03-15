// src/lib/models.ts
import type { ObjectId } from "mongodb"

export interface Contact {
    _id?: ObjectId | string
    name: string
    email: string
    website?: string
    phone?: string
    country?: string
    tags?: string[]
    createdAt: Date
    updatedAt: Date
}

export interface EmailTemplate {
    _id?: ObjectId | string
    name: string
    subject: string
    content: string
    html: string
    createdAt: Date
    updatedAt: Date
}

export interface Broadcast {
    _id?: ObjectId | string
    templateId: ObjectId | string
    subject: string
    content: string
    html: string
    recipients: {
        type: "all" | "tags" | "custom"
        tags?: string[]
    }
    sentAt: Date
    stats: {
        total: number
        opens: number
        clicks: number
    }
}

export interface Tag {
    _id?: ObjectId | string
    name: string
    type: "business" | "country" | "custom"
    count: number
}

