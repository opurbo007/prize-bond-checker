"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";

import LoadingSkeleton from "./Skeleton";
import NotFound from "./NotFound";
interface PrizeBond {
  _id: string;
  number: string;
  purchaseDate: string;
  status: "win" | "sell" | "hold";
}

interface CardData {
  _id: string;
  name: string;
  prizeBonds: PrizeBond[];
}

interface Props {
  cardId: string;
}

export default function CardDetails({ cardId }: Props) {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBondIds, setSelectedBondIds] = useState<Set<string>>(
    new Set()
  );
  const [search, setSearch] = useState("");
  const [editBond, setEditBond] = useState<PrizeBond | null>(null);
  const [editForm, setEditForm] = useState({
    number: "",
    purchaseDate: "",
    status: "hold" as "hold" | "sell" | "win",
  });
  const [bondInput, setBondInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchCardDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/card/${cardId}/bonds`);
      const json = await res.json();
      if (res.ok) {
        setCard(json.data.card);
      } else {
        toast.error(json.message || "Failed to load card details");
      }
    } catch (err) {
      toast.error("Error loading card details");
      console.error("Error fetching card details:", err);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  const handleDeleteSelected = async () => {
    setIsLoading(true);
    if (!card) return;
    try {
      const bondIdsToDelete = Array.from(selectedBondIds);
      for (const bondId of bondIdsToDelete) {
        await fetch(`/api/card/${cardId}/bonds/${bondId}`, {
          method: "DELETE",
        });
      }
      setCard({
        ...card,
        prizeBonds: card.prizeBonds.filter(
          (bond) => !selectedBondIds.has(bond._id)
        ),
      });
      setSelectedBondIds(new Set());
      toast.success("Selected bonds deleted successfully!");
    } catch (err) {
      console.error("Batch delete error:", err);
      toast.error("Failed to delete selected bonds. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBond = async () => {
    setIsLoading(true);
    if (!editBond) return;
    try {
      const res = await fetch(`/api/card/${cardId}/bonds/${editBond._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (res.ok) {
        setCard((prev) =>
          prev
            ? {
                ...prev,
                prizeBonds: prev.prizeBonds.map((bond) =>
                  bond._id === editBond._id ? { ...bond, ...editForm } : bond
                ),
              }
            : prev
        );
        setEditBond(null);
        toast.success("Updated successfully!");
      } else {
        toast.error(json.message || "Failed to update bond. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating bond. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBond = async () => {
    const number = bondInput.trim();

    if (!number) {
      toast.error("Please enter a bond number.");
      return;
    }

    if (!/^\d+$/.test(number)) {
      toast.error("Bond number must contain only digits.");
      return;
    }

    if (!card) return;

    const isDuplicate = card.prizeBonds.some((bond) => bond.number === number);
    if (isDuplicate) {
      toast.error("This bond number already exists.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/card/${cardId}/bonds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || "Failed to add bond");
        return;
      }

      console.log("Bond added from server:", json.data.bond);
      await fetchCardDetails();

      setBondInput("");
      toast.success("Bond added successfully!");
    } catch (err) {
      console.error("Error adding bond:", err);
      toast.error("Error adding bond. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCardDetails();
  }, [fetchCardDetails]);

  const columns: ColumnDef<PrizeBond>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          disabled={isLoading}
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const newSet = new Set(
              value ? card?.prizeBonds.map((b) => b._id) : []
            );
            setSelectedBondIds(newSet);
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          disabled={isLoading}
          checked={selectedBondIds.has(row.original._id)}
          onCheckedChange={(checked) => {
            const copy = new Set(selectedBondIds);
            if (checked) {
              copy.add(row.original._id);
            } else {
              copy.delete(row.original._id);
            }
            setSelectedBondIds(copy);
          }}
        />
      ),
    },
    {
      accessorKey: "number",
      header: "Bond Number",
    },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      cell: ({ row }) =>
        new Date(row.original.purchaseDate).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status.charAt(0).toUpperCase() +
        row.original.status.slice(1),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => {
            setEditBond(row.original);
            setEditForm({
              number: row.original.number,
              purchaseDate: row.original.purchaseDate.slice(0, 10),
              status: row.original.status,
            });
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }
  if (!card) {
    return <NotFound />;
  }

  const filteredBonds = card.prizeBonds.filter((bond) =>
    bond.number.includes(search)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto ">
      <h1 className="text-3xl font-bold mb-2 tracking-wide">{card.name}</h1>
      <div className="text-gray-700 mb-6 space-y-1">
        <p>
          Total Bonds: <strong>{card.prizeBonds.length}</strong>
        </p>
        <div className="text-sm text-gray-600 flex gap-4 flex-wrap">
          <span>
            Hold:{" "}
            <strong>
              {card.prizeBonds.filter((b) => b.status === "hold").length}
            </strong>
          </span>
          <span>
            Win:{" "}
            <strong>
              {card.prizeBonds.filter((b) => b.status === "win").length}
            </strong>
          </span>
          <span>
            Sell:{" "}
            <strong>
              {card.prizeBonds.filter((b) => b.status === "sell").length}
            </strong>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex space-x-2 justify-center items-center">
          <Input
            type="text"
            placeholder="Search by bond number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border-2 border-gray-400 shadow-sm"
          />

          <div className="flex gap-3">
            <Input
              placeholder="Quick add bond #"
              value={bondInput}
              disabled={isLoading}
              onChange={(e) => setBondInput(e.target.value)}
              className="border-2 border-gray-400"
            />
            <Button
              variant="outline"
              className="border border-gray-500 shadow-sm"
              onClick={handleAddBond}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
        {selectedBondIds.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isLoading}
                variant="destructive"
                className="mt-2 sm:mt-0"
              >
                Delete Selected ({selectedBondIds.size})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete selected bonds?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove {selectedBondIds.size} bond
                  {selectedBondIds.size > 1 ? "s" : ""}. Are you sure you want
                  to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected}>
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <DataTable columns={columns} data={filteredBonds} />

      {editBond && (
        <Dialog
          open={!!editBond}
          onOpenChange={(open) => !open && setEditBond(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Bond</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="text"
                value={editForm.number}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, number: e.target.value }))
                }
                placeholder="Bond Number"
              />
              <div className="flex justify-center items-center space-x-5">
                <Input
                  type="date"
                  value={editForm.purchaseDate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, purchaseDate: e.target.value }))
                  }
                />
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm((f) => ({
                      ...f,
                      status: value as "hold" | "sell" | "win",
                    }))
                  }
                >
                  <SelectTrigger
                    className={`w-full capitalize ${
                      editForm.status === "hold"
                        ? "text-green-700"
                        : editForm.status === "win"
                        ? "text-yellow-500"
                        : editForm.status === "sell"
                        ? "text-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-green-700" value="hold">
                      Hold
                    </SelectItem>
                    <SelectItem className="text-yellow-500" value="win">
                      Win
                    </SelectItem>
                    <SelectItem className="text-red-500" value="sell">
                      Sell
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                disabled={isLoading}
                variant="outline"
                onClick={() => setEditBond(null)}
              >
                Cancel
              </Button>
              <Button disabled={isLoading} onClick={handleUpdateBond}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
