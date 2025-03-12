'use client';
import React, { FormEvent, useEffect, useState, useTransition } from 'react';
import { Input } from './ui/input';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from './ui/button';
import useOwner from '@/lib/useOwner';
import Editor from './ui/Editor';
import DeleteDocument from './DeleteDocument';
import InviteUsers from './InviteUsers';
import ManageUsers from './ManageUsers';
import Avatars from './Avatars';
function Document({ id }: { id: string }) {
    const [input, setInput] = useState('');
    const [data, loading, error] = useDocumentData(doc(db, 'documents', id));
    const [isUpdating, startTransition] = useTransition();
    

    useEffect(() => {
        if (data && data.title) {
            setInput(data.title);
        }
    }, [data]);

    const updateTitle = async (e: FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            startTransition(async () => {
                try {
                    await updateDoc(doc(db, 'documents', id), { title: input });
                    console.log('Document updated successfully');
                } catch (error) {
                    console.error('Error updating document:', error);
                }
            });
        }
    };

    if (loading) return <div>Loading document...</div>;
    if (error) return <div>Error loading document.</div>;

    return (
        <div className='flex-1 h-full bg-white p-5'>
            <div className='flex max-w-6xl mx-auto justify-between pb-5'>
                {/* Title Update Form */}
                <form className='flex flex-1 space-x-2' onSubmit={updateTitle}>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button disabled={isUpdating} type="submit">
                        {isUpdating ? 'Updating...' : 'Update'}
                    </Button>
                </form>

                {/* Owner-Only Actions */}
                <div className="flex space-x-2">
                        <InviteUsers />
                        <DeleteDocument />
                    </div>
            </div>

            <div className='flex max-w-6xl mx-auto justify-between items-center mb-5'>
                {/* Manage Users */}
                <ManageUsers />

                {/* Avatars */}
                <Avatars />
            </div>

            <hr className='pb-10' />

            {/* Collaborative Editor */}
            <Editor />
        </div>
    );
}

export default Document;