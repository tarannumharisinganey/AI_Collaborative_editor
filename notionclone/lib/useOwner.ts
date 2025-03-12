import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import { collectionGroup, query, where, QueryDocumentSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { RoomDocument } from "../types/types"; 

function useOwner() {
    const { user } = useUser();
    const room = useRoom();
    const [isOwner, setIsOwner] = useState(false);
    
    const [snapshot, loading, error] = useCollection(
        user && query(collectionGroup(db, "rooms"), where("roomId", "==", room.id))
    );

    useEffect(() => {
        if (snapshot && !loading && snapshot.docs.length > 0) {
            const owners = snapshot.docs.filter((doc: QueryDocumentSnapshot) => {
                const data = doc.data() as RoomDocument; // Typecasting to RoomDocument
                return data.role === "owner";
            });

            if (
                owners.some((owner: QueryDocumentSnapshot) => {
                    const data = owner.data() as RoomDocument;
                    return data.userId === user?.emailAddresses[0].toString();
                })
            ) {
                setIsOwner(true);
            }
        }
    }, [snapshot, loading, user]);

    return isOwner;
}

export default useOwner;
