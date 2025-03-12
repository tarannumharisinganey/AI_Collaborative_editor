'use client';
import Document from '@/components/Document';
import React, { useEffect, useState } from 'react';

function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const [docId, setDocId] = useState<string | null>(null);

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params; // Await the Promise
      setDocId(resolvedParams.id);
    }

    resolveParams();
  }, [params]);

  if (!docId) return <div>Loading...</div>; // Prevents errors before params resolve

  return (
    <div className='flex flex-col flex-1 min-h-screen'>
      <Document id={docId} />
    </div>
  );
}

export default DocumentPage;
