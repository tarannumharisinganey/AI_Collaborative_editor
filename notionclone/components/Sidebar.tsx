"use client";
import React, { useEffect, useState } from "react";
import NewDocumentButton from "./NewDocumentButton";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collectionGroup, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import SidebarOptions from "./ui/SidebarOptions";
import { RoomDocument } from "../types/types";

function Sidebar() {
    const { user } = useUser();
    const [groupedData, setGroupedData] = useState<{
        owner: RoomDocument[];
        editor: RoomDocument[];
    }>({
        owner: [],
        editor: [],
    });

    const [data, loading, error] = useCollection(
        user &&
            query(
                collectionGroup(db, "rooms"),
                where("userId", "==", user.emailAddresses[0]?.toString())
            )
    );

    useEffect(() => {
        if (!data) return;
        const grouped = data.docs.reduce<{
            owner: RoomDocument[];
            editor: RoomDocument[];
        }>(
            (acc, curr) => {
                const roomData = curr.data() as RoomDocument;
                if (roomData.role === "owner") {
                    acc.owner.push({
                        id: curr.id,
                        ...roomData,
                    });
                } else {
                    acc.editor.push({
                        id: curr.id,
                        ...roomData,
                    });
                }
                return acc;
            },
            {
                owner: [],
                editor: [],
            }
        );
        setGroupedData(grouped);
    }, [data]);

    const menuOptions = (
        <>
            <NewDocumentButton />
            <div className="flex py-4 flex-col space-y-4 md:max-w-36">
                {/* MY DOCUMENTS */}
                {groupedData.owner.length === 0 ? (
                    <h2 className="text-gray-500 font-semibold text-sm">
                        No documents found
                    </h2>
                ) : (
                    <>
                        <h2 className="text-pink-600 font-semibold text-sm">
                            My Documents
                        </h2>
                        {groupedData.owner
                            .filter((doc) => doc.id !== undefined) // Ensure ID exists
                            .map((doc) => (
                                <SidebarOptions
                                    key={doc.id}
                                    id={doc.id!}
                                    href={`/doc/${doc.id}`}
                                />
                            ))}
                    </>
                )}
            
            {/* shared with me */}
            {groupedData.editor.length > 0 && (
                <>
                <h2 className="text-pink-600 font-semibold text-sm">
                    Shared With Me
                </h2>
                {groupedData.owner
                    .filter((doc) => doc.id !== undefined) // Ensure ID exists
                    .map((doc) => (
                        <SidebarOptions
                            key={doc.id}
                            id={doc.id!}
                            href={`/doc/${doc.id}`}
                        />
                    ))}
            </>

            )}
            </div>
        </>
    );

    return (
        <div className="p-2 md:p-5 bg-pink-300 relative">
            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger>
                        <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40} />
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <div>{menuOptions}</div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:inline">{menuOptions}</div>
        </div>
    );
}

export default Sidebar;
