"use client";

import React, { FormEvent, useTransition } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { inviteUserToDocument, removeUserFromDocument } from "@/actions/actions"; // ✅ Import the server action
import { toast } from "sonner";
import { Input } from "./ui/input";
import { useUser } from "@clerk/nextjs";
import useOwner from "@/lib/useOwner";
import { useRoom } from "@liveblocks/react/suspense";
import { collectionGroup, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useCollection } from "react-firebase-hooks/firestore";

function ManageUsers() {
    const {user} =useUser();
    const isOwner = useOwner();
    const room = useRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const [usersInRoom]=useCollection(
    user && query(collectionGroup(db, "rooms"),where("roomId","==",room.id))
  )

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      if (!user) return;
  
      const { success } = await removeUserFromDocument(room.id, userId);
  
      if (success) {
        toast.success("User removed from room successfully!");
      } else {
        toast.error("Failed to remove user from room!");
      }
    });
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger> User({usersInRoom?.docs.length})</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users with access</DialogTitle>
          <DialogDescription>
            Below is the list of users who have access to this document...
          </DialogDescription>
        </DialogHeader>
        <hr className="my-2"/>
        <div className="flex flex-col space-y-2">
  {usersInRoom?.docs.map((doc) => (
    <div
      key={doc.data().userId}
      className="flex items-center justify-between"
    >
      <p className="font-light">
        {doc.data().userId == user?.emailAddresses[0].toString()
          ? `You (${doc.data().userId})`
          : doc.data().userId}
      </p>

      <div className="flex items-center gap-2">
        <Button variant="outline">{doc.data().role}</Button>

        {isOwner &&
doc.data().userId !== user?.emailAddresses[0].toString() && (
  <Button
    variant="destructive"
    onClick={() => handleDelete(doc.data().userId)}
    disabled={isPending}
    size="sm"
  >
    {isPending ? "Removing..." : "X"}
  </Button>
)}
      </div>
    </div>
  ))}
</div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers;
