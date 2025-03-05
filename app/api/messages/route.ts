import clientPromise from './mongoDB';
import { NextResponse } from 'next/server';

interface ConversationEntry {
    key: string;
    value: string;
}

export async function POST(request: Request) {
    try {
        const conversationEntries: ConversationEntry[] = await request.json();

        if (!Array.isArray(conversationEntries)) {
            return NextResponse.json(
                { message: 'Request body must be an array' },
                { status: 400 }
            );
        }

        for (const entry of conversationEntries) {
            if (typeof entry.key !== 'string' || typeof entry.value !== 'string') {
                return NextResponse.json(
                    { message: 'Invalid conversation entry format' },
                    { status: 400 }
                );
            }
        }

        const client = await clientPromise;
        const db = client.db('IndianBaazaar');

        const result = await db.collection('messages').insertOne({
            conversation: conversationEntries,
            createdAt: new Date(),
        });

        return NextResponse.json({
            message: 'Conversation saved successfully',
            id: result.insertedId.toString(),
        });
    } catch (error) {
        console.error('Error saving conversation:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}