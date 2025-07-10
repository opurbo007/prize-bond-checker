"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BondCardProps {
  cardId: string;
  name: string;
  totalBond: number;
  totalWin: number;
  onAddBond: (cardId: string, bondNumber: string) => Promise<void>;
  onEditCard: (cardId: string, newName: string) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
  loading?: boolean;
}

export default function BondCard({
  cardId,
  name,
  totalBond,
  totalWin,
  onAddBond,
  onEditCard,
  onDeleteCard,
  loading,
}: BondCardProps) {
  const [bondInput, setBondInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(name);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleAddBond = async () => {
    const trimmed = bondInput.trim();
    if (!trimmed) return;

    setIsLoading(true);
    await onAddBond(cardId, trimmed);
    setBondInput("");
    setIsLoading(false);
  };

  const handleEditSave = async () => {
    await onEditCard(cardId, editName);
    setIsEditOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteCard(cardId);
    setIsDeleteOpen(false);
  };

  return (
    <div
      className="
      relative
      bg-white rounded-xl border-4 border-black/60 p-6 flex flex-col justify-between 
      shadow-2xl mx-auto 
      transition-all duration-300 
      hover:shadow-[0_20px_30px_rgba(0,0,0,0.3)] 
      hover:-translate-y-2 hover:scale-[1.03] 
      will-change-transform
    "
    >
      {/* Dropdown menu in top-right corner */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Open menu"
              className="p-1 rounded hover:bg-gray-200 active:bg-gray-300"
            >
              {/* 3 dots icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onSelect={() => setIsDeleteOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-black mb-5">{name}</h3>
        <div className="flex justify-between mb-6 text-gray-700 font-medium">
          <div>
            <p className="uppercase text-xs tracking-widest mb-1">
              Total Bonds
            </p>
            <p className="text-lg">{totalBond}</p>
          </div>
          <div>
            <p className="uppercase text-xs tracking-widest mb-1">Total Wins</p>
            <p className="text-lg">{totalWin}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Quick add bond #"
            value={bondInput}
            disabled={isLoading}
            onChange={(e) => setBondInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddBond();
              }
            }}
            className="bg-gray-50 border-gray-300 text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black rounded-md"
          />
          <Button
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white rounded-md"
            onClick={handleAddBond}
            disabled={isLoading}
          >
            Add
          </Button>
        </div>
      </div>

      <Link href={`/cards/${cardId}`}>
        <Button
          variant="ghost"
          className="mt-6 w-full bg-black text-white hover:bg-black/60 hover:text-white rounded-md font-semibold"
        >
          Details
        </Button>
      </Link>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card Name</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            className="mb-4"
          />
          <DialogFooter>
            <Button
              disabled={loading}
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editName.trim() === ""}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loading}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={loading} onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
