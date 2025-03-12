
import liveblocks from "@/lib/liveblocks";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/firebase-admin";

export async function POST(req: NextRequest) {
  const authInstance = await auth(); // Await the auth function
  const { sessionClaims, userId } = authInstance;

  // If no user is authenticated, return 401 Unauthorized
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { room } = await req.json();

  const session = liveblocks.prepareSession(sessionClaims?.email!, {
    userInfo: {
      name: sessionClaims?.fullName,
      email: sessionClaims?.email,
      avatar: sessionClaims?.image,
    },
  });

  const usersInRoom = await adminDb
    .collectionGroup("rooms")
    .where("userId", "==", sessionClaims?.email)
    .get();

  // Explicitly type 'doc' as QueryDocumentSnapshot
  const userInRoom = usersInRoom.docs.find((doc: QueryDocumentSnapshot) => doc.id === room);

  if (userInRoom?.exists) {
    session.allow(room, session.FULL_ACCESS);
    const { body, status } = await session.authorize();

    return new Response(body, { status });
  } else {
    return NextResponse.json(
      { message: "You are not in this room" },
      { status: 403 }
    );
  }
}
