"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle, X } from "lucide-react";
import BondCard from "@/components/BondCard";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CardSkeletonGrid from "./Skeleton";

type Card = {
  _id: string;
  name: string;
  totalBond: number;
  totalWin: number;
};

export default function HomePage() {
  const [hasCards, setHasCards] = useState(false);
  const [cardName, setCardName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/card");
      const json = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch cards", json.message);
        setCards([]);
        setHasCards(false);
        return;
      }

      setCards(json.data.cards);
      setHasCards(json.data.cards.length > 0);
    } catch (err) {
      console.error("Failed to fetch cards", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (close: () => void) => {
    if (!cardName.trim()) return alert("Please enter a card name.");

    try {
      const res = await fetch("/api/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cardName }),
      });

      const json = await res.json();

      if (res.ok) {
        setCards((prev) => [...prev, json.data.card]);
        setHasCards(true);
        toast.success("Card created successfully!");
        setCardName("");
        close();
      } else {
        toast.error(json.message || "Failed to create card");
      }
    } catch (error) {
      console.error("Error creating card", error);
    }
  };

  const handleAddBond = async (cardId: string, bondNumber: string) => {
    try {
      const res = await fetch(`/api/card/${cardId}/bonds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: bondNumber }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "Failed to add bond");
        return;
      }

      const updatedCard = json.data.card;

      setCards((prev) =>
        prev.map((card) => (card._id === cardId ? updatedCard : card))
      );
    } catch (err) {
      console.error("Error adding bond:", err);
      alert("Error adding bond.");
    }
  };

  const onEditCard = async (cardId: string, newName: string) => {
    setIsLoading(true);
    const res = await fetch(`/api/card/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
      headers: { "Content-Type": "application/json" },
    });

    let data;
    try {
      data = await res.json();
    } catch (err) {
      // console.error("Failed to parse response:", err);
      toast.error("Failed to edit card");
      return;
    } finally {
      setIsLoading(false);
    }

    if (!res.ok) {
      // console.error("Failed to edit card:", data.message);
      toast.error(data.message || "Failed to edit card");
      return;
    }
    toast.success("Card edited successfully!");
    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === cardId ? { ...card, name: newName } : card
      )
    );
  };

  const onDeleteCard = async (cardId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/card/${cardId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to delete card");
      }
      setCards((prev) => prev.filter((card) => card._id !== cardId));
      toast.success("Card deleted successfully!");
    } catch (error) {
      console.error("Delete card error:", error);
      toast.error("Failed to delete card.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  if (loading) {
    return <CardSkeletonGrid />;
  }

  if (!hasCards) {
    return <div>No cards found.</div>;
  }

  return (
    <>
      {hasCards && (
        <div className="fixed top-30 right-50 z-50">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Add More Card
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Card</DialogTitle>
                <DialogClose asChild>
                  <button
                    aria-label="Close"
                    className="absolute top-3 right-3 rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </DialogClose>
              </DialogHeader>

              <Input
                type="text"
                placeholder="Enter card name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mb-4"
              />

              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>

                <DialogClose asChild>
                  <Button onClick={() => handleCreate(() => setCardName(""))}>
                    Create
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {!hasCards ? (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <h2 className="text-2xl font-semibold">No Cards Yet</h2>
              <p className="text-muted-foreground text-sm mt-1">
                You haven't created any bond cards yet.
              </p>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full flex gap-2 justify-center">
                    <PlusCircle className="w-5 h-5" />
                    Create Your First Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Card</DialogTitle>
                    <DialogClose asChild>
                      <button
                        aria-label="Close"
                        className="absolute top-3 right-3 rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </DialogClose>
                  </DialogHeader>

                  <Input
                    type="text"
                    placeholder="Enter card name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mb-4"
                  />

                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <DialogClose asChild>
                      <Button
                        onClick={() => handleCreate(() => setCardName(""))}
                      >
                        Create
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
          <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
            {cards.map(({ _id, name, totalBond, totalWin }) => (
              <div key={_id} className="min-w-[280px]">
                <BondCard
                  cardId={_id}
                  name={name}
                  totalBond={totalBond}
                  totalWin={totalWin}
                  onAddBond={handleAddBond}
                  onDeleteCard={onDeleteCard}
                  onEditCard={onEditCard}
                  loading={isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
