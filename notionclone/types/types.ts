export type User = {
    fullName: string;
    email: string;
    image: string;
};
export type RoomDocument = {
    id?: string;
    role: "owner" | "editor";
    userId: string;
    [key: string]: any; // Allows additional properties
};