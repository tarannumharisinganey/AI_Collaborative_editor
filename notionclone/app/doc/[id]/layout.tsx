"use client"; // Convert to client component

import RoomProvider from "@/components/RoomProvider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function DocLayout({ children }: { children: React.ReactNode }) {
  const params = useParams(); // Get params dynamically in the client
  const { userId } = useAuth(); // Use client-side auth
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      setId(params.id as string);
    }
  }, [params]);

  if (!id) {
    return <div>Error: Document ID is missing.</div>;
  }

  if (!userId) {
    return <div>Please log in to view this content.</div>;
  }

  return (
    <div>
      <RoomProvider roomId={id}>{children}</RoomProvider>
    </div>
  );
}
