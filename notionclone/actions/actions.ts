"use server";

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Ensure the user exists in Firestore before proceeding
 */
async function getUserData(userId: string) {
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
        console.error(`User not found in Firestore: ${userId}`);
        throw new Error("User not found");
    }

    const userData = userSnap.data();
    if (!userData?.email) {
        console.error(`User email not found in Firestore: ${userId}`);
        throw new Error("User email not found");
    }

    return userData;
}

/**
 * Create a new document and add the user as the owner
 */
export async function createNewDocument() {
    const authData = await auth();
    if (!authData?.userId) throw new Error("Unauthorized");

    const userId = authData.userId;
    const userData = await getUserData(userId);

    // Create new document
    const docRef = await adminDb.collection("documents").add({
        title: "New Doc",
        owner: userId,
        createdAt: new Date(),
    });

    // Add user to the document's room
    await adminDb
        .collection("users")
        .doc(userId)
        .collection("rooms")
        .doc(docRef.id)
        .set({
            userId,
            role: "owner",
            createdAt: new Date(),
            roomId: docRef.id,
        });

    return { docId: docRef.id };
}

/**
 * Delete a document and remove all associated user room references
 */
export async function deleteDocument(roomId: string) {
    const authInstance = await auth();
    if (!authInstance?.userId) throw new Error("Unauthorized");

    try {
        await adminDb.collection("documents").doc(roomId).delete();

        const query = await adminDb
            .collectionGroup("rooms")
            .where("roomId", "==", roomId)
            .get();

        const batch = adminDb.batch();
        query.docs.forEach((doc) => batch.delete(doc.ref));

        await batch.commit();
        await liveblocks.deleteRoom(roomId);

        return { success: true };
    } catch (error) {
        console.error("Error deleting document:", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Invite a user to a document by their email
 */
export async function inviteUserToDocument(roomId: string, email: string) {
    try {
        const authData = await auth();
        if (!authData?.userId) throw new Error("Unauthorized");

        // Find user by email
        const userQuery = await adminDb
            .collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (userQuery.empty) {
            console.error(`User with email ${email} not found.`);
            return { success: false, error: "User not found" };
        }

        const userId = userQuery.docs[0].id;

        await adminDb
            .collection("users")
            .doc(userId)
            .collection("rooms")
            .doc(roomId)
            .set({
                userId,
                role: "editor",
                createdAt: new Date(),
                roomId,
            });

        revalidatePath(`/rooms/${roomId}`);
        return { success: true };
    } catch (error) {
        console.error("Error inviting user:", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Remove a user from a document
 */
export async function removeUserFromDocument(roomId: string, email: string) {
    const authData = await auth();
    if (!authData?.userId) throw new Error("Unauthorized");

    try {
        // Find user by email
        const userQuery = await adminDb
            .collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (userQuery.empty) {
            console.error(`User with email ${email} not found.`);
            return { success: false, error: "User not found" };
        }

        const userId = userQuery.docs[0].id;

        await adminDb
            .collection("users")
            .doc(userId)
            .collection("rooms")
            .doc(roomId)
            .delete();

        return { success: true };
    } catch (error) {
        console.error("Error removing user:", error);
        return { success: false, error: (error as Error).message };
    }
}
